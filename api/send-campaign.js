// api/send-campaign.js
// ─────────────────────────────────────────────────────────────────────────────
// Vercel Serverless Function — Campaign Send Endpoint
// ─────────────────────────────────────────────────────────────────────────────

import { Resend } from 'resend';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { renderCampaignEmail } from '../src/emails/renderEmails.jsx';

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
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { campaignId } = req.body;
    if (!campaignId) return res.status(400).json({ error: 'campaignId is required' });

    try {
        // 1. Fetch Campaign
        const campaign = await dbGet(`campaigns/${campaignId}`);
        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
        
        // Allow re-sending or draft sending
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

            const emailBatch = await Promise.all(
                batch.map(async (lead) => {
                    const html = await renderCampaignEmail(
                        campaign.campaignType,
                        project,
                        lead
                    );
                    return {
                        from: `${project.name} <outreach@${process.env.RESEND_FROM_DOMAIN || 'cortexreach.com'}>`,
                        to: [lead.email],
                        subject: campaign.subjectLine || campaign.subject,
                        html,
                        tags: [
                            { name: 'campaignId', value: campaignId },
                            { name: 'leadId', value: lead.id },
                            { name: 'projectId', value: campaign.projectId },
                        ],
                    };
                })
            );

            const { data, error } = await resend.batch.send(emailBatch);
            
            if (error) {
                console.error('[Resend] Batch Error:', error);
                // We'll record what we can and continue
            }

            // Record Sends in Firebase
            await Promise.all(
                batch.map(async (lead, idx) => {
                    const resendId = data?.data?.[idx]?.id || null;
                    const sendRef = db.ref('email_sends').push();
                    const now = Date.now();

                    await sendRef.set({
                        id: sendRef.key,
                        campaignId,
                        projectId: campaign.projectId,
                        leadId: lead.id,
                        subject: campaign.subjectLine || campaign.subject,
                        sentAt: now,
                        deliveryStatus: resendId ? 'sent' : 'failed',
                        opened: false,
                        replied: false,
                        openCount: 0,
                        resendEmailId: resendId,
                    });

                    if (resendId) {
                        await db.ref(`leads/${lead.id}`).update({
                            status: 'email_sent',
                            lastEmailSentAt: now
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
            totalSent: totalSent,
        });

        // Update project totalSent stat
        const statsRef = db.ref(`projects/${campaign.projectId}/stats/totalSent`);
        const statsSnap = await statsRef.get();
        const currentSent = statsSnap.exists() ? (statsSnap.val() || 0) : 0;
        await statsRef.set(currentSent + totalSent);

        return res.status(200).json({
            success: true,
            totalSent: totalSent,
            campaignId,
        });

    } catch (err) {
        console.error('[send-campaign] Unexpected error:', err);
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
}
