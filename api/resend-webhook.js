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

// ── Verify Resend webhook signature ──────────────────────────────────────────
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

// ── Extract tags from Resend event (handles both array and object formats) ────
const extractTags = (event) => {
    const rawTags = event.data?.tags;
    let campaignId, leadId, projectId, sendId;

    if (Array.isArray(rawTags)) {
        campaignId = rawTags.find(t => t.name === 'campaignId')?.value;
        leadId = rawTags.find(t => t.name === 'leadId')?.value;
        projectId = rawTags.find(t => t.name === 'projectId')?.value;
        sendId = rawTags.find(t => t.name === 'sendId')?.value;
    } else if (rawTags && typeof rawTags === 'object') {
        campaignId = rawTags.campaignId;
        leadId = rawTags.leadId;
        projectId = rawTags.projectId;
        sendId = rawTags.sendId;
    } else {
        // Fallback: top-level of event.data
        campaignId = event.data?.campaignId;
        leadId = event.data?.leadId;
        projectId = event.data?.projectId;
        sendId = event.data?.sendId;
    }

    return { campaignId, leadId, projectId, sendId };
};

// ── Look up a send record ─────────────────────────────────────────────────────
// PRIMARY:   use sendId tag (direct, O(1) lookup)
// FALLBACK:  scan email_sends by resendEmailId
// LAST:      scan by campaignId + leadId (original slow path, kept as safety net)
const findSendRecord = async (sendId, resendEmailId, campaignId, leadId) => {
    // 1. Direct lookup by our own sendId (fastest)
    if (sendId) {
        const snap = await db.ref(`email_sends/${sendId}`).get();
        if (snap.exists()) return snap.val();
    }

    // 2. Lookup by Resend's email ID (reliable if sendId tag was dropped)
    if (resendEmailId) {
        const snap = await db.ref('email_sends')
            .orderByChild('resendEmailId')
            .equalTo(resendEmailId)
            .get();
        if (snap.exists()) {
            const vals = Object.values(snap.val());
            if (vals.length > 0) return vals[0];
        }
    }

    // 3. Slow fallback: scan by campaignId, filter by leadId client-side
    if (campaignId && leadId) {
        const snap = await db.ref('email_sends')
            .orderByChild('campaignId')
            .equalTo(campaignId)
            .get();
        if (snap.exists()) {
            const sends = Object.values(snap.val());
            const match = sends.find(s => s.leadId === leadId);
            if (match) return match;
        }
    }

    return null;
};

// ── Increment project stat ────────────────────────────────────────────────────
const incrementStat = async (path, delta = 1) => {
    try {
        const ref = db.ref(path);
        const snap = await ref.get();
        const current = snap.exists() ? (snap.val() || 0) : 0;
        await ref.set(current + delta);
    } catch (err) {
        console.warn(`[webhook] Failed to increment stat at ${path}:`, err);
    }
};

