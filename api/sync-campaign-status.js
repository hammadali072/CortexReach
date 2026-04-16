import { Resend } from 'resend';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Firebase Admin
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

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { campaignId } = req.body;

    if (!campaignId) {
        return res.status(400).json({ error: 'campaignId is required' });
    }

    console.log(`[sync] Starting status sync for campaign: ${campaignId}`);

    try {
        // 1. Get all sends for this campaign
        const sendsSnap = await db.ref('email_sends')
            .orderByChild('campaignId')
            .equalTo(campaignId)
            .get();

        if (!sendsSnap.exists()) {
            return res.status(200).json({ 
                success: true, 
                updated: 0, 
                message: 'No sends found to sync' 
            });
        }

        const sendsData = sendsSnap.val();
        const sendIds = Object.keys(sendsData);
        let updatedCount = 0;

        for (const id of sendIds) {
            const send = sendsData[id];
            const resendId = send.resendEmailId;

            // Only sync if we have a Resend ID and it's not already in a terminal state that we can't improve
            // (Actually we sync everything just in case)
            if (!resendId) continue;

            try {
                const { data, error } = await resend.emails.get(resendId);
                if (error || !data) {
                    console.error(`[sync] Resend API error for ${resendId}:`, error);
                    continue;
                }

                const lastEvent = data.last_event;
                const updates = {};
                let changed = false;

                // 1. Delivery Status
                if (lastEvent && lastEvent !== send.deliveryStatus) {
                    updates.deliveryStatus = lastEvent;
                    changed = true;

                    if (lastEvent === 'delivered' && !send.deliveredAt) updates.deliveredAt = Date.now();
                    if (lastEvent === 'bounced' && !send.bouncedAt) updates.bouncedAt = Date.now();
                }

                // 2. Open Tracking
                if ((lastEvent === 'opened' || lastEvent === 'clicked') && !send.opened) {
                    updates.opened = true;
                    updates.openCount = (send.openCount || 0) + 1;
                    updates.firstOpenAt = send.firstOpenAt || Date.now();
                    changed = true;
                }

                // 3. Click Tracking
                if (lastEvent === 'clicked' && !send.clicked) {
                    updates.clicked = true;
                    updates.clickedAt = send.clickedAt || Date.now();
                    changed = true;
                }

                // 4. Reply Tracking
                if (lastEvent === 'replied' && !send.replied) {
                    updates.replied = true;
                    updates.repliedAt = send.repliedAt || Date.now();
                    changed = true;
                }

                if (changed) {
                    await db.ref(`email_sends/${id}`).update(updates);
                    updatedCount++;

                    // Sync lead status
                    if (updates.opened) {
                        await db.ref(`leads/${send.leadId}`).update({ status: 'opened' });
                    } else if (updates.clicked) {
                        await db.ref(`leads/${send.leadId}`).update({ status: 'clicked' });
                    } else if (updates.replied) {
                        await db.ref(`leads/${send.leadId}`).update({ status: 'replied' });
                    } else if (lastEvent === 'bounced') {
                        await db.ref(`leads/${send.leadId}`).update({ status: 'bounced' });
                    }
                }
            } catch (err) {
                console.error(`[sync] Error syncing email ${resendId}:`, err);
            }
        }

        // 2. Refresh Campaign Stats node for consistency
        const finalSendsSnap = await db.ref('email_sends')
            .orderByChild('campaignId')
            .equalTo(campaignId)
            .get();
        
        const finalSends = Object.values(finalSendsSnap.val());
        const newStats = {
            total: finalSends.length,
            sent: finalSends.filter(s => s.deliveryStatus !== 'draft').length,
            delivered: finalSends.filter(s => s.deliveryStatus === 'delivered' || s.opened || s.clicked || s.replied).length,
            opened: finalSends.filter(s => s.opened || s.clicked || s.replied).length,
            clicked: finalSends.filter(s => s.clicked).length,
            replied: finalSends.filter(s => s.replied).length,
            bounced: finalSends.filter(s => s.deliveryStatus === 'bounced').length,
            followUpSent: finalSends.filter(s => s.type === 'follow_up').length,
        };

        await db.ref(`campaigns/${campaignId}/stats`).update(newStats);

        console.log(`[sync] Sync complete. Updated ${updatedCount} records.`);

        return res.status(200).json({ 
            success: true, 
            updated: updatedCount, 
            stats: newStats 
        });

    } catch (err) {
        console.error('[sync] Sync failed:', err);
        return res.status(500).json({ error: err.message });
    }
}
