import React from 'react';
import { Loader2, Check } from 'lucide-react';

const SettingsSection = ({ 
    title, 
    subtitle, 
    children, 
    onSave, 
    saving, 
    saved, 
    error,
    showSave = true 
}) => {
    return (
        <div className="bg-white p-5 md:p-8 rounded-[12px] border border-slate-200 shadow-sm animate-in fade-in slide-in-from-right-4">
            <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
            </div>

            <div className="space-y-6">
                {children}
            </div>

            {showSave && (
                <div className="mt-10 pt-8 border-t border-slate-100">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm font-medium animate-in shake">
                            <i className="fas fa-exclamation-circle mr-2" />
                            {error}
                        </div>
                    )}
                    
                    <div className="flex justify-end">
                        <button
                            onClick={onSave}
                            disabled={saving || saved}
                            className={`px-8 py-3 rounded-[8px] font-bold text-sm transition-all shadow-lg flex items-center gap-2 ${
                                saved 
                                    ? 'bg-emerald-500 text-white shadow-emerald-100' 
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                            }`}
                        >
                            {saving ? (
                                <><Loader2 size={16} className="animate-spin" /> Saving...</>
                            ) : saved ? (
                                <><Check size={16} /> Saved</>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsSection;
