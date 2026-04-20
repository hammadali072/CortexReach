export const ACTIONS = {
    SET_PROJECT_DATA: 'SET_PROJECT_DATA',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
    SET_SOURCING_MODAL: 'SET_SOURCING_MODAL',
    SET_IMPORT_TOAST: 'SET_IMPORT_TOAST',
    SET_AI_LEADS: 'SET_AI_LEADS',
    SET_FILTERS: 'SET_FILTERS'
};

export const INITIAL_STATE = {
    project: null,
    projectLeads: [],
    projectCampaigns: [],
    dbLoading: true,
    dbError: '',
    activeTab: 'overview',
    isSourcingModalOpen: false,
    importToast: null,
    aiLeads: [],
    relevanceFilter: 0,
    personaFilter: ''
};

export function projectReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_PROJECT_DATA:
            return { 
                ...state, 
                project: action.payload.project,
                projectLeads: action.payload.leads,
                projectCampaigns: action.payload.campaigns,
                dbLoading: false 
            };
        case ACTIONS.SET_LOADING:
            return { ...state, dbLoading: action.payload };
        case ACTIONS.SET_ERROR:
            return { ...state, dbError: action.payload, dbLoading: false };
        case ACTIONS.SET_ACTIVE_TAB:
            return { ...state, activeTab: action.payload };
        case ACTIONS.SET_SOURCING_MODAL:
            return { ...state, isSourcingModalOpen: action.payload };
        case ACTIONS.SET_IMPORT_TOAST:
            return { ...state, importToast: action.payload };
        case ACTIONS.SET_AI_LEADS:
            return { ...state, aiLeads: action.payload };
        case ACTIONS.SET_FILTERS:
            return { ...state, ...action.payload };
        default:
            return state;
    }
}

export const MOCK_GENERATED_LEADS = [
    { id: 'ai-1', name: 'James Wilson', company: 'Nexus Systems', role: 'CTO', industry: 'Enterprise SaaS', relevance: 98, status: 'New', persona: 'The Visionary CTO' },
    { id: 'ai-2', name: 'Sarah Chen', company: 'Global Stream', role: 'VP Growth', industry: 'E-commerce', relevance: 92, status: 'New', persona: 'The Growth VP' },
    { id: 'ai-3', name: 'Marcus Thorne', company: 'Scale Logic', role: 'VP Engineering', industry: 'FinTech', relevance: 89, status: 'New', persona: 'The Visionary CTO' },
    { id: 'ai-4', name: 'Elena Rodriguez', company: 'Product Mint', role: 'Head of Product', industry: 'Product-Led Growth', relevance: 85, status: 'New', persona: 'The Product Lead' },
    { id: 'ai-5', name: 'David Kim', company: 'Innova Cloud', role: 'Chief Architect', industry: 'Enterprise SaaS', relevance: 82, status: 'New', persona: 'The Visionary CTO' },
    { id: 'ai-6', name: 'Sophie Laurent', company: 'Market Flow', role: 'Growth Lead', industry: 'FinTech', relevance: 78, status: 'New', persona: 'The Growth VP' },
];
