/**
 * Firebase Cloud Functions (Gen 2) - Email Sender
 * Integration with SendGrid
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setApiKey, send } = require("@sendgrid/mail");
const { logger } = require("firebase-functions");

// Set SendGrid API Key from environment variable
// In a real production scenario, use Firebase Secrets Manager (secrets: ['SEND_API_KEY'])
const apiKey = process.env.SEND_API_KEY;
if (apiKey) {
    setApiKey(apiKey);
}

/**
 * Callable function to send emails via SendGrid
 * Accept: to, subject, html, leadId, campaignId
 */
exports.sendEmail = onCall({
    // Set memory/timeout if needed
}, async (request) => {
    // 1. Authentication check
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Method must be called by an authenticated user.');
    }

    const { to, subject, html, leadId, campaignId } = request.data;

    // 2. Validation
    if (!to || !subject || !html) {
        throw new HttpsError('invalid-argument', 'Missing to, subject, or html body.');
    }

    // Ensure API key is set if it was loaded late
    const currentApiKey = process.env.SEND_API_KEY;
    if (currentApiKey) {
        setApiKey(currentApiKey);
    }

    // 3. Prepare SendGrid message
    const msg = {
        to,
        from: 'blackagarboltagon997@gmail.com',
        subject,
        html,
        custom_args: {
            leadId: String(leadId || ''),
            campaignId: String(campaignId || '')
        },
        // We can tracking clicks/opens if needed
        tracking_settings: {
            click_tracking: { enable: true },
            open_tracking: { enable: true }
        }
    };

    try {
        logger.info(`[Email] Sending to ${to} for campaign ${campaignId}`);
        await send(msg);
        return { success: true };
    } catch (error) {
        logger.error('[SendGrid] Error sending email:', error);
        if (error.response) {
            logger.error('[SendGrid] Details:', error.response.body);
        }
        throw new HttpsError('internal', 'Failed to send email through SendGrid provider.');
    }
});
