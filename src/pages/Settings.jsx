import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Send,
    Wand2,
    TriangleAlert,
    Lock,
    Eye,
    EyeOff,
    ChevronRight,
    Loader2,
    Check,
    Globe,
    Building2,
    Languages,
    LogOut,
    Trash2,
    Info,
    ExternalLink
} from 'lucide-react';
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

// Sub-components
import ToggleSwitch from '../components/settings/ToggleSwitch';
import SettingsSection from '../components/settings/SettingsSection';
import ConfirmModal from '../components/settings/ConfirmModal';

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
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Form States
    const [settings, setSettings] = useState({
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
    });

    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    // UI States
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

    // Modal States
    const [modal, setModal] = useState({ open: false, type: null });

    // Load settings
    useEffect(() => {
        if (!currentUser) return;

        const load = async () => {
            try {
                setLoading(true);
                const data = await getUserSettings(currentUser.uid);
                setSettings(prev => ({
                    ...prev,
                    ...data,
                    displayName: data.displayName || currentUser.displayName || ''
                }));
            } catch (err) {
                console.error('[Settings] Load error:', err);
                toast.error('Failed to load settings.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [currentUser]);

    // Handle Tab Change with confirmation
    const handleTabChange = (tabId) => {
        if (hasUnsavedChanges) {
            const confirm = window.confirm('You have unsaved changes. Are you sure you want to leave?');
            if (!confirm) return;
        }
        setActiveTab(tabId);
        setHasUnsavedChanges(false);
        setError('');
        setSaved(false);
    };

    const handleSave = async (dataSubset) => {
        setSaving(true);
        setError('');
        try {
            await saveUserSettings(currentUser.uid, dataSubset);

            // If display name changed, update auth profile too
            if (dataSubset.displayName) {
                await updateUserProfile(dataSubset.displayName);
            }

            // Local storage sync for AI preferences
            if (dataSubset.aiTone || dataSubset.companyName) {
                const currentAI = JSON.parse(localStorage.getItem('cortex_ai_prefs') || '{}');
                localStorage.setItem('cortex_ai_prefs', JSON.stringify({
                    ...currentAI,
                    ...dataSubset
                }));
            }

            setSaved(true);
            setHasUnsavedChanges(false);
            setTimeout(() => setSaved(false), 2000);
            toast.success('Settings saved successfully.');
        } catch (err) {
            console.error('[Settings] Save error:', err);
            setError(err.message || 'Failed to save settings.');
            toast.error('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordData.new.length < 8) {
            setError('New password must be at least 8 characters.');
            return;
        }
        if (passwordData.new !== passwordData.confirm) {
            setError('Passwords do not match.');
            return;
        }

        setSaving(true);
        setError('');
        try {
            await changeUserPassword(passwordData.current, passwordData.new);
            setPasswordData({ current: '', new: '', confirm: '' });
            toast.success('Password updated successfully.');
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error('[Settings] Password error:', err);
            if (err.code === 'auth/wrong-password') {
                setError('Current password is incorrect.');
            } else if (err.code === 'auth/requires-recent-login') {
                setError('Please sign out and sign back in before changing your password.');
            } else {
                setError(err.message);
            }
        } finally {
            setSaving(false);
        }
    };

    const confirmAction = async (val) => {
        const type = modal.type;
        setModal({ open: false, type: null });

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
                <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-400 font-medium animate-pulse">Fetching your configuration...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
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

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                
                {/* Navigation Sidebar - Horizontal Scroll on Mobile, Vertical on Laptop */}
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
                                            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]' 
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    <Icon size={18} className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'} transition-colors`} />
                                    <span className="whitespace-nowrap">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="p-6 bg-indigo-50/50 rounded-[16px] border border-indigo-100 mt-6 hidden lg:block">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Pro Tip</p>
                        <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                            Use AI Preferences to give the email generator context about your product's unique value props.
                        </p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9">

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            {/* Profile Header Card */}
                            <div className="bg-white p-6 md:p-8 rounded-[12px] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6 md:gap-8">
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl md:text-3xl font-black shadow-xl shadow-indigo-100 uppercase shrink-0">
                                    {settings.displayName?.charAt(0) || currentUser.email?.charAt(0)}
                                </div>
                                <div className="flex-1 text-center md:text-left min-w-0">
                                    <h3 className="text-xl md:text-2xl font-black text-slate-900 truncate">{settings.displayName || 'No Name Set'}</h3>
                                    <p className="text-sm md:text-base text-slate-500 font-medium truncate">{currentUser.email}</p>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                                        <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            UID: {currentUser.uid.slice(0, 8)}...
                                        </div>
                                        <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Member Since: {new Date(currentUser.metadata.creationTime).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <SettingsSection
                                title="Your Profile"
                                subtitle="Update your personal information and public identity."
                                onSave={() => handleSave({ displayName: settings.displayName })}
                                saving={saving}
                                saved={saved}
                                error={error}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Display Name</label>
                                        <input
                                            type="text"
                                            value={settings.displayName}
                                            onChange={(e) => {
                                                setSettings({ ...settings, displayName: e.target.value });
                                                setHasUnsavedChanges(true);
                                            }}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[8px] font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                                        <div className="relative group">
                                            <input
                                                type="email"
                                                value={currentUser.email}
                                                disabled
                                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[8px] font-medium text-slate-400 cursor-not-allowed opacity-70"
                                            />
                                            <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold ml-1 italic italic">Email cannot be changed.</p>
                                    </div>
                                </div>
                            </SettingsSection>

                            <SettingsSection
                                title="Update Password"
                                subtitle="Ensure your account remains secure with a strong password."
                                onSave={handlePasswordUpdate}
                                saving={saving}
                                saved={saved}
                                error={error}
                            >
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Current Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.current ? "text" : "password"}
                                                value={passwordData.current}
                                                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[8px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                                            >
                                                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.new ? "text" : "password"}
                                                    value={passwordData.new}
                                                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[8px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                                                >
                                                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.confirm ? "text" : "password"}
                                                    value={passwordData.confirm}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[8px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                                                >
                                                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SettingsSection>
                        </div>
                    )}

                    {/* INBOX TAB */}
                    {activeTab === 'inbox' && (
                        <SettingsSection
                            title="Connected Inbox"
                            subtitle="Configure the email account used to send your campaigns."
                            onSave={() => handleSave({
                                fromName: settings.fromName,
                                fromEmail: settings.fromEmail,
                                replyToEmail: settings.replyToEmail,
                                resendApiKey: settings.resendApiKey
                            })}
                            saving={saving}
                            saved={saved}
                            error={error}
                        >
                            <div className="bg-indigo-50 border border-indigo-100 rounded-[12px] p-6 flex items-start gap-4 mb-4">
                                <Info className="text-indigo-600 shrink-0 mt-0.5" size={20} />
                                <p className="text-sm text-indigo-700 font-semibold leading-relaxed">
                                    These settings are used as defaults for all campaigns. You can override them individually when creating a campaign.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">From Name</label>
                                    <input
                                        type="text"
                                        value={settings.fromName}
                                        onChange={(e) => {
                                            setSettings({ ...settings, fromName: e.target.value });
                                            setHasUnsavedChanges(true);
                                        }}
                                        placeholder="e.g. John from CortexReach"
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[8px] font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                    <p className="text-[10px] text-slate-400 font-bold ml-1">This appears as the sender name in the lead's inbox.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">From Email</label>
                                    <input
                                        type="email"
                                        value={settings.fromEmail}
                                        onChange={(e) => {
                                            setSettings({ ...settings, fromEmail: e.target.value });
                                            setHasUnsavedChanges(true);
                                        }}
                                        placeholder="e.g. john@yourdomain.com"
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[8px] font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                    <p className="text-[10px] text-slate-400 font-bold ml-1">Must be a verified domain in your Resend account.</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Reply-To Email</label>
                                <input
                                    type="email"
                                    value={settings.replyToEmail}
                                    onChange={(e) => {
                                        setSettings({ ...settings, replyToEmail: e.target.value });
                                        setHasUnsavedChanges(true);
                                    }}
                                    placeholder="e.g. replies@yourdomain.com"
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[8px] font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                                <p className="text-[10px] text-slate-400 font-bold ml-1">Optional. Replies from leads will go to this address.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Resend API Key</label>
                                <div className="relative">
                                    <input
                                        type={showApiKey ? "text" : "password"}
                                        value={settings.resendApiKey}
                                        onChange={(e) => {
                                            setSettings({ ...settings, resendApiKey: e.target.value });
                                            setHasUnsavedChanges(true);
                                        }}
                                        placeholder="re_xxxxxxxxxxxxxxxxxxxx"
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[8px] font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowApiKey(!showApiKey)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                                    >
                                        {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-[10px] text-slate-400 font-bold ml-1">Find this in your Resend dashboard → API Keys.</p>
                                    <a
                                        href="https://resend.com/api-keys"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-indigo-600 hover:underline font-bold flex items-center gap-1"
                                    >
                                        Open Resend <ExternalLink size={12} />
                                    </a>
                                </div>
                            </div>

                            {/* Status Indicator */}
                            <div className="pt-6 mt-6 border-t border-slate-50 flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${settings.resendApiKey && settings.fromEmail ? 'bg-emerald-500 shadow-lg shadow-emerald-100' : 'bg-amber-400 shadow-lg shadow-amber-100'}`} />
                                <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                                    {settings.resendApiKey && settings.fromEmail ? 'Inbox Configured' : 'Setup Incomplete — fill all fields'}
                                </span>
                            </div>
                        </SettingsSection>
                    )}

                    {/* SENDING TAB */}
                    {activeTab === 'sending' && (
                        <SettingsSection
                            title="Sending Defaults"
                            subtitle="Control how and when emails are sent across every active outreach."
                            onSave={() => handleSave({
                                dailySendLimit: settings.dailySendLimit,
                                delayBetweenEmails: settings.delayBetweenEmails,
                                trackOpens: settings.trackOpens
                            })}
                            saving={saving}
                            saved={saved}
                            error={error}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Daily Send Limit</label>
                                    <select
                                        value={settings.dailySendLimit}
                                        onChange={(e) => {
                                            setSettings({ ...settings, dailySendLimit: Number(e.target.value) });
                                            setHasUnsavedChanges(true);
                                        }}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[8px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                                    >
                                        <option value={50}>50 emails / day</option>
                                        <option value={100}>100 emails / day</option>
                                        <option value={200}>200 emails / day</option>
                                        <option value={500}>500 emails / day</option>
                                        <option value={0}>Unlimited</option>
                                    </select>
                                    <p className="text-[10px] text-slate-400 font-bold ml-1">Total volume across all active campaigns.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Pause Between Emails</label>
                                    <select
                                        value={settings.delayBetweenEmails}
                                        onChange={(e) => {
                                            setSettings({ ...settings, delayBetweenEmails: Number(e.target.value) });
                                            setHasUnsavedChanges(true);
                                        }}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[8px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                                    >
                                        <option value={30}>30 seconds</option>
                                        <option value={60}>1 minute</option>
                                        <option value={120}>2 minutes</option>
                                        <option value={300}>5 minutes</option>
                                    </select>
                                    <p className="text-[10px] text-slate-400 font-bold ml-1">Avoid spam filters by spacing out your sends.</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Analytics & Privacy</label>
                                <div className="space-y-3">

                                    <div
                                        onClick={() => {
                                            setSettings({ ...settings, trackOpens: !settings.trackOpens });
                                            setHasUnsavedChanges(true);
                                        }}
                                        className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-[12px] cursor-pointer hover:border-indigo-200 transition-all group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-indigo-500 group-hover:scale-110 transition-transform">
                                                <Eye size={20} />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 text-sm">Track Email Opens</p>
                                                <p className="text-[11px] text-slate-500 font-medium">Embed a pixel to detect when recipients open emails.</p>
                                            </div>
                                        </div>
                                        <ToggleSwitch checked={settings.trackOpens} onChange={() => { }} />
                                    </div>

                                    <div className="flex items-center justify-between p-5 bg-slate-50/50 border border-slate-100 rounded-[12px] opacity-60 cursor-not-allowed">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-400">
                                                <ExternalLink size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-black text-slate-800 text-sm">Track Link Clicks</p>
                                                    <span className="text-[9px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Coming Soon</span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 font-medium">Monitor click-through rates on embedded URLs.</p>
                                            </div>
                                        </div>
                                        <ToggleSwitch checked={false} disabled onChange={() => { }} />
                                    </div>

                                    <div className="flex items-center justify-between p-5 bg-slate-50/50 border border-slate-100 rounded-[12px] opacity-60 cursor-not-allowed">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-400">
                                                <Trash2 size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-black text-slate-800 text-sm">Auto-suppress Unsubscribes</p>
                                                    <span className="text-[9px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Coming Soon</span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 font-medium">Instantly stop outreach if a lead requests removal.</p>
                                            </div>
                                        </div>
                                        <ToggleSwitch checked={false} disabled onChange={() => { }} />
                                    </div>

                                </div>
                            </div>
                        </SettingsSection>
                    )}

                    {/* AI TAB */}
                    {activeTab === 'ai' && (
                        <SettingsSection
                            title="AI Preferences"
                            subtitle="Help the AI write better emails by providing context about your company."
                            onSave={() => handleSave({
                                aiTone: settings.aiTone,
                                aiLanguage: settings.aiLanguage,
                                companyName: settings.companyName,
                                companyDescription: settings.companyDescription
                            })}
                            saving={saving}
                            saved={saved}
                            error={error}
                        >
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Default Outreach Tone</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { id: 'professional', label: 'Professional', icon: '💼', desc: 'Formal, clear and polished' },
                                            { id: 'friendly', label: 'Friendly', icon: '😊', desc: 'Warm, casual and approachable' },
                                            { id: 'direct', label: 'Direct', icon: '⚡', desc: 'No-fluff, straight-to-the-point' }
                                        ].map(tone => (
                                            <div
                                                key={tone.id}
                                                onClick={() => {
                                                    setSettings({ ...settings, aiTone: tone.id });
                                                    setHasUnsavedChanges(true);
                                                }}
                                                className={`p-5 rounded-[16px] border-2 transition-all cursor-pointer group ${settings.aiTone === tone.id
                                                        ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100'
                                                        : 'border-slate-100 bg-white hover:border-indigo-200'
                                                    }`}
                                            >
                                                <span className="text-2xl mb-3 block group-hover:scale-125 transition-transform origin-left">{tone.icon}</span>
                                                <p className={`font-black text-sm mb-1 ${settings.aiTone === tone.id ? 'text-indigo-900' : 'text-slate-900'}`}>{tone.label}</p>
                                                <p className="text-[11px] text-slate-500 font-medium">{tone.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Default Writing Language</label>
                                    <div className="relative">
                                        <select
                                            value={settings.aiLanguage}
                                            onChange={(e) => {
                                                setSettings({ ...settings, aiLanguage: e.target.value });
                                                setHasUnsavedChanges(true);
                                            }}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[8px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="english">English</option>
                                            <option value="spanish">Spanish</option>
                                            <option value="french">French</option>
                                            <option value="german">German</option>
                                            <option value="portuguese">Portuguese</option>
                                            <option value="arabic">Arabic</option>
                                        </select>
                                        <Languages size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold ml-1">AI will generate all outreach copy in this language.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Company Name</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={settings.companyName}
                                                onChange={(e) => {
                                                    setSettings({ ...settings, companyName: e.target.value });
                                                    setHasUnsavedChanges(true);
                                                }}
                                                placeholder="e.g. CortexReach"
                                                className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-[8px] font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            />
                                            <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        </div>
                                    </div>

                                    <div className="space-y-2 relative">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Company Description</label>
                                        <textarea
                                            rows={4}
                                            value={settings.companyDescription}
                                            maxLength={300}
                                            onChange={(e) => {
                                                setSettings({ ...settings, companyDescription: e.target.value });
                                                setHasUnsavedChanges(true);
                                            }}
                                            placeholder="e.g. We help B2B SaaS companies automate cold outreach using AI..."
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[8px] font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                                        />
                                        <div className="absolute bottom-4 right-4 text-[9px] font-black text-slate-400 bg-white/80 px-2 py-1 rounded-full backdrop-blur-sm border border-slate-100">
                                            {settings.companyDescription?.length || 0} / 300
                                        </div>
                                    </div>
                                </div>

                                {/* Live Preview Box */}
                                <div className="mt-8 p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[16px] animate-in fade-in zoom-in-95">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                                            <Wand2 size={14} />
                                        </div>
                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">AI Context Preview</h4>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                            <Check size={14} className="text-emerald-500" />
                                            <span>Sender: <strong className="text-slate-900">You from {settings.companyName || 'your company'}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                            <Check size={14} className="text-emerald-500" />
                                            <span>Personality: <strong className="text-slate-900 capitalize">{settings.aiTone}</strong></span>
                                        </div>
                                        <div className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                                            <Check size={14} className="text-emerald-500 mt-1" />
                                            <span>Core Context: <span className="text-slate-400 italic">"{settings.companyDescription ? settings.companyDescription.slice(0, 80) + '...' : 'Add a description to guide the AI...'}"</span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SettingsSection>
                    )}

                    {/* DANGER TAB */}
                    {activeTab === 'danger' && (
                        <div className="space-y-6">
                            <div className="mb-4">
                                <h3 className="text-xl font-black text-red-600">Danger Zone</h3>
                                <p className="text-sm text-slate-500 mt-1">These actions are destructive and cannot be reversed.</p>
                            </div>

                            {/* Cards */}
                            <div className="space-y-4">

                                <div className="p-8 border border-slate-200 bg-white rounded-[16px] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all group">
                                    <div className="flex items-start gap-5">
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                            <LogOut size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 text-lg">Sign Out</h4>
                                            <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                                                Disconnect from this device. Your data remains perfectly safe.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setModal({ open: true, type: 'logout' })}
                                        className="h-14 px-8 bg-white border border-slate-200 text-slate-700 rounded-[12px] font-black text-sm hover:bg-slate-50 hover:border-slate-300 transition-all min-w-[160px]"
                                    >
                                        Sign Out
                                    </button>
                                </div>

                                <div className="p-8 border border-red-100 bg-red-50/20 rounded-[16px] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all group">
                                    <div className="flex items-start gap-5">
                                        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-400 group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                                            <Trash2 size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-red-900 text-lg">Purge All Leads</h4>
                                            <p className="text-sm text-red-700/60 font-medium mt-1 leading-relaxed">
                                                Permanently deletes every lead from every project. Active campaigns will stop.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setModal({ open: true, type: 'purge_leads' })}
                                        className="h-14 px-8 bg-white border border-red-200 text-red-600 rounded-[12px] font-black text-sm hover:bg-red-600 hover:text-white transition-all min-w-[160px]"
                                    >
                                        Purge Leads
                                    </button>
                                </div>

                                <div className="p-8 border border-red-200 bg-red-600 rounded-[16px] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-red-100 scale-[1.01]">
                                    <div className="flex items-start gap-5">
                                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
                                            <TriangleAlert size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white text-lg font-idGrotesk">Delete Full Account</h4>
                                            <p className="text-sm text-white/80 font-medium mt-1 leading-relaxed">
                                                Everything goes: projects, campaigns, leads, and your identity details.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setModal({ open: true, type: 'delete_account' })}
                                        className="h-14 px-8 bg-white text-red-600 rounded-[12px] font-black text-sm hover:bg-red-50 transition-all min-w-[160px]"
                                    >
                                        Terminate
                                    </button>
                                </div>

                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Modals */}
            <ConfirmModal
                isOpen={modal.open && modal.type === 'logout'}
                onClose={() => setModal({ open: false, type: null })}
                onConfirm={confirmAction}
                variant="info"
                title="Ready to leave?"
                description="Your workspace settings are safe and will be here when you return."
                confirmLabel="Yes, Sign Me Out"
            />

            <ConfirmModal
                isOpen={modal.open && modal.type === 'purge_leads'}
                onClose={() => setModal({ open: false, type: null })}
                onConfirm={confirmAction}
                requireTyping="DELETE"
                title="Are you absolutely sure?"
                description="This will wipe every lead from your database. There is no undo button for this action."
                confirmLabel="Yes, Purge Leads"
            />

            <ConfirmModal
                isOpen={modal.open && modal.type === 'delete_account'}
                onClose={() => setModal({ open: false, type: null })}
                onConfirm={confirmAction}
                requirePassword={true}
                title="Goodbye forever?"
                description="Deleting your account is permanent. We will immediately purge all your outreach data and credentials."
                confirmLabel="Terminate Account"
            />
        </div>
    );
};

export default Settings;