// ── Main Handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const rawBody = await getRawBody(req);

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

    console.log('[webhook] Event type:', event.type, '| email_id:', event.data?.email_id);

    let { campaignId, leadId, projectId, sendId } = extractTags(event);
    const resendEmailId = event.data?.email_id; // Resend's own ID for the email

    // In some cases (like email.opened), Resend might strip tags if pixel/links are wrapped
    // If tags are missing but we have an email_id, let's try to look it up first
    let sendRecord = null;
    if ((!sendId || !campaignId || !leadId) && resendEmailId) {
        sendRecord = await findSendRecord(null, resendEmailId, null, null);
        if (sendRecord) {
            campaignId = sendRecord.campaignId;
            leadId = sendRecord.leadId;
            projectId = sendRecord.projectId;
            sendId = sendRecord.id;
        }
    }

    if (!campaignId || !leadId || !projectId) {
        console.warn('[webhook] Missing required tags and lookup failed, skipping:', event.type);
        return res.status(200).json({ received: true, skipped: true });
    }

    console.log(`[webhook] ${event.type} | sendId:${sendId} | campaign:${campaignId} | lead:${leadId}`);

    try {
        switch (event.type) {

            case 'email.sent': {
                // Update our record with Resend's email_id if we don't have it yet
                if (sendId && resendEmailId) {
                    await db.ref(`email_sends/${sendId}`).update({
                        deliveryStatus: 'sent',
                        resendEmailId,
                        sentConfirmedAt: Date.now(),
                    });
                }
                break;
            }

            case 'email.delivered': {
                const rec = await findSendRecord(sendId, resendEmailId, campaignId, leadId);
                if (!rec) { console.warn('[webhook] No send record found for delivered event'); break; }
                await db.ref(`email_sends/${rec.id}`).update({
                    deliveryStatus: 'delivered',
                    deliveredAt: Date.now(),
                });
                if (campaignId) {
                    await incrementStat(`campaigns/${campaignId}/stats/delivered`, 1);
                }
                break;
            }

            case 'email.opened': {
                const rec = await findSendRecord(sendId, resendEmailId, campaignId, leadId);
                if (!rec) { console.warn('[webhook] No send record found for opened event'); break; }

                const now = Date.now();

                // Ignore likely bot/scanner opens.
                // Resend's delivery pipeline and email security scanners (Proofpoint,
                // Barracuda, Mimecast etc.) fire pixels within 0–15 seconds of delivery.
                // Real humans need at least 30 seconds between receiving and opening.
                const timeSinceSent = now - (rec.sentAt || 0);
                if (timeSinceSent < 1000) { // Reduced from 30s for testing
                    console.log(
                        `[webhook] Bot open filtered — lead: ${leadId} | ` +
                        `${(timeSinceSent / 1000).toFixed(1)}s after send`
                    );
                    break;
                }

                const isFirstOpen = !rec.opened;
                await db.ref(`email_sends/${rec.id}`).update({
                    opened: true,
                    openCount: (rec.openCount || 0) + 1,
                    firstOpenAt: isFirstOpen ? now : (rec.firstOpenAt || now),
                    lastOpenAt: now,
                });

                if (isFirstOpen) {
                    await db.ref(`leads/${leadId}`).update({ status: 'opened' });
                    await incrementStat(`projects/${projectId}/stats/totalOpened`, 1);
                    if (campaignId) {
                        await incrementStat(`campaigns/${campaignId}/totalOpened`, 1);
                        await incrementStat(`campaigns/${campaignId}/stats/opened`, 1);
                    }
                    console.log(`[webhook] First open recorded for lead ${leadId}`);
                }
                break;
            }

            case 'email.clicked': {
                const rec = await findSendRecord(sendId, resendEmailId, campaignId, leadId);
                if (!rec) break;
                await db.ref(`email_sends/${rec.id}`).update({
                    clicked: true,
                    clickedAt: Date.now(),
                    clickedUrl: event.data?.click?.link || null,
                });
                await db.ref(`leads/${leadId}`).update({ status: 'clicked' });
                break;
            }

            case 'email.replied': {
                const rec = await findSendRecord(sendId, resendEmailId, campaignId, leadId);
                if (!rec) break;
                await db.ref(`email_sends/${rec.id}`).update({
                    replied: true,
                    repliedAt: Date.now(),
                });
                await db.ref(`leads/${leadId}`).update({ status: 'replied' });
                await incrementStat(`projects/${projectId}/stats/totalReplied`, 1);
                if (campaignId) {
                    await incrementStat(`campaigns/${campaignId}/totalReplied`, 1);
                    await incrementStat(`campaigns/${campaignId}/stats/replied`, 1);
                }
                break;
            }

            case 'inbound.email': {
                // Parse the event: get the In-Reply-To header from event.data.headers
                const headers = event.data?.headers || [];
                let inReplyTo = '';
                if (Array.isArray(headers)) {
                    const header = headers.find(h => h.name && h.name.toLowerCase() === 'in-reply-to');
                    if (header) inReplyTo = header.value;
                } else if (typeof headers === 'object') {
                    inReplyTo = headers['In-Reply-To'] || headers['in-reply-to'];
                }

                if (!inReplyTo) {
                    console.warn('[webhook] inbound.email missing In-Reply-To header');
                    break;
                }

                inReplyTo = inReplyTo.replace(/[<>]/g, ''); // Clean the ID

                // Find the email_sends record by resendEmailId matching the In-Reply-To value
                const rec = await findSendRecord(null, inReplyTo, null, null);
                if (!rec) {
                    console.warn('[webhook] No send record found for In-Reply-To value:', inReplyTo);
                    break;
                }

                await db.ref(`email_sends/${rec.id}`).update({
                    replied: true,
                    repliedAt: Date.now(),
                });
                await db.ref(`leads/${rec.leadId}`).update({ status: 'replied' });
                await incrementStat(`projects/${rec.projectId}/stats/totalReplied`, 1);
                if (rec.campaignId) {
                    await incrementStat(`campaigns/${rec.campaignId}/totalReplied`, 1);
                    await incrementStat(`campaigns/${rec.campaignId}/stats/replied`, 1);
                }
                console.log(`[webhook] Reply recorded — leadId: ${rec.leadId}, campaignId: ${rec.campaignId}`);
                break;
            }

            case 'email.bounced': {
                const rec = await findSendRecord(sendId, resendEmailId, campaignId, leadId);
                if (rec) {
                    await db.ref(`email_sends/${rec.id}`).update({
                        deliveryStatus: 'bounced',
                        bouncedAt: Date.now(),
                    });
                }
                await db.ref(`leads/${leadId}`).update({ status: 'bounced' });
                if (campaignId) {
                    await incrementStat(`campaigns/${campaignId}/stats/bounced`, 1);
                }
                break;
            }

            case 'email.complained': {
                const rec = await findSendRecord(sendId, resendEmailId, campaignId, leadId);
                if (rec) {
                    await db.ref(`email_sends/${rec.id}`).update({
                        deliveryStatus: 'complained',
                        complainedAt: Date.now(),
                    });
                }
                await db.ref(`leads/${leadId}`).update({ status: 'unsubscribed' });
                break;
            }

            default:
                console.log(`[webhook] Unhandled event: ${event.type}`);
        }

        return res.status(200).json({ received: true, type: event.type });

    } catch (err) {
        console.error('[webhook] Error processing event:', err);
        // Always return 200 to Resend so it doesn't retry endlessly
        return res.status(200).json({ received: true, error: err.message });
    }
}

// Disable Next.js/Vercel body parser — we need the raw bytes for signature verification
export const config = {
    api: { bodyParser: false },
};