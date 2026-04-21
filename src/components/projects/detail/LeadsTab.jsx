import React from 'react';
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import Button from '../../ui/button/button';
import TitleComponent from '../../titleComponent/titleComponent';
import ProjectStats from './ProjectStats';
import Badge from '../../ui/badge/badge';

const LeadsTab = ({ 
    leads, 
    id, 
    onOpenSourcing, 
    projectStats,
    leadColumns,
    aiLeads,
    aiColumns,
    relevanceFilter,
    personaFilter,
    onFilterChange,
    tableStyles
}) => {
    const csvCount = leads.filter(l => l.source === 'csv_import').length;
    const filteredAiLeads = aiLeads.filter(lead =>
        lead.relevance >= relevanceFilter &&
        (personaFilter === '' || lead.persona === personaFilter)
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Project-Specific Leads</h3>
                    <p className="text-sm text-slate-500 font-medium">Leads stored in database relevant to this workspace.</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <Button onClick={onOpenSourcing} variant="primary">
                        <i className="fas fa-magic mr-2" /> Source Leads via AI
                    </Button>
                    <Link to={`/dashboard/leads/search?projectId=${id}`}>
                        <Button variant="success">
                            <i className="fas fa-file-import mr-2" />Import CSV/XLSX
                        </Button>
                    </Link>
                </div>
            </div>

            <ProjectStats 
                stats={{ ...projectStats, csvCount }} 
                leadsCount={leads.length} 
            />

            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <TitleComponent type="p" size="small" className="text-slate-400 font-black uppercase tracking-widest">
                        All Project Leads
                    </TitleComponent>
                    <span className="text-[11px] font-bold text-slate-400">{leads.length} total</span>
                </div>
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                    <DataTable
                        columns={leadColumns}
                        data={leads}
                        customStyles={tableStyles}
                        highlightOnHover
                        responsive
                        noHeader
                        pagination
                        paginationPerPage={10}
                        noDataComponent={
                            <div className="py-20 text-center">
                                <div className="size-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                                    <i className="fas fa-user-slash text-2xl" />
                                </div>
                                <p className="text-slate-400 font-bold text-sm uppercase tracking-wider">No leads added yet</p>
                                <p className="text-slate-300 text-xs mt-1 italic">Use the buttons above to populate your workspace.</p>
                            </div>
                        }
                    />
                </div>
            </div>

            {csvCount > 0 && (
                <div className="flex items-center gap-3 px-5 py-4 bg-emerald-50 border border-emerald-100 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="size-10 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-200">
                        <i className="fas fa-file-csv text-white text-sm" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-emerald-900">
                            {csvCount} lead{csvCount !== 1 ? 's' : ''} successfully synchronized
                        </p>
                        <p className="text-xs text-emerald-700 font-medium">Stored securely in Firebase with automatic deduplication control.</p>
                    </div>
                </div>
            )}

            {aiLeads.length > 0 && (
                <div className="pt-10 space-y-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-slate-100 pt-10 px-1">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 font-idGrotesk uppercase">AI Intelligence Sourcing</h3>
                            <p className="text-sm text-slate-500 font-medium italic mt-1">Qualified leads surfaced through cross-platform signal analysis.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="relevance-range" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Relevance {relevanceFilter}%+</label>
                                <input 
                                    id="relevance-range"
                                    type="range" 
                                    min="0" 
                                    max="90" 
                                    value={relevanceFilter}
                                    onChange={e => onFilterChange({ relevanceFilter: parseInt(e.target.value) })}
                                    className="w-40 accent-primary"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="persona-select" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Persona Filter</label>
                                <select 
                                    id="persona-select"
                                    value={personaFilter} 
                                    onChange={e => onFilterChange({ personaFilter: e.target.value })}
                                    className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                                >
                                    <option value="">All Personas</option>
                                    <option value="The Visionary CTO">The Visionary CTO</option>
                                    <option value="The Growth VP">The Growth VP</option>
                                    <option value="The Product Lead">The Product Lead</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="border border-indigo-100 rounded-2xl overflow-hidden shadow-premium bg-white">
                        <DataTable
                            columns={aiColumns}
                            data={filteredAiLeads}
                            customStyles={{ ...tableStyles, headRow: { style: { ...tableStyles.headRow.style, backgroundColor: '#f5f7ff' } } }}
                            highlightOnHover
                            responsive
                            noHeader
                            noDataComponent={
                                <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No leads match your active filters</div>
                            }
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadsTab;



