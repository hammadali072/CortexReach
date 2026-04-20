import React from 'react';
import { Eye, ExternalLink, Trash2 } from 'lucide-react';
import SettingsSection from '../SettingsSection';
import ToggleSwitch from '../ToggleSwitch';

const SendingTab = ({ 
    settings, 
    setSettings, 
    setHasUnsavedChanges, 
    handleSave, 
    saving, 
    saved, 
    error 
}) => {
    return (
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
                    <label htmlFor="dailyLimit" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 cursor-pointer">Daily Send Limit</label>
                    <select
                        id="dailyLimit"
                        value={settings.dailySendLimit}
                        onChange={(e) => {
                            setSettings(prev => ({ ...prev, dailySendLimit: Number(e.target.value) }));
                            setHasUnsavedChanges(true);
                        }}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[8px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
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
                    <label htmlFor="delayEmails" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 cursor-pointer">Pause Between Emails</label>
                    <select
                        id="delayEmails"
                        value={settings.delayBetweenEmails}
                        onChange={(e) => {
                            setSettings(prev => ({ ...prev, delayBetweenEmails: Number(e.target.value) }));
                            setHasUnsavedChanges(true);
                        }}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[8px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
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
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                            setSettings(prev => ({ ...prev, trackOpens: !prev.trackOpens }));
                            setHasUnsavedChanges(true);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                setSettings(prev => ({ ...prev, trackOpens: !prev.trackOpens }));
                                setHasUnsavedChanges(true);
                            }
                        }}
                        className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-[12px] cursor-pointer hover:border-primary/20 transition-all group outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-accent group-hover:scale-110 transition-transform">
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
    );
};

export default SendingTab;
