export const ACTIONS = {
    SET_STEP: 'SET_STEP',
    NEXT_STEP: 'NEXT_STEP',
    PREV_STEP: 'PREV_STEP',
    UPDATE_FORM: 'UPDATE_FORM',
    SET_PROJECTS: 'SET_PROJECTS',
    SET_LEADS: 'SET_LEADS',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_SUBMITTING: 'SET_SUBMITTING',
    SET_LAUNCHING: 'SET_LAUNCHING'
};

export const INITIAL_STATE = {
    currentStep: 1,
    formData: {
        project: '',
        name: '',
        campaignType: '',
        templateId: '',
        subject: '',
        emailContent: '',
        selectedRows: [],
        templateStyle: 'clean_minimal',
        accentColor: '#4f46e5'
    },
    dbProjects: [],
    dbLeads: [],
    selectedProject: null,
    loading: {
        projects: true,
        leads: false,
        submitting: false,
        launching: false
    },
    errors: {
        projects: '',
        submit: ''
    }
};

export function campaignReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_STEP:
            return { ...state, currentStep: action.payload };
        case ACTIONS.NEXT_STEP:
            return { ...state, currentStep: state.currentStep + 1 };
        case ACTIONS.PREV_STEP:
            return { ...state, currentStep: Math.max(1, state.currentStep - 1) };
        case ACTIONS.UPDATE_FORM:
            return { 
                ...state, 
                formData: { ...state.formData, ...action.payload } 
            };
        case ACTIONS.SET_PROJECTS:
            return { ...state, dbProjects: action.payload };
        case ACTIONS.SET_LEADS:
            return { ...state, dbLeads: action.payload };
        case ACTIONS.SET_LOADING:
            return { 
                ...state, 
                loading: { ...state.loading, ...action.payload } 
            };
        case ACTIONS.SET_ERROR:
            return { 
                ...state, 
                errors: { ...state.errors, ...action.payload } 
            };
        default:
            return state;
    }
}
