// api/resend-webhook.js
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { createHmac } from 'crypto';

// ── Firebase Admin init ───────────────────────────────────────────────────────
if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
}

const db = getDatabase();

// ── Read raw body ─────────────────────────────────────────────────────────────
const getRawBody = (req) => new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
});

// ── Verify Resend webhook signature (no svix — pure Node crypto) ──────────────
const verifySignature = (rawBody, headers, secret) => {
    if (!secret) return true; // skip in dev if not set
    try {
        const svixId = headers['svix-id'];
        const svixTimestamp = headers['svix-timestamp'];
        const svixSignature = headers['svix-signature'];
        if (!svixId || !svixTimestamp || !svixSignature) return false;

        const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
        const secretBytes = Buffer.from(secret.replace('whsec_', ''), 'base64');
        const computed = createHmac('sha256', secretBytes)
            .update(signedContent)
            .digest('base64');

        // svix-signature format: "v1,<base64>"
        const signatures = svixSignature.split(' ');
        return signatures.some(sig => {
            const [, sigValue] = sig.split(',');
            return sigValue === computed;
        });
    } catch (err) {
        console.error('[webhook] Signature verification error:', err);
        return false;
    }
};

// ── Find email_sends record ───────────────────────────────────────────────────
const findSendRecord = async (leadId, campaignId) => {
    const snap = await db.ref('email_sends')
        .orderByChild('campaignId')
        .equalTo(campaignId)
        .get();
    if (!snap.exists()) return null;
    const sends = Object.values(snap.val());
    return sends.find(s => s.leadId === leadId) || null;
};

// ── Increment project stat ────────────────────────────────────────────────────
const incrementStat = async (projectId, field, delta = 1) => {
    try {
        const statRef = db.ref(`projects/${projectId}/stats/${field}`);
        const snap = await statRef.get();
        const current = snap.exists() ? (snap.val() || 0) : 0;
        await statRef.set(current + delta);
    } catch (err) {
        console.warn(`[webhook] Failed to increment ${field}:`, err);
    }
};

// ── Main Handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Read raw body
    const rawBody = await getRawBody(req);

    // Verify signature
    const isValid = verifySignature(
        rawBody,
        req.headers,
        process.env.RESEND_WEBHOOK_SECRET
    );
    if (!isValid) {
        console.error('[webhook] Invalid signature');
        return res.status(401).json({ error: 'Invalid signature' });
    }

    let event;
    try {
        event = JSON.parse(rawBody);
    } catch {
        return res.status(400).json({ error: 'Invalid JSON body' });
    }

    // ADD THIS LINE TEMPORARILY
    console.log('[webhook] Full event:', JSON.stringify(event, null, 2));

    // Extract tags
    const rawTags = event.data?.tags;

    let campaignId, leadId, projectId;

    if (Array.isArray(rawTags)) {
        // Shape: [{ name: 'campaignId', value: '...' }, ...]
        campaignId = rawTags.find(t => t.name === 'campaignId')?.value;
        leadId = rawTags.find(t => t.name === 'leadId')?.value;
        projectId = rawTags.find(t => t.name === 'projectId')?.value;
    } else if (rawTags && typeof rawTags === 'object') {
        // Shape: { campaignId: '...', leadId: '...', projectId: '...' }
        campaignId = rawTags.campaignId;
        leadId = rawTags.leadId;
        projectId = rawTags.projectId;
    } else {
        // Tags might be at the top level of event.data directly
        campaignId = event.data?.campaignId;
        leadId = event.data?.leadId;
        projectId = event.data?.projectId;
    }
    if (!campaignId || !leadId || !projectId) {
        console.warn('[webhook] Missing tags, skipping:', event.type);
        return res.status(200).json({ received: true, skipped: true });
    }

    console.log(`[webhook] ${event.type} | campaign:${campaignId} | lead:${leadId}`);

    try {
        switch (event.type) {

            case 'email.delivered': {
                const rec = await findSendRecord(leadId, campaignId);
                if (!rec) break;
                await db.ref(`email_sends/${rec.id}`).update({
                    deliveryStatus: 'delivered',
                    deliveredAt: Date.now(),
                });
                break;
            }

            case 'email.opened': {
                const rec = await findSendRecord(leadId, campaignId);
                if (!rec) break;

                const now = Date.now();

                // ── Ignore bot opens — real humans don't open within 5 seconds ──
                const timeSinceSent = now - (rec.sentAt || 0);
                const isBotOpen = timeSinceSent < 5000; // 5 seconds

                if (isBotOpen) {
                    console.log(`[webhook] Ignoring bot open for lead ${leadId} (${timeSinceSent}ms after send)`);
                    break;
                }

                const isFirst = !rec.opened;
                await db.ref(`email_sends/${rec.id}`).update({
                    opened: true,
                    openCount: (rec.openCount || 0) + 1,
                    firstOpenAt: isFirst ? now : rec.firstOpenAt,
                    lastOpenAt: now,
                });
                if (isFirst) {
                    await db.ref(`leads/${leadId}`).update({ status: 'opened' });
                    await incrementStat(projectId, 'totalOpened', 1);
                }
                break;
            }

            case 'email.clicked': {
                const rec = await findSendRecord(leadId, campaignId);
                if (!rec) break;
                await db.ref(`email_sends/${rec.id}`).update({
                    clicked: true,
                    clickedAt: Date.now(),
                    clickedUrl: event.data?.click?.link || null,
                });
                await db.ref(`leads/${leadId}`).update({ status: 'clicked' });
                break;
            }

            case 'email.replied':
            case 'inbound.email': {
                const rec = await findSendRecord(leadId, campaignId);
                if (!rec) break;
                await db.ref(`email_sends/${rec.id}`).update({
                    replied: true,
                    repliedAt: Date.now(),
                });
                await db.ref(`leads/${leadId}`).update({ status: 'replied' });
                await incrementStat(projectId, 'totalReplied', 1);
                break;
            }

            case 'email.bounced': {
                const rec = await findSendRecord(leadId, campaignId);
                if (rec) {
                    await db.ref(`email_sends/${rec.id}`).update({
                        deliveryStatus: 'bounced',
                        bouncedAt: Date.now(),
                    });
                }
                await db.ref(`leads/${leadId}`).update({ status: 'bounced' });
                break;
            }

            case 'email.complained': {
                const rec = await findSendRecord(leadId, campaignId);
                if (rec) {
                    await db.ref(`email_sends/${rec.id}`).update({
                        deliveryStatus: 'complained',
                        complainedAt: Date.now(),
                    });
                }
                await db.ref(`leads/${leadId}`).update({ status: 'unsubscribed' });
                break;
            }
            case 'email.sent': {
                const rec = await findSendRecord(leadId, campaignId);
                if (!rec) break;
                await db.ref(`email_sends/${rec.id}`).update({
                    deliveryStatus: 'sent',
                    sentConfirmedAt: Date.now(),
                });
                break;
            }

            default:
                console.log(`[webhook] Unhandled event: ${event.type}`);
        }

        return res.status(200).json({ received: true, type: event.type });

    } catch (err) {
        console.error('[webhook] Error:', err);
        return res.status(200).json({ received: true, error: err.message });
    }
}

// Disable body parser — needed to read raw bytes
export const config = {
    api: { bodyParser: false },
};