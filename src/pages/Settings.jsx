import { useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Send, Wand2, TriangleAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import TitleComponent from '../components/titleComponent/titleComponent';
import { useAuth } from '../context/AuthContext';
import {
    getUserSettings,
    saveUserSettings,
    updateUserProfile,
    changeUserPassword,
    deleteAllLeads,
    deleteUserAccount
} from '../services/settingsService';

import ConfirmModal from '../components/settings/ConfirmModal';
import ProfileTab from '../components/settings/tabs/ProfileTab';
import InboxTab from '../components/settings/tabs/InboxTab';
import SendingTab from '../components/settings/tabs/SendingTab';
import AITab from '../components/settings/tabs/AITab';
import DangerTab from '../components/settings/tabs/DangerTab';

import { ACTIONS, INITIAL_STATE, settingsReducer } from '../components/settings/state';

const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'inbox', label: 'Connected Inbox', icon: Mail },
    { id: 'sending', label: 'Sending Defaults', icon: Send },
    { id: 'ai', label: 'AI Preferences', icon: Wand2 },
    { id: 'danger', label: 'Danger Zone', icon: TriangleAlert },
];

const Settings = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(settingsReducer, INITIAL_STATE);

    const {
        activeTab,
        loading,
        hasUnsavedChanges,
        settings,
        passwordData,
        saving,
        saved,
        error,
        showApiKey,
        showPasswords,
        modal
    } = state;

    useEffect(() => {
        if (!currentUser) return;
        const load = async () => {
            try {
                dispatch({ type: ACTIONS.SET_LOADING, payload: true });
                const data = await getUserSettings(currentUser.uid);
                dispatch({ 
                    type: ACTIONS.SET_SETTINGS, 
                    payload: {
                        ...data,
                        displayName: data.displayName || currentUser.displayName || ''
                    } 
                });
            } catch (err) {
                console.error('[Settings] Load error:', err);
                toast.error('Failed to load settings.');
                dispatch({ type: ACTIONS.SET_LOADING, payload: false });
            }
        };
        load();
    }, [currentUser]);

    const handleTabChange = (tabId) => {
        if (hasUnsavedChanges) {
            if (!window.confirm('You have unsaved changes. Are you sure you want to leave?')) return;
        }
        dispatch({ type: ACTIONS.SET_ACTIVE_TAB, payload: tabId });
    };

    const handleSave = async (dataSubset) => {
        dispatch({ type: ACTIONS.SET_SAVING, payload: true });
        try {
            await saveUserSettings(currentUser.uid, dataSubset);

            if (dataSubset.displayName) {
                await updateUserProfile(dataSubset.displayName);
            }

            if (dataSubset.aiTone || dataSubset.companyName) {
                const currentAI = JSON.parse(localStorage.getItem('cortex_ai_prefs') || '{}');
                localStorage.setItem('cortex_ai_prefs', JSON.stringify({ ...currentAI, ...dataSubset }));
            }

            dispatch({ type: ACTIONS.SET_SAVED, payload: true });
            setTimeout(() => dispatch({ type: ACTIONS.SET_SAVED, payload: false }), 2000);
            toast.success('Settings saved successfully.');
        } catch (err) {
            console.error('[Settings] Save error:', err);
            dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Failed to save settings.' });
            toast.error('Failed to save settings.');
        }
    };

    const handlePasswordUpdate = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        
        if (passwordData.new.length < 8) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: 'New password must be at least 8 characters.' });
            return;
        }
        if (passwordData.new !== passwordData.confirm) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: 'Passwords do not match.' });
            return;
        }

        dispatch({ type: ACTIONS.SET_SAVING, payload: true });
        try {
            await changeUserPassword(passwordData.current, passwordData.new);
            dispatch({ type: ACTIONS.SET_PASSWORD_DATA, payload: { current: '', new: '', confirm: '' } });
            toast.success('Password updated successfully.');
            dispatch({ type: ACTIONS.SET_SAVED, payload: true });
            setTimeout(() => dispatch({ type: ACTIONS.SET_SAVED, payload: false }), 2000);
        } catch (err) {
            console.error('[Settings] Password error:', err);
            const msg = err.code === 'auth/wrong-password' ? 'Current password is incorrect.' 
                      : err.code === 'auth/requires-recent-login' ? 'Please sign out and sign back in before changing your password.'
                      : err.message;
            dispatch({ type: ACTIONS.SET_ERROR, payload: msg });
        }
    };

    const confirmAction = async (val) => {
        const type = modal.type;
        dispatch({ type: ACTIONS.SET_MODAL, payload: { open: false, type: null } });

        try {
            if (type === 'logout') {
                await logout();
                navigate('/login');
            } else if (type === 'purge_leads') {
                await deleteAllLeads(currentUser.uid);
                toast.success('All leads have been deleted.');
            } else if (type === 'delete_account') {
                await deleteUserAccount(currentUser.uid, val);
                navigate('/');
                toast.success('Account deleted.');
            }
        } catch (err) {
            console.error(`[Settings] ${type} error:`, err);
            toast.error(err.message || 'Operation failed.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
                <p className="text-slate-400 font-medium animate-pulse">Fetching your configuration...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <TitleComponent type="h1" className="text-slate-900 text-3xl font-black font-idGrotesk">
                        Account Settings
                    </TitleComponent>
                    <TitleComponent type="p" size="base" className="text-slate-500 mt-1">
                        Configure your outreach identity, sending limits, and AI personality.
                    </TitleComponent>
                </div>
                <div className="bg-slate-100 px-4 py-2 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Operational</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-[16px] border border-slate-200 p-1.5 shadow-sm sticky top-8 flex lg:flex-col overflow-x-auto lg:overflow-x-visible no-scrollbar">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`flex-shrink-0 lg:w-full flex items-center gap-3 lg:gap-4 px-5 py-3 lg:py-4 rounded-[12px] transition-all font-bold text-sm group ${
                                         isActive 
                                             ? 'bg-primary text-white shadow-brand scale-[1.02]' 
                                             : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                     }`}
                                >
                                    <Icon size={18} className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'} transition-colors`} />
                                    <span className="whitespace-nowrap">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="lg:col-span-9">
                    {activeTab === 'profile' && (
                        <ProfileTab 
                            currentUser={currentUser}
                            settings={settings}
                            setSettings={(s) => dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: s })}
                            setHasUnsavedChanges={(b) => dispatch({ type: ACTIONS.SET_HAS_CHANGES, payload: b })}
                            handleSave={handleSave}
                            saving={saving}
                            saved={saved}
                            error={error}
                            passwordData={passwordData}
                            setPasswordData={(p) => dispatch({ type: ACTIONS.SET_PASSWORD_DATA, payload: p })}
                            handlePasswordUpdate={handlePasswordUpdate}
                            showPasswords={showPasswords}
                            setShowPasswords={(sp) => dispatch({ type: ACTIONS.SET_UI_STATE, payload: { showPasswords: sp } })}
                        />
                    )}

                    {activeTab === 'inbox' && (
                        <InboxTab 
                            settings={settings}
                            setSettings={(s) => dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: s })}
                            setHasUnsavedChanges={(b) => dispatch({ type: ACTIONS.SET_HAS_CHANGES, payload: b })}
                            handleSave={handleSave}
                            saving={saving}
                            saved={saved}
                            error={error}
                            showApiKey={showApiKey}
                            setShowApiKey={(b) => dispatch({ type: ACTIONS.SET_UI_STATE, payload: { showApiKey: b } })}
                        />
                    )}

                    {activeTab === 'sending' && (
                        <SendingTab 
                            settings={settings}
                            setSettings={(s) => dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: s })}
                            setHasUnsavedChanges={(b) => dispatch({ type: ACTIONS.SET_HAS_CHANGES, payload: b })}
                            handleSave={handleSave}
                            saving={saving}
                            saved={saved}
                            error={error}
                        />
                    )}

                    {activeTab === 'ai' && (
                        <AITab 
                            settings={settings}
                            setSettings={(s) => dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: s })}
                            setHasUnsavedChanges={(b) => dispatch({ type: ACTIONS.SET_HAS_CHANGES, payload: b })}
                            handleSave={handleSave}
                            saving={saving}
                            saved={saved}
                            error={error}
                        />
                    )}

                    {activeTab === 'danger' && (
                        <DangerTab setModal={(m) => dispatch({ type: ACTIONS.SET_MODAL, payload: m })} />
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={modal.open}
                onClose={() => dispatch({ type: ACTIONS.SET_MODAL, payload: { open: false, type: null } })}
                onConfirm={confirmAction}
                title={
                    modal.type === 'logout' ? 'Sign Out' :
                    modal.type === 'purge_leads' ? 'Purge All Leads' :
                    'Delete Account'
                }
                description={
                    modal.type === 'logout' ? 'Are you sure you want to sign out?' :
                    modal.type === 'purge_leads' ? 'This will delete all leads from all projects. This cannot be undone.' :
                    'This will permanently delete your account and all associated data.'
                }
                confirmLabel={
                    modal.type === 'logout' ? 'Sign Out' :
                    modal.type === 'purge_leads' ? 'Purge Now' :
                    'Delete Everything'
                }
                requireTyping={modal.type === 'purge_leads' ? 'PURGE' : null}
                requirePassword={modal.type === 'delete_account'}
            />
        </div>
    );
};

export default Settings;
