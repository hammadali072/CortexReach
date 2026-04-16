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
    let response;
    try {
        response = await fetch(`${API_BASE}/api/send-campaign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId }),
        });
    } catch (err) {
        if (err.message.includes('Failed to fetch')) {
            throw new Error('Server connection failed. If you are developing locally, please ensure "npx vercel dev" is running and has not crashed.');
        }
        throw err;
    }

    // ✅ Read as text first — then try to parse
    const text = await response.text();

    let data;
    try {
        data = JSON.parse(text);
    } catch {
        // Server returned non-JSON (HTML error page, plain text crash message)
        // This usually means vercel dev isn't running or the function crashed hard
        console.error('[emailService] Non-JSON response from server:', text);
        throw new Error(`Server returned unexpected response. Is "npx vercel dev" running? Details: ${text.slice(0, 100)}`);
    }

    if (!response.ok) {
        throw new Error(data?.error || `Server error ${response.status}`);
    }

    return data;
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

/**
 * Fetch all emails from Resend via the backend API.
 * Useful for syncing and showing raw provider logs.
 */
export const fetchResendEmails = async () => {
    const response = await fetch(`${API_BASE}/api/get-resend-emails`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || `Server error ${response.status}`);
    }

    return data.emails || [];
};

/**
 * Fetch a single email from Resend via the backend API by its Resend ID.
 * Useful for getting fully rendered body and subject.
 */
export const fetchResendEmail = async (resendId) => {
    const response = await fetch(`${API_BASE}/api/get-resend-email?id=${resendId}`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || `Server error ${response.status}`);
    }

    return data.email;
};

/**
 * Sync the status of all emails in a campaign from Resend.
 * Useful if webhooks were missed.
 */
export const syncCampaignStatus = async (campaignId) => {
    const response = await fetch(`${API_BASE}/api/sync-campaign-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || `Server error ${response.status}`);
    }

    return data;
};
