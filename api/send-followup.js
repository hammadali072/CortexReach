import { Resend } from 'resend';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

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

    const { campaignId, subject, body } = req.body;
    if (!campaignId || !subject || !body) {
        return res.status(400).json({ error: 'campaignId, subject, and body are required' });
    }

    try {
        // 1. Fetch Campaign
        const campaign = await dbGet(`campaigns/${campaignId}`);
        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

        if (campaign.status !== 'sent') {
            return res.status(400).json({ error: 'Campaign must be sent before sending follow-ups' });
        }

        // 2. Fetch Project
        const project = await dbGet(`projects/${campaign.projectId}`);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        // 3. Query email_sends by campaignId
        const sendsSnap = await db.ref('email_sends')
            .orderByChild('campaignId')
            .equalTo(campaignId)
            .get();

        if (!sendsSnap.exists()) {
            return res.status(400).json({ error: 'No email sends found for this campaign' });
        }

        const sends = Object.values(sendsSnap.val());

        // 4. Filter and prepare eligible leads
        const eligibleSends = sends.filter(s => s.replied === true && s.type !== 'follow_up');
        const hasFollowUp = new Set(sends.filter(s => s.type === 'follow_up').map(s => s.leadId));
        
        const validLeadIds = eligibleSends
            .filter(s => !hasFollowUp.has(s.leadId))
            .map(s => s.leadId);

        if (validLeadIds.length === 0) {
            return res.status(400).json({ error: 'No replied leads to follow up with' });
        }

        // Fetch lead details
        const leadsSnap = await db.ref('leads').get();
        if (!leadsSnap.exists()) {
             return res.status(500).json({ error: 'Could not fetch leads data' });
        }
        const allLeads = leadsSnap.val();
        const validLeads = validLeadIds.map(id => allLeads[id]).filter(Boolean);

        if (validLeads.length === 0) {
            return res.status(400).json({ error: 'No valid leads found in database' });
        }

        const BATCH_SIZE = 100;
        let totalSent = 0;

        for (let i = 0; i < validLeads.length; i += BATCH_SIZE) {
            const batch = validLeads.slice(i, i + BATCH_SIZE);

            // Pre-create follow_up email_sends
            const sendRecords = await Promise.all(
                batch.map(async (lead) => {
                    const sendRef = db.ref('email_sends').push();
                    const sendId = sendRef.key;
                    const now = Date.now();

                    await sendRef.set({
                        id: sendId,
                        campaignId,
                        projectId: campaign.projectId,
                        leadId: lead.id,
                        subject: subject,
                        sentAt: now,
                        deliveryStatus: 'pending',
                        opened: false,
                        replied: false,
                        openCount: 0,
                        resendEmailId: null,
                        type: 'follow_up'
                    });

                    return { lead, sendId, sendRef };
                })
            );

            // Render emails
            const emailBatch = await Promise.all(
                sendRecords.map(async ({ lead, sendId }) => {
                    const firstName = lead.first_name || lead.firstName || lead.name?.split(' ')[0] || 'there';
                    const lastName = lead.last_name || lead.lastName || lead.name?.split(' ').slice(1).join(' ') || '';
                    const companyName = lead.company_name || lead.company || 'your company';
                    const email = lead.email || '';

                    // Replace placeholders
                    let html = body
                        .replace(/\{\{firstName\}\}/gi, firstName)
                        .replace(/\{\{lastName\}\}/gi, lastName)
                        .replace(/\{\{companyName\}\}/gi, companyName)
                        .replace(/\{\{email\}\}/gi, email);

                    // Embed tracking pixel
                    const trackingPixel = `<img src="https://durzaar.com/api/track-open?sendId=${sendId}" width="1" height="1" style="display:block;width:1px;height:1px;border:0;opacity:0;" alt="" />`;
                    if (html.includes('</body>')) {
                        html = html.replace('</body>', `${trackingPixel}</body>`);
                    } else {
                        html += trackingPixel;
                    }

                    let personalizedSubject = subject
                        .replace(/\{\{firstName\}\}/gi, firstName)
                        .replace(/\{\{lastName\}\}/gi, lastName)
                        .replace(/\{\{companyName\}\}/gi, companyName)
                        .replace(/\{\{email\}\}/gi, email);

                    const payload = {
                        from: `${process.env.RESEND_FROM_NAME || 'CortexReach'} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
                        to: [isDev && process.env.DEV_TEST_EMAIL ? process.env.DEV_TEST_EMAIL : lead.email],
                        subject: personalizedSubject,
                        html,
                        tags: [
                            { name: 'campaignId', value: campaignId },
                            { name: 'leadId', value: lead.id },
                            { name: 'projectId', value: campaign.projectId },
                            { name: 'sendId', value: sendId },
                        ],
                    };

                    const replyEmail = process.env.RESEND_REPLY_TO_EMAIL || process.env.RESEND_FROM_EMAIL;
                    if (replyEmail) {
                        payload.reply_to = replyEmail;
                    }

                    return payload;
                })
            );

            // Send via Resend batch
            const { data, error } = await resend.batch.send(emailBatch);

            if (error) {
                console.error('[Resend Follow-up] Batch Error:', error);
            }

            // Update records with resend info
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

        const now = Date.now();
        // 7. Create a follow_ups/{followUpId} record
        const followUpsRef = db.ref('follow_ups').push();
        const followUpId = followUpsRef.key;
        await followUpsRef.set({
            id: followUpId,
            campaignId,
            projectId: campaign.projectId,
            userId: campaign.userId,
            subject,
            body,
            status: 'sent',
            createdAt: now,
            sentAt: now,
            totalSent
        });

        // 8. Update campaigns/{campaignId}/stats/followUpSent += totalSent
        const statsRef = db.ref(`campaigns/${campaignId}/stats/followUpSent`);
        const statsSnap = await statsRef.get();
        const currentFollowUpSent = statsSnap.exists() ? (statsSnap.val() || 0) : 0;
        await statsRef.set(currentFollowUpSent + totalSent);

        return res.status(200).json({
            success: true,
            totalSent,
            followUpId,
        });

    } catch (err) {
        console.error('[send-followup] Unexpected error:', err);
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
}
