import React from 'react';
import { Info, Eye, EyeOff, ExternalLink } from 'lucide-react';
import SettingsSection from '../SettingsSection';

const InboxTab = ({ 
    settings, 
    setSettings, 
    setHasUnsavedChanges, 
    handleSave, 
    saving, 
    saved, 
    error,
    showApiKey,
    setShowApiKey
}) => {
    return (
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
            <div className="bg-white-tint border border-white-tint rounded-[12px] p-6 flex items-start gap-4 mb-4">
                <Info className="text-primary shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-primary font-semibold leading-relaxed">
                    These settings are used as defaults for all campaigns. You can override them individually when creating a campaign.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label htmlFor="fromName" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 cursor-pointer">From Name</label>
                    <input
                        id="fromName"
                        type="text"
                        value={settings.fromName}
                        onChange={(e) => {
                            setSettings(prev => ({ ...prev, fromName: e.target.value }));
                            setHasUnsavedChanges(true);
                        }}
                        placeholder="e.g. John from CortexReach"
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[8px] font-medium text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                    <p className="text-[10px] text-slate-400 font-bold ml-1">This appears as the sender name in the lead's inbox.</p>
                </div>
                <div className="space-y-2">
                    <label htmlFor="fromEmail" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 cursor-pointer">From Email</label>
                    <input
                        id="fromEmail"
                        type="email"
                        value={settings.fromEmail}
                        onChange={(e) => {
                            setSettings(prev => ({ ...prev, fromEmail: e.target.value }));
                            setHasUnsavedChanges(true);
                        }}
                        placeholder="e.g. john@yourdomain.com"
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[8px] font-medium text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                    <p className="text-[10px] text-slate-400 font-bold ml-1">Must be a verified domain in your Resend account.</p>
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="replyToEmail" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 cursor-pointer">Reply-To Email</label>
                <input
                    id="replyToEmail"
                    type="email"
                    value={settings.replyToEmail}
                    onChange={(e) => {
                        setSettings(prev => ({ ...prev, replyToEmail: e.target.value }));
                        setHasUnsavedChanges(true);
                    }}
                    placeholder="e.g. replies@yourdomain.com"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[8px] font-medium text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                <p className="text-[10px] text-slate-400 font-bold ml-1">Optional. Replies from leads will go to this address.</p>
            </div>

            <div className="space-y-2">
                <label htmlFor="resendApiKey" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 cursor-pointer">Resend API Key</label>
                <div className="relative">
                    <input
                        id="resendApiKey"
                        type={showApiKey ? "text" : "password"}
                        value={settings.resendApiKey}
                        onChange={(e) => {
                            setSettings(prev => ({ ...prev, resendApiKey: e.target.value }));
                            setHasUnsavedChanges(true);
                        }}
                        placeholder="re_xxxxxxxxxxxxxxxxxxxx"
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[8px] font-medium text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                    <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary"
                        aria-label={showApiKey ? "Hide API key" : "Show API key"}
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
                        className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
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
    );
};

export default InboxTab;


