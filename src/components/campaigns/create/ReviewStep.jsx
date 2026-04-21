import React from 'react';
import SanitizedHTML from '../../ui/sanitizedHTML/sanitizedHTML';

const ReviewStep = ({ 
    formData, 
    projectName, 
    selectedLeadsCount 
}) => {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaign</p>
                    <p className="text-lg font-bold text-slate-900 mt-1">{formData.name}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project</p>
                    <p className="text-lg font-bold text-slate-900 mt-1">{projectName}</p>
                </div>
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-100/20">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Audience</p>
                    <p className="text-lg font-bold text-emerald-900 mt-1">{selectedLeadsCount} Leads</p>
                </div>
            </div>
            <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center px-8">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Email Body Preview</span>
                    <span className="text-xs font-bold text-primary max-w-[60%] truncate">{formData.subject}</span>
                </div>
                <div className="p-10 prose prose-slate max-w-none bg-white">
                    <SanitizedHTML html={formData.emailContent} />
                </div>
            </div>
        </div>
    );
};

export default ReviewStep;



