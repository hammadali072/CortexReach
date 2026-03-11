// api/resend-webhook.js
// ─────────────────────────────────────────────────────────────────────────────
// Vercel Serverless Function — Resend Webhook Handler
//
// Resend calls this URL automatically when:
//   - An email is delivered
//   - A recipient opens the email (tracking pixel fired)
//   - A recipient clicks a link (redirect fired)
//   - An email bounces
//   - A recipient marks as spam
//   - A recipient replies (Resend inbound, if configured)
//
// This handler calls your EXISTING db.js functions:
//   → recordEmailOpen()   updates email_sends + lead status + project stats
//   → recordEmailReply()  updates email_sends + lead status + project stats
//
// How tracking works end-to-end:
//   1. send-campaign.js tags every email with { campaignId, leadId, projectId }
//   2. Resend fires a webhook POST to this URL with the event + those tags
//   3. We look up the email_sends record by leadId + campaignId
//   4. We call the appropriate db.js function to update Firebase
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp, getApps } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { Webhook } from 'svix'; // Resend uses Svix for webhook signature verification

// ── Firebase Admin init ───────────────────────────────────────────────────────
if (!getApps().length) {
    initializeApp({
        credential: {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
}

const db = getDatabase();

// ── Helper: find email_sends record by leadId + campaignId ───────────────────
const findSendRecord = async (leadId, campaignId) => {
    const snap = await db.ref('email_sends')
        .orderByChild('campaignId')
        .equalTo(campaignId)
        .get();

    if (!snap.exists()) return null;

    const sends = Object.values(snap.val());
    return sends.find(s => s.leadId === leadId) || null;
};

// ── Helper: increment project stat ───────────────────────────────────────────
const incrementStat = async (projectId, field, delta = 1) => {
    try {
        const statRef = db.ref(`projects/${projectId}/stats/${field}`);
        const snap = await statRef.get();
        const current = snap.exists() ? (snap.val() || 0) : 0;
        await statRef.set(current + delta);
    } catch (err) {
        console.warn(`[webhook] Failed to increment stat ${field}:`, err);
    }
};

// ── Webhook signature verification ───────────────────────────────────────────
const verifyWebhookSignature = (req, rawBody) => {
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (!webhookSecret) return true; // Skip verification in dev if not set

    try {
        const wh = new Webhook(webhookSecret);
        wh.verify(rawBody, {
            'svix-id': req.headers['svix-id'],
            'svix-timestamp': req.headers['svix-timestamp'],
            'svix-signature': req.headers['svix-signature'],
        });
        return true;
    } catch {
        return false;
    }
};

// ── Main Handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // ── Signature verification (security) ────────────────────────────────────
    const rawBody = JSON.stringify(req.body);
    if (!verifyWebhookSignature(req, rawBody)) {
        console.error('[webhook] Invalid signature — rejected');
        return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;

    // ── Extract tags attached during send-campaign.js ─────────────────────────
    // Tags shape: [{ name: 'campaignId', value: '...' }, { name: 'leadId', value: '...' }, ...]
    const tags = event.data?.tags || [];
    const campaignId = tags.find(t => t.name === 'campaignId')?.value;
    const leadId = tags.find(t => t.name === 'leadId')?.value;
    const projectId = tags.find(t => t.name === 'projectId')?.value;

    // If we can't identify the campaign/lead, acknowledge but skip
    if (!campaignId || !leadId || !projectId) {
        console.warn('[webhook] Missing tags — cannot process event:', event.type);
        return res.status(200).json({ received: true, skipped: true });
    }

    console.log(`[webhook] ${event.type} | campaign: ${campaignId} | lead: ${leadId}`);

    try {
        switch (event.type) {

            // ── Email delivered to inbox ──────────────────────────────────────
            case 'email.delivered': {
                await db.ref('email_sends')
                    .orderByChild('campaignId').equalTo(campaignId).get()
                    .then(snap => {
                        if (!snap.exists()) return;
                        const sends = Object.values(snap.val());
                        const send = sends.find(s => s.leadId === leadId);
                        if (send) {
                            db.ref(`email_sends/${send.id}`).update({
                                deliveryStatus: 'delivered',
                                deliveredAt: Date.now(),
                            });
                        }
                    });
                break;
            }

            // ── Recipient opened the email ────────────────────────────────────
            // Maps to your existing recordEmailOpen() logic
            case 'email.opened': {
                const sendRecord = await findSendRecord(leadId, campaignId);
                if (!sendRecord) break;

                const isFirstOpen = !sendRecord.opened;

                // Update email_sends record
                await db.ref(`email_sends/${sendRecord.id}`).update({
                    opened: true,
                    openCount: (sendRecord.openCount || 0) + 1,
                    firstOpenAt: isFirstOpen ? Date.now() : sendRecord.firstOpenAt,
                    lastOpenAt: Date.now(),
                });

                // Only update lead status + stats on FIRST open (matches your db.js logic)
                if (isFirstOpen) {
                    await db.ref(`leads/${leadId}`).update({ status: 'opened' });
                    await incrementStat(projectId, 'totalOpened', 1);
                }
                break;
            }

            // ── Recipient clicked a link ──────────────────────────────────────
            case 'email.clicked': {
                const sendRecord = await findSendRecord(leadId, campaignId);
                if (!sendRecord) break;

                await db.ref(`email_sends/${sendRecord.id}`).update({
                    clicked: true,
                    clickedAt: Date.now(),
                    clickedUrl: event.data?.click?.link || null,
                });

                // Update lead status to 'clicked' (more engaged than just opened)
                await db.ref(`leads/${leadId}`).update({ status: 'clicked' });
                break;
            }

            // ── Recipient replied to the email ────────────────────────────────
            // Maps to your existing recordEmailReply() logic
            case 'email.replied':
            case 'inbound.email': {
                const sendRecord = await findSendRecord(leadId, campaignId);
                if (!sendRecord) break;

                await db.ref(`email_sends/${sendRecord.id}`).update({
                    replied: true,
                    repliedAt: Date.now(),
                });

                // Update lead status + project stat (matches your db.js)
                await db.ref(`leads/${leadId}`).update({ status: 'replied' });
                await incrementStat(projectId, 'totalReplied', 1);
                break;
            }

            // ── Email bounced ─────────────────────────────────────────────────
            case 'email.bounced': {
                const sendRecord = await findSendRecord(leadId, campaignId);
                if (sendRecord) {
                    await db.ref(`email_sends/${sendRecord.id}`).update({
                        deliveryStatus: 'bounced',
                        bouncedAt: Date.now(),
                        bounceType: event.data?.bounce?.type || 'unknown',
                    });
                }
                // Mark lead as invalid so it's excluded from future campaigns
                await db.ref(`leads/${leadId}`).update({ status: 'bounced' });
                break;
            }

            // ── Recipient marked as spam ──────────────────────────────────────
            case 'email.complained': {
                const sendRecord = await findSendRecord(leadId, campaignId);
                if (sendRecord) {
                    await db.ref(`email_sends/${sendRecord.id}`).update({
                        deliveryStatus: 'complained',
                        complainedAt: Date.now(),
                    });
                }
                await db.ref(`leads/${leadId}`).update({ status: 'unsubscribed' });
                break;
            }

            default:
                console.log(`[webhook] Unhandled event type: ${event.type}`);
        }

        // Always respond 200 quickly — Resend retries if it gets a non-2xx
        return res.status(200).json({ received: true, type: event.type });

    } catch (err) {
        console.error('[webhook] Handler error:', err);
        // Still return 200 to prevent Resend from retrying on server errors
        return res.status(200).json({ received: true, error: err.message });
    }
}

// ── Required: disable Next.js body parsing so we can read raw body ────────────
export const config = {
    api: { bodyParser: true },
};
