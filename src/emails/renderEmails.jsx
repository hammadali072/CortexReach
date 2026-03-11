import { render } from '@react-email/render';
import { getEmailTemplate } from './index';

/**
 * Renders the correct email template to HTML string.
 * 
 * @param {string} campaignType  - e.g. "brand_introduction"
 * @param {object} project       - Firebase project doc
 * @param {object} lead          - Firebase lead doc
 * @returns {string}             - Full HTML string ready to send
 */
export const renderCampaignEmail = async (campaignType, project, lead) => {
    const EmailComponent = getEmailTemplate(campaignType);

    // Map your Firebase data shapes to template props
    const features = Array.isArray(project.features)
        ? project.features
        : (project.features?.split(',').map(f => f.trim()) ?? []);

    const props = {
        // Lead props
        leadFirstName: lead.firstName || lead.first_name || lead.name?.split(' ')[0] || 'there',

        // Project props — same keys you already use in CampaignCreate.jsx
        projectName: project.name || '',
        industry: project.industry || '',
        mainBenefit: project.description || '',
        keyFeature1: features[0] || 'core efficiency',
        keyFeature2: features[1] || 'seamless workflow',
        website: project.website || '#',

        // System
        unsubscribeUrl: `https://yourapp.com/unsubscribe?lead=${lead.id}`,
    };

    const html = await render(<EmailComponent {...props} />);
    return html;
};