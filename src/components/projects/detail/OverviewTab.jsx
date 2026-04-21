import React from 'react';
import Badge from '../../ui/badge/badge';
import AIAnalysisCard from '../../ui/aIAnalysisCard/aIAnalysisCard';

const OverviewTab = ({ project, leadsCount, campaignsCount }) => {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Project Scope</h4>
                        <p className="text-slate-700 leading-relaxed font-medium text-lg px-1">
                            {project.description || 'No description provided.'}
                        </p>
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Project Features</h4>
                        <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap px-1">
                            {project.features || 'No features listed.'}
                        </p>
                    </div>
                    <div className="pt-4">
                        <div className="p-8 bg-slate-50 rounded-lg border border-slate-100 shadow-inner">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Targeted Audience Segments</h5>
                            <div className="flex flex-wrap gap-3">
                                {project.targetAudience ? project.targetAudience.split(', ').map((aud) => (
                                    <Badge key={`aud-badge-${aud}`} variant="outline" className="bg-white border-indigo-100 text-indigo-600 shadow-sm">
                                        <i className="fas fa-user-tag mr-2 text-[8px]" />
                                        {aud}
                                    </Badge>
                                )) : <span className="text-slate-400 font-medium italic">No specific audience segments defined.</span>}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-8 bg-slate-900 text-white rounded-[24px] flex flex-col justify-between shadow-2xl shadow-slate-200">
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-4">Strategic Enforcement</h4>
                        <p className="text-slate-300 leading-relaxed font-medium">
                            All outreach tied to this project is filtered to ensure deep relevance. Leads are generated specifically for the{' '}
                            <span className="text-white underline decoration-indigo-500 decoration-4 underline-offset-8">{project.targetAudience || 'defined'}</span> segment.
                        </p>
                    </div>
                    <div className="flex gap-4 mt-8 pt-8 border-t border-white/10">
                        <div className="flex-1">
                            <p className="text-3xl font-black">{project.stats?.totalLeads || leadsCount}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Linked Leads</p>
                        </div>
                        <div className="flex-1">
                            <p className="text-3xl font-black">{campaignsCount}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Campaigns</p>
                        </div>
                        <div className="flex-1">
                            <p className="text-3xl font-black">{project.stats?.totalSent || 0}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Emails Sent</p>
                        </div>
                    </div>
                </div>
            </div>
            <AIAnalysisCard />
        </div>
    );
};

export default OverviewTab;



