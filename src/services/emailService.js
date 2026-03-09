/**
 * emailService.js - React Service Layer
 * DEPRECATED: SendGrid integration removed.
 */

export const sendCampaignEmail = async (emailData) => {
    console.warn('[EmailService] sendCampaignEmail called but service is disabled.');
    throw new Error('Email service is currently disabled.');
};
