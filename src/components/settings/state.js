export const ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    SET_SETTINGS: 'SET_SETTINGS',
    UPDATE_SETTINGS: 'UPDATE_SETTINGS',
    SET_SAVING: 'SET_SAVING',
    SET_SAVED: 'SET_SAVED',
    SET_ERROR: 'SET_ERROR',
    SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
    SET_HAS_CHANGES: 'SET_HAS_CHANGES',
    SET_PASSWORD_DATA: 'SET_PASSWORD_DATA',
    SET_UI_STATE: 'SET_UI_STATE',
    SET_MODAL: 'SET_MODAL'
};

export const INITIAL_STATE = {
    activeTab: 'profile',
    loading: true,
    hasUnsavedChanges: false,
    settings: {
        displayName: '',
        fromName: '',
        fromEmail: '',
        replyToEmail: '',
        resendApiKey: '',
        dailySendLimit: 100,
        delayBetweenEmails: 60,
        trackOpens: true,
        aiTone: 'professional',
        aiLanguage: 'english',
        companyName: '',
        companyDescription: '',
    },
    passwordData: {
        current: '',
        new: '',
        confirm: ''
    },
    saving: false,
    saved: false,
    error: '',
    showApiKey: false,
    showPasswords: { current: false, new: false, confirm: false },
    modal: { open: false, type: null }
};

export function settingsReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_LOADING:
            return { ...state, loading: action.payload };
        case ACTIONS.SET_SETTINGS:
            return { 
                ...state, 
                settings: { ...state.settings, ...action.payload },
                loading: false 
            };
        case ACTIONS.UPDATE_SETTINGS:
            return { 
                ...state, 
                settings: { ...state.settings, ...action.payload },
                hasUnsavedChanges: true 
            };
        case ACTIONS.SET_SAVING:
            return { ...state, saving: action.payload, error: action.payload ? '' : state.error };
        case ACTIONS.SET_SAVED:
            return { ...state, saved: action.payload, hasUnsavedChanges: false };
        case ACTIONS.SET_ERROR:
            return { ...state, error: action.payload, saving: false };
        case ACTIONS.SET_ACTIVE_TAB:
            return { ...state, activeTab: action.payload, hasUnsavedChanges: false, error: '' };
        case ACTIONS.SET_HAS_CHANGES:
            return { ...state, hasUnsavedChanges: action.payload };
        case ACTIONS.SET_PASSWORD_DATA:
            return { ...state, passwordData: { ...state.passwordData, ...action.payload } };
        case ACTIONS.SET_UI_STATE:
            return { ...state, ...action.payload };
        case ACTIONS.SET_MODAL:
            return { ...state, modal: action.payload };
        default:
            return state;
    }
}
