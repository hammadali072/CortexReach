// src/services/emailService.js
// ─────────────────────────────────────────────────────────────────────────────
// CortexReach — Email Service (Resend via Vercel API)
// Replaces the deprecated SendGrid stub.
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Launch a campaign — sends emails to all assigned leads via Resend.
 *
 * Calls POST /api/send-campaign (Vercel serverless function)
 * That function fetches all campaign/lead data from Firebase,
 * renders React Email templates, and sends via Resend batch API.
 *
 * @param {string} campaignId  — Firebase campaign ID (from useParams)
 * @returns {Promise<{ success: boolean, totalSent: number, campaignId: string }>}
 * @throws {Error} with a user-readable message on failure
 */
export const launchCampaign = async (campaignId) => {
    const response = await fetch(`${API_BASE}/api/send-campaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
    });

    const data = await response.json();

    if (!response.ok) {
        // Surface the server error message to the toast in CampaignDetail
        throw new Error(data.error || `Server error ${response.status} — please try again.`);
    }

    return data; // { success: true, totalSent: N, campaignId }
};

/**
 * Send a single test email to yourself before launching.
 * Useful for verifying the rendered template looks correct.
 *
 * Calls POST /api/send-test-email
 *
 * @param {string} campaignId
 * @param {string} toEmail     — your own email address
 * @returns {Promise<{ success: boolean }>}
 */
export const sendTestEmail = async (campaignId, toEmail) => {
    const response = await fetch(`${API_BASE}/api/send-test-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, toEmail }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || `Server error ${response.status}`);
    }

    return data;
};
