// src/emails/index.js
// ─────────────────────────────────────────────────────────────────────────────
// Campaign type metadata registry.
// Used by: Templates.jsx (display), CampaignCreate.jsx (validation).
// Actual email HTML rendering is done by renderEmails.js (pure JS).
// ─────────────────────────────────────────────────────────────────────────────

export const EMAIL_TEMPLATE_REGISTRY = {
    brand_introduction: {
        name: 'Brand Introduction',
        description: 'Perfect for first-time outreach to introduce your project and core value proposition.',
        icon: 'fa-bullhorn',
        color: 'bg-blue-50 text-blue-600'
    },
    product_pitch: {
        name: 'Product Pitch',
        description: 'A direct, benefit-focused pitch highlighting how your product solves specific industry problems.',
        icon: 'fa-box-open',
        color: 'bg-emerald-50 text-emerald-600'
    },
    problem_solution: {
        name: 'Problem → Solution',
        description: 'Builds empathy by addressing a common industry pain point before presenting your platform as the fix.',
        icon: 'fa-lightbulb',
        color: 'bg-amber-50 text-amber-600'
    },
    demo_request: {
        name: 'Demo Request',
        description: 'Designed to drive high-intent leads toward a scheduled product walkthrough or discovery call.',
        icon: 'fa-calendar-check',
        color: 'bg-indigo-50 text-indigo-600'
    },

    partnership: {
        name: 'Partnership',
        description: 'Focused on long-term collaboration and mutual benefit rather than a standard sales pitch.',
        icon: 'fa-handshake',
        color: 'bg-purple-50 text-purple-600'
    },
};

export const ALL_TEMPLATES = Object.entries(EMAIL_TEMPLATE_REGISTRY).map(([id, data]) => ({
    id,
    ...data
}));

/**
 * Returns true if a template is registered for the given campaign type.
 * Used in CampaignCreate.jsx to validate before rendering.
 */
export const hasEmailTemplate = (campaignType) => {
    return campaignType in EMAIL_TEMPLATE_REGISTRY;
};
