import React from 'react';
import { Languages, Building2, Wand2, Check } from 'lucide-react';
import SettingsSection from '../SettingsSection';

const AITab = ({ 
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
                    <p className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Default Outreach Tone</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { id: 'professional', label: 'Professional', icon: '💼', desc: 'Formal, clear and polished' },
                            { id: 'friendly', label: 'Friendly', icon: '😊', desc: 'Warm, casual and approachable' },
                            { id: 'direct', label: 'Direct', icon: '⚡', desc: 'No-fluff, straight-to-the-point' }
                        ].map(tone => (
                            <div
                                key={tone.id}
                                role="radio"
                                aria-checked={settings.aiTone === tone.id}
                                tabIndex={0}
                                onClick={() => {
                                    setSettings(prev => ({ ...prev, aiTone: tone.id }));
                                    setHasUnsavedChanges(true);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        setSettings(prev => ({ ...prev, aiTone: tone.id }));
                                        setHasUnsavedChanges(true);
                                    }
                                }}
                                className={`p-5 rounded-[16px] border-2 transition-all cursor-pointer group outline-none focus:ring-2 focus:ring-primary/20 ${settings.aiTone === tone.id
                                    ? 'border-primary bg-white-tint shadow-lg shadow-primary/10'
                                    : 'border-slate-100 bg-white hover:border-primary/20'
                                    }`}
                            >
                                <span className="text-2xl mb-3 block group-hover:scale-125 transition-transform origin-left">{tone.icon}</span>
                                <p className={`font-black text-sm mb-1 ${settings.aiTone === tone.id ? 'text-primary' : 'text-slate-900'}`}>{tone.label}</p>
                                <p className="text-[11px] text-slate-500 font-medium">{tone.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="aiLanguage" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 cursor-pointer">Default Writing Language</label>
                    <div className="relative">
                        <select
                            id="aiLanguage"
                            value={settings.aiLanguage}
                            onChange={(e) => {
                                setSettings(prev => ({ ...prev, aiLanguage: e.target.value }));
                                setHasUnsavedChanges(true);
                            }}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[8px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
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
                        <label htmlFor="companyName" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 cursor-pointer">Company Name</label>
                        <div className="relative">
                            <input
                                id="companyName"
                                type="text"
                                value={settings.companyName}
                                onChange={(e) => {
                                    setSettings(prev => ({ ...prev, companyName: e.target.value }));
                                    setHasUnsavedChanges(true);
                                }}
                                placeholder="e.g. CortexReach"
                                className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-[8px] font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                            <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        </div>
                    </div>

                    <div className="space-y-2 relative">
                        <label htmlFor="companyDesc" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 cursor-pointer">Company Description</label>
                        <textarea
                            id="companyDesc"
                            rows={4}
                            value={settings.companyDescription}
                            maxLength={300}
                            onChange={(e) => {
                                setSettings(prev => ({ ...prev, companyDescription: e.target.value }));
                                setHasUnsavedChanges(true);
                            }}
                            placeholder="e.g. We help B2B SaaS companies automate cold outreach using AI..."
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[8px] font-medium text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                        />
                        <div className="absolute bottom-4 right-4 text-[9px] font-black text-slate-400 bg-white/80 px-2 py-1 rounded-full backdrop-blur-sm border border-slate-100">
                            {settings.companyDescription?.length || 0} / 300
                        </div>
                    </div>
                </div>

                {/* Live Preview Box */}
                <div className="mt-8 p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[16px] animate-in fade-in zoom-in-95">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-white">
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
    );
};

export default AITab;
