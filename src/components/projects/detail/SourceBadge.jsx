import React from 'react';

const SourceBadge = ({ source }) => {
    if (source === 'csv_import') return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-black border border-emerald-100 uppercase tracking-tighter">
            <i className="fas fa-file-csv text-[9px]" /> CSV Import
        </span>
    );
    if (source === 'ai') return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[11px] font-black border border-primary/10 uppercase tracking-tighter">
            <i className="fas fa-brain text-[9px]" /> AI
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-black uppercase tracking-tighter">
            <i className="fas fa-user text-[9px]" /> Manual
        </span>
    );
};

export default SourceBadge;
