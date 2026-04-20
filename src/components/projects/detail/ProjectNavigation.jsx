import React from 'react';

const ProjectNavigation = ({ activeTab, onTabChange, leadsCount }) => {
    return (
        <div className="flex gap-2 p-1.5 bg-slate-100/50 rounded-2xl w-fit border border-slate-100">
            {['overview', 'leads', 'campaigns'].map(tab => (
                <button
                    key={`tab-btn-${tab}`}
                    onClick={() => onTabChange(tab)}
                    className={`px-10 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === tab
                        ? 'bg-white text-primary shadow-lg shadow-slate-200/50 ring-1 ring-slate-100'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                    }`}
                >
                    {tab}
                    {tab === 'leads' && (
                        <span className={`ml-3 px-2 py-0.5 rounded-lg font-black ${activeTab === 'leads' ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'}`}>
                            {leadsCount}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
};

export default ProjectNavigation;
