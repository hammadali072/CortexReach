/**
 * emailService.js - React Service Layer
 * Bridge to Firebase Cloud Functions for SendGrid integration
 */

import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../firebase'; // Reference existing firebase.jsx app

// Use functions in the default region (us-central1 usually)
const functions = getFunctions(app);

/**
 * Call the Firebase Cloud Function to send a campaign email.
 * This runs on the server to keep API keys secure.
 * 
 * @param {Object} emailData
 * @param {string} emailData.to - Recipient 
 * @param {string} emailData.subject - Subject line
 * @param {string} emailData.html - Email body (HTML)
 * @param {string} emailData.leadId - ID for lead (for tracking)
 * @param {string} emailData.campaignId - ID for campaign (for tracking)
 * @returns {Promise<{ success: boolean }>}
 */
export const sendCampaignEmail = async (emailData) => {
    // Reference the "sendEmail" callable function
    const sendEmailFn = httpsCallable(functions, 'sendEmail');

    try {
        console.log(`[EmailService] Attempting to send to ${emailData.to}...`);

        // Call the function with data
        const result = await sendEmailFn(emailData);

        // Firebase Functions result.data is our '{ success: true }' return
        return result.data;

    } catch (error) {
        /**
         * Error Handling:
         * httpsCallable throws an error with 'code', 'message', and 'details'
         */
        console.error('[EmailService] Dispatch failed:', error.code, error.message);

        // Bubble up for UI feedback
        throw {
            code: error.code || 'unknown',
            message: error.message || 'Failed to dispatch email.',
            details: error.details
        };
    }
};
