import { BrandIntroductionEmail } from './templates/brandIntroductionEmail';
import { ProductPitchEmail } from './templates/productPitchEmail';
import { ProblemSolutionEmail } from './templates/problemSolutionEmail';
import { DemoRequestEmail } from './templates/demoRequestEmail';
import { FollowUpEmail } from './templates/followUpEmail';
import { PartnershipEmail } from './templates/partnershipEmail';

/**
 * EMAIL_TEMPLATE_REGISTRY
 *
 * Keys map 1:1 to campaignType values stored in Firebase.
 * Matches CAMPAIGN_TYPES in CampaignCreate.jsx and Templates.jsx exactly.
 *
 * To add a new template:
 *  1. Create the component in /emails/templates/
 *  2. Import it here
 *  3. Add the key matching its campaignType
 */
export const EMAIL_TEMPLATE_REGISTRY = {
    brand_introduction: {
        component: BrandIntroductionEmail,
        name: 'Brand Introduction',
        description: 'Perfect for first-time outreach to introduce your project and core value proposition.',
        icon: 'fa-bullhorn',
        color: 'bg-blue-50 text-blue-600'
    },
    product_pitch: {
        component: ProductPitchEmail,
        name: 'Product Pitch',
        description: 'A direct, benefit-focused pitch highlighting how your product solves specific industry problems.',
        icon: 'fa-box-open',
        color: 'bg-emerald-50 text-emerald-600'
    },
    problem_solution: {
        component: ProblemSolutionEmail,
        name: 'Problem → Solution',
        description: 'Builds empathy by addressing a common industry pain point before presenting your platform as the fix.',
        icon: 'fa-lightbulb',
        color: 'bg-amber-50 text-amber-600'
    },
    demo_request: {
        component: DemoRequestEmail,
        name: 'Demo Request',
        description: 'Designed to drive high-intent leads toward a scheduled product walkthrough or discovery call.',
        icon: 'fa-calendar-check',
        color: 'bg-indigo-50 text-indigo-600'
    },
    follow_up: {
        component: FollowUpEmail,
        name: 'Follow-up',
        description: 'A gentle nudge to stay top-of-mind with leads who haven’t responded to your initial message.',
        icon: 'fa-reply-all',
        color: 'bg-slate-50 text-slate-600'
    },
    partnership: {
        component: PartnershipEmail,
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
 * Returns the React Email component for a given campaign type.
 * Falls back to BrandIntroductionEmail if the type is not registered.
 *
 * @param {string} campaignType — e.g. "product_pitch"
 * @returns React component
 */
export const getEmailTemplate = (campaignType) => {
    return EMAIL_TEMPLATE_REGISTRY[campaignType]?.component ?? BrandIntroductionEmail;
};

/**
 * Returns true if a template is registered for the given campaign type.
 *
 * @param {string} campaignType
 * @returns boolean
 */
export const hasEmailTemplate = (campaignType) => {
    return campaignType in EMAIL_TEMPLATE_REGISTRY;
};
