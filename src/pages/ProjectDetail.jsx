import { useReducer, useMemo, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import LeadSourcingModal from '../components/ui/LeadSourcingModal';
import ImportSuccessToast from '../components/ui/ImportSuccessToast';
import { useAuth } from '../context/AuthContext';

import OverviewTab from '../components/projects/detail/OverviewTab';
import LeadsTab from '../components/projects/detail/LeadsTab';
import CampaignsTab from '../components/projects/detail/CampaignsTab';
import ProjectHeader from '../components/projects/detail/ProjectHeader';
import ProjectNavigation from '../components/projects/detail/ProjectNavigation';
import SourceBadge from '../components/projects/detail/SourceBadge';

import { ACTIONS, INITIAL_STATE, projectReducer, MOCK_GENERATED_LEADS } from '../components/projects/detail/state';
import { getProject, getProjectLeads, getProjectCampaigns } from '../services/db';

const ProjectDetail = () => {
    const { id } = useParams();
    const { currentUser } = useAuth();
    const [state, dispatch] = useReducer(projectReducer, INITIAL_STATE);

    const { 
        project, projectLeads, projectCampaigns, dbLoading, dbError, 
        activeTab, isSourcingModalOpen, importToast, aiLeads, 
        relevanceFilter, personaFilter 
    } = state;

    const loadAll = useCallback(async () => {
        if (!currentUser) return;
        try {
            dispatch({ type: ACTIONS.SET_LOADING, payload: true });
            const [proj, leads, campaigns] = await Promise.all([
                getProject(id), getProjectLeads(id), getProjectCampaigns(id)
            ]);
            dispatch({ 
                type: ACTIONS.SET_PROJECT_DATA, 
                payload: {
                    project: proj,
                    leads: leads.sort((a, b) => b.createdAt - a.createdAt),
                    campaigns: campaigns.sort((a, b) => b.createdAt - a.createdAt)
                } 
            });
        } catch (err) {
            console.error('[ProjectDetail] load error:', err);
            dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to load project data.' });
        }
    }, [id, currentUser]);

    useEffect(() => { loadAll(); }, [loadAll]);

    useEffect(() => {
        if (!importToast) return;
        const t = setTimeout(() => dispatch({ type: ACTIONS.SET_IMPORT_TOAST, payload: null }), 4000);
        return () => clearTimeout(t);
    }, [importToast]);

    const handleGenerateLeads = (config) => {
        const filtered = MOCK_GENERATED_LEADS.filter(l => l.persona === config.persona);
        dispatch({ type: ACTIONS.SET_AI_LEADS, payload: filtered.length > 0 ? filtered : MOCK_GENERATED_LEADS });
    };

    const leadColumns = useMemo(() => [
        {
            name: 'Lead Name', selector: row => row.name, sortable: true, minWidth: '160px',
            cell: row => (
                <div className="py-3">
                    <div className="font-bold text-slate-900 text-sm">{row.name}</div>
                    {row.phone && <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{row.phone}</div>}
                </div>
            )
        },
        {
            name: 'Email', selector: row => row.email, sortable: true, minWidth: '180px',
            cell: row => row.email ? <span className="text-slate-500 text-xs font-medium">{row.email}</span> : <span className="text-slate-300 italic text-xs">—</span>
        },
        {
            name: 'Source', selector: row => row.source, sortable: true, minWidth: '130px',
            cell: row => <SourceBadge source={row.source} />
        },
        {
            name: 'Website', selector: row => row.website, minWidth: '160px',
            cell: row => row.website ? (
                <a href={row.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 text-[11px] font-black hover:underline uppercase tracking-tighter" onClick={e => e.stopPropagation()}>
                    <i className="fas fa-external-link-alt text-[9px]" />
                    {row.website.replace(/^https?:\/\//, '').replace(/\/$/, '').slice(0, 22)}
                </a>
            ) : <span className="text-slate-300 italic text-xs">—</span>
        },
        {
            name: 'Status', selector: row => row.status, sortable: true,
            cell: row => {
                const map = { opened: 'success', email_sent: 'primary', new: 'info', replied: 'success' };
                const label = { opened: 'Opened', email_sent: 'Sent', new: 'New', replied: 'Replied' };
                return <Badge variant={map[row.status] || 'default'}>{label[row.status] || row.status}</Badge>;
            }
        }
    ], []);

    const campaignColumns = useMemo(() => [
        { name: 'Campaign Name', selector: row => row.name, sortable: true, cell: row => <span className="font-bold text-slate-900">{row.name}</span> },
        { name: 'Type', selector: row => row.type, cell: row => <Badge variant={row.type === 'initial' ? 'primary' : 'info'}>{row.type}</Badge> },
        { name: 'Status', selector: row => row.status, sortable: true, cell: row => <Badge variant={row.status === 'active' ? 'success' : 'default'}>{row.status}</Badge> },
        { name: 'Created', selector: row => row.createdAt, sortable: true, cell: row => <span className="text-slate-500 text-sm font-medium">{new Date(row.createdAt).toLocaleDateString()}</span> }
    ], []);

    const aiColumns = useMemo(() => [
        { name: 'Lead Name', selector: row => row.name, sortable: true, cell: row => <span className="font-bold text-slate-900">{row.name}</span> },
        { name: 'Company', selector: row => row.company, sortable: true, cell: row => <span className="text-slate-600 font-medium">{row.company}</span> },
        { name: 'Relevance', selector: row => row.relevance, sortable: true, cell: row => (
            <div className="w-full max-w-[100px] py-2">
                <div className="flex justify-between items-center mb-1.5 px-0.5">
                    <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{row.relevance}% Match</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500" style={{ width: `${row.relevance}%` }} />
                </div>
            </div>
        )},
        { name: 'Status', selector: row => row.status, cell: row => <Badge variant="info">{row.status}</Badge> }
    ], []);

    const tableStyles = {
        table: { style: { backgroundColor: 'transparent' } },
        headRow: { style: { backgroundColor: '#fcfdfe', borderBottomWidth: '1px', borderBottomColor: '#f1f5f9', minHeight: '52px' } },
        headCells: { style: { color: '#64748b', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' } },
        rows: { style: { minHeight: '64px', '&:not(:last-child)': { borderBottomWidth: '1px', borderBottomColor: '#f8fafc' } } },
    };

    if (dbLoading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-xl animate-spin" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing workspace...</p>
        </div>
    );

    if (dbError) return (
        <div className="py-20 text-center space-y-6">
            <div className="w-20 h-20 bg-red-50 rounded-[32px] flex items-center justify-center mx-auto text-red-500 shadow-xl shadow-red-100/50">
                <i className="fas fa-exclamation-triangle text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Connection Failed</h3>
            <p className="text-slate-500 mt-2 font-medium italic">{dbError}</p>
            <button onClick={loadAll} className="px-8 py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors">Retry Connection</button>
        </div>
    );

    if (!project) return (
        <div className="py-20 text-center space-y-6">
            <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto text-slate-200"><i className="fas fa-search text-3xl" /></div>
            <h3 className="text-xl font-bold text-slate-900">Project Not Found</h3>
            <p className="text-slate-500 mt-2">The workspace you are looking for does not exist or has been moved.</p>
        </div>
    );

    return (
        <div className="min-h-screen space-y-8 pb-12">
            <ProjectHeader project={project} id={id} />
            
            <ProjectNavigation 
                activeTab={activeTab} 
                onTabChange={(tab) => dispatch({ type: ACTIONS.SET_ACTIVE_TAB, payload: tab })} 
                leadsCount={projectLeads.length} 
            />

            <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-12 min-h-[500px]">
                {activeTab === 'overview' && <OverviewTab project={project} leadsCount={projectLeads.length} campaignsCount={projectCampaigns.length} />}
                {activeTab === 'leads' && (
                    <LeadsTab 
                        leads={projectLeads} id={id} onOpenSourcing={() => dispatch({ type: ACTIONS.SET_SOURCING_MODAL, payload: true })}
                        projectStats={project.stats} leadColumns={leadColumns} aiLeads={aiLeads} aiColumns={aiColumns}
                        relevanceFilter={relevanceFilter} personaFilter={personaFilter} tableStyles={tableStyles}
                        onFilterChange={(filters) => dispatch({ type: ACTIONS.SET_FILTERS, payload: filters })}
                    />
                )}
                {activeTab === 'campaigns' && <CampaignsTab campaigns={projectCampaigns} columns={campaignColumns} tableStyles={tableStyles} />}
            </div>

            <LeadSourcingModal isOpen={isSourcingModalOpen} onClose={() => dispatch({ type: ACTIONS.SET_SOURCING_MODAL, payload: false })} onGenerate={handleGenerateLeads} />

            {importToast && (
                <ImportSuccessToast count={importToast.count} onClose={() => dispatch({ type: ACTIONS.SET_IMPORT_TOAST, payload: null })} />
            )}
        </div>
    );
};

export default ProjectDetail;
