// api/send-campaign.js
// ─────────────────────────────────────────────────────────────────────────────
// Vercel Serverless Function — Campaign Send Endpoint
// ─────────────────────────────────────────────────────────────────────────────

import { Resend } from 'resend';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { renderCampaignEmail } from '../src/emails/renderEmails.js';

// ── Firebase Admin init ──────────────────────────────────────────────────────
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

const resend = new Resend(process.env.RESEND_API_KEY);
const db = getDatabase();

const dbGet = async (path) => {
    const snap = await db.ref(path).get();
    return snap.exists() ? snap.val() : null;
};

export default async function handler(req, res) {
    const isDev = process.env.NODE_ENV !== 'production';

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { campaignId } = req.body;
    if (!campaignId) return res.status(400).json({ error: 'campaignId is required' });

    try {
        // 1. Fetch Campaign
        const campaign = await dbGet(`campaigns/${campaignId}`);
        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

        if (campaign.status === 'sending') {
            return res.status(400).json({ error: 'Campaign is already in progress' });
        }

        // 2. Fetch Project
        const project = await dbGet(`projects/${campaign.projectId}`);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        // 3. Fetch Audience
        const audienceMap = await dbGet(`campaign_audience/${campaignId}`);
        if (!audienceMap) return res.status(400).json({ error: 'No audience assigned' });
        const leadIds = Object.keys(audienceMap);

        // 4. Fetch Leads
        const leads = await Promise.all(leadIds.map(id => dbGet(`leads/${id}`)));
        const validLeads = leads.filter(Boolean);

        if (validLeads.length === 0) return res.status(400).json({ error: 'No valid leads found' });

        // Mark as sending immediately
        await db.ref(`campaigns/${campaignId}`).update({ status: 'sending' });

        const BATCH_SIZE = 100;
        let totalSent = 0;

        for (let i = 0; i < validLeads.length; i += BATCH_SIZE) {
            const batch = validLeads.slice(i, i + BATCH_SIZE);

            // ── STEP 1: Pre-create send records so we have IDs for tracking pixels ──
            const sendRecords = await Promise.all(
                batch.map(async (lead) => {
                    const sendRef = db.ref('email_sends').push();
                    const sendId = sendRef.key;
                    const now = Date.now();

                    // Write a "pending" record immediately so the ID exists
                    await sendRef.set({
                        id: sendId,
                        campaignId,
                        projectId: campaign.projectId,
                        leadId: lead.id,
                        subject: campaign.subjectLine || campaign.subject || '',
                        sentAt: now,
                        deliveryStatus: 'pending',
                        opened: false,
                        replied: false,
                        openCount: 0,
                        resendEmailId: null,
                    });

                    return { lead, sendId, sendRef };
                })
            );

            // ── STEP 2: Build personalised emails using saved HTML from editor ──
            const emailBatch = await Promise.all(
                sendRecords.map(async ({ lead, sendId }) => {

                    const firstName = lead.first_name || lead.firstName || lead.name?.split(' ')[0] || 'there';
                    const lastName  = lead.last_name  || lead.lastName  || lead.name?.split(' ').slice(1).join(' ') || '';
                    const companyName = lead.company_name || lead.company || 'your company';
                    const email = lead.email || '';

                    // ── Use the user-edited HTML saved in Firebase ──────────────
                    // Fall back to renderCampaignEmail only if no saved body exists.
                    const savedHtml = campaign.emailBodyHTML || campaign.emailContent || campaign.body || '';

                    let html;
                    if (savedHtml && savedHtml.trim().length > 20) {
                        // Replace {{placeholders}} with real lead data
                        html = savedHtml
                            .replace(/\{\{firstName\}\}/gi, firstName)
                            .replace(/\{\{lastName\}\}/gi, lastName)
                            .replace(/\{\{companyName\}\}/gi, companyName)
                            .replace(/\{\{email\}\}/gi, email);

                        // Inject tracking pixel before </body> (or append at end)
                        const trackingPixel = `<img src="https://durzaar.com/api/track-open?sendId=${sendId}" width="1" height="1" style="display:block;width:1px;height:1px;border:0;opacity:0;" alt="" />`;
                        if (html.includes('</body>')) {
                            html = html.replace('</body>', `${trackingPixel}</body>`);
                        } else {
                            html += trackingPixel;
                        }
                    } else {
                        // Fallback: generate from default template
                        html = await renderCampaignEmail(campaign.campaignType, project, lead, sendId);
                    }

                    let personalizedSubject = campaign.subjectLine || campaign.subject || '';
                    personalizedSubject = personalizedSubject
                        .replace(/\{\{firstName\}\}/gi, firstName)
                        .replace(/\{\{lastName\}\}/gi, lastName)
                        .replace(/\{\{companyName\}\}/gi, companyName)
                        .replace(/\{\{email\}\}/gi, email);

                    return {
                        from: `${process.env.RESEND_FROM_NAME || 'CortexReach'} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
                        to: [lead.email],
                        subject: personalizedSubject,
                        html,
                        tags: [
                            { name: 'campaignId', value: campaignId },
                            { name: 'leadId',     value: lead.id },
                            { name: 'projectId',  value: campaign.projectId },
                            { name: 'sendId',     value: sendId },
                        ],
                    };
                })
            );

            // ── STEP 3: Send the batch via Resend ──
            const { data, error } = await resend.batch.send(emailBatch);

            if (error) {
                console.error('[Resend] Batch Error:', error);
            }

            // ── STEP 4: Update send records with Resend's email IDs ──
            await Promise.all(
                sendRecords.map(async ({ lead, sendId, sendRef }, idx) => {
                    const resendEmailId = data?.data?.[idx]?.id || null;
                    const sent = !!resendEmailId;

                    await sendRef.update({
                        deliveryStatus: sent ? 'sent' : 'failed',
                        resendEmailId: resendEmailId,
                    });

                    if (sent) {
                        await db.ref(`leads/${lead.id}`).update({
                            status: 'email_sent',
                            lastEmailSentAt: Date.now(),
                        });
                        totalSent++;
                    }
                })
            );
        }

        // Final Update
        await db.ref(`campaigns/${campaignId}`).update({
            status: 'sent',
            sentAt: Date.now(),
            updatedAt: Date.now(),
            totalSent,
        });

        // Update project totalSent stat
        const statsRef = db.ref(`projects/${campaign.projectId}/stats/totalSent`);
        const statsSnap = await statsRef.get();
        const currentSent = statsSnap.exists() ? (statsSnap.val() || 0) : 0;
        await statsRef.set(currentSent + totalSent);

        return res.status(200).json({
            success: true,
            totalSent,
            campaignId,
        });

    } catch (err) {
        console.error('[send-campaign] Unexpected error:', err);
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
}