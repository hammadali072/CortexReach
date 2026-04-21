import { useReducer, useMemo, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import DataTable from 'react-data-table-component'
import TitleComponent from '../components/titleComponent/titleComponent'
import Badge from '../components/ui/badge/badge'
import { useAuth } from '../context/AuthContext'
import { getUserLeads, getUserProjects, createLead, updateLead, deleteLead, bulkDeleteLeads } from '../services/db'
import toast from 'react-hot-toast'

const ACTIONS = {
    SET_DATA: 'SET_DATA',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_SEARCH: 'SET_SEARCH',
    SET_PROJECT_FILTER: 'SET_PROJECT_FILTER',
    SET_SELECTED_LEADS: 'SET_SELECTED_LEADS',
    SET_MODAL: 'SET_MODAL',
    SET_CURRENT_LEAD: 'SET_CURRENT_LEAD',
    SET_SAVING: 'SET_SAVING'
};

const leadsReducer = (state, action) => {
    switch (action.type) {
        case ACTIONS.SET_DATA:
            return { ...state, leads: action.payload.leads, projects: action.payload.projects, dbLoading: false };
        case ACTIONS.SET_LOADING:
            return { ...state, dbLoading: action.payload };
        case ACTIONS.SET_ERROR:
            return { ...state, dbError: action.payload, dbLoading: false };
        case ACTIONS.SET_SEARCH:
            return { ...state, searchTerm: action.payload };
        case ACTIONS.SET_PROJECT_FILTER:
            return { ...state, projectFilter: action.payload };
        case ACTIONS.SET_SELECTED_LEADS:
            return { ...state, selectedLeads: action.payload };
        case ACTIONS.SET_MODAL:
            return { ...state, isModalOpen: action.payload };
        case ACTIONS.SET_CURRENT_LEAD:
            return { ...state, currentLead: action.payload };
        case ACTIONS.SET_SAVING:
            return { ...state, isSaving: action.payload };
        default:
            return state;
    }
};

const LeadsPage = () => {
    const { currentUser } = useAuth();
    
    const [state, dispatch] = useReducer(leadsReducer, {
        searchTerm: '',
        projectFilter: 'all',
        selectedLeads: [],
        projects: [],
        leads: [],
        dbLoading: true,
        dbError: '',
        isModalOpen: false,
        currentLead: null,
        isSaving: false
    });

    const {
        searchTerm, projectFilter, selectedLeads, projects, leads,
        dbLoading, dbError, isModalOpen, currentLead, isSaving
    } = state;

    const loadData = useCallback(async () => {
        if (!currentUser) return;
        try {
            dispatch({ type: ACTIONS.SET_LOADING, payload: true });
            const [leadsData, projectsData] = await Promise.all([
                getUserLeads(currentUser.uid),
                getUserProjects(currentUser.uid)
            ]);
            dispatch({
                type: ACTIONS.SET_DATA,
                payload: {
                    leads: leadsData.sort((a, b) => b.createdAt - a.createdAt),
                    projects: projectsData
                }
            });
        } catch (err) {
            console.error('[Leads] load error:', err);
            dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to load data.' });
        }
    }, [currentUser]);

    useEffect(() => { loadData() }, [loadData]);

    const selectedProject = useMemo(() =>
        projects.find(p => p.id === projectFilter),
        [projects, projectFilter]
    );

    const filteredByProject = useMemo(() =>
        projectFilter === 'all' ? leads : leads.filter(l => l.projectId === projectFilter),
        [leads, projectFilter]
    );

    const leadStats = [
        { label: 'Project Leads', value: filteredByProject.length, icon: 'fa-users', color: 'from-purple-500 to-pink-500' },
        { label: 'Follow-ups', value: filteredByProject.filter(l => l.status === 'opened').length, icon: 'fa-user-check', color: 'from-indigo-600 to-blue-500' },
        { label: 'CSV/XLSX Imports', value: filteredByProject.filter(l => l.source === 'csv_import' || !l.source).length, icon: 'fa-file-import', color: 'from-emerald-500 to-teal-500' },
    ];

    const findField = (row, options) => {
        if (!row) return null;
        const lowerOptions = options.map(o => o.toLowerCase());
        const keys = Object.keys(row);
        for (const opt of options) {
            if (row[opt] !== undefined && row[opt] !== null && row[opt] !== '') return row[opt];
        }
        const exactSlugKey = keys.find(k => lowerOptions.includes(k.toLowerCase().replace(/[\s_]/g, '')));
        if (exactSlugKey) return row[exactSlugKey];
        const isNameLookup = lowerOptions.some(o => o.includes('name') || o.includes('company') || o.includes('business') || o.includes('person'));
        if (isNameLookup) {
            const nameKey = keys.find(k => {
                const lk = k.toLowerCase();
                return lowerOptions.some(opt => lk.includes(opt)) && (lk.includes('name') || lk.includes('title'));
            });
            if (nameKey) return row[nameKey];
        }
        const foundKey = keys.find(k => {
            const lk = k.toLowerCase();
            if (isNameLookup) {
                const noise = ['city', 'state', 'address', 'zip', 'postal', 'street', 'lat', 'lng', 'location'];
                if (noise.some(n => lk.includes(n)) && !lowerOptions.some(o => lk === o)) return false;
            }
            return lowerOptions.some(opt => lk.includes(opt));
        });
        return foundKey ? row[foundKey] : null;
    };

    const getFullName = (row) => {
        const first = findField(row, ['first_name', 'firstName', 'fname']);
        const last = findField(row, ['last_name', 'lastName', 'lname']);
        if (first || last) return `${first || ''} ${last || ''}`.trim();
        return findField(row, ['name', 'full_name', 'contact_name', 'person', 'contact']);
    };

    const columns = useMemo(() => [
        {
            name: 'Full Name',
            selector: row => getFullName(row),
            sortable: true,
            cell: row => {
                const name = getFullName(row) || 'Unknown'
                const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2)
                const gradients = ['from-blue-500 to-indigo-600', 'from-emerald-500 to-teal-500', 'from-orange-500 to-amber-500', 'from-purple-500 to-pink-500', 'from-cyan-500 to-blue-500']
                const grad = gradients[name.charCodeAt(0) % gradients.length]
                return (
                    <div className="flex items-center space-x-3 py-2">
                        <div className={`size-8 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-[10px] shadow-sm flex-shrink-0`}>
                            {initials}
                        </div>
                        <span className="font-bold text-slate-900 truncate">{name}</span>
                    </div>
                )
            },
            grow: 1.5,
        },
        {
            name: 'Email Address',
            selector: row => findField(row, ['email', 'mail']),
            sortable: true,
            cell: row => <span className="text-slate-500 font-medium truncate">{findField(row, ['email', 'mail']) || '—'}</span>,
            grow: 1.5,
        },
        {
            name: 'Company Name',
            selector: row => findField(row, ['company', 'business', 'org', 'firm', 'organization']),
            sortable: true,
            cell: row => <span className="text-slate-700 font-bold truncate">{findField(row, ['company', 'business', 'org', 'firm', 'organization']) || '—'}</span>,
        },
        {
            name: 'Website',
            selector: row => findField(row, ['website', 'url', 'site']),
            sortable: true,
            cell: row => {
                const url = findField(row, ['website', 'url', 'site'])
                return url ? (
                    <a href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate text-xs">
                        {url.replace(/^https?:\/\//, '')}
                    </a>
                ) : <span className="text-slate-300">—</span>
            },
        },
        {
            name: 'Country',
            selector: row => findField(row, ['country', 'location', 'region']),
            sortable: true,
            cell: row => <span className="text-slate-500 font-medium">{findField(row, ['country', 'location', 'region']) || '—'}</span>,
        },
        {
            name: 'Project Name',
            selector: row => {
                const proj = projects.find(p => p.id === row.projectId)
                return proj?.name || 'Unknown'
            },
            sortable: true,
            cell: row => {
                const proj = projects.find(p => p.id === row.projectId)
                return (
                    <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 truncate max-w-[120px]">
                        {proj?.name || 'Unknown'}
                    </Badge>
                )
            },
        },
        {
            name: 'Actions',
            center: true,
            cell: row => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            dispatch({ type: ACTIONS.SET_CURRENT_LEAD, payload: row });
                            dispatch({ type: ACTIONS.SET_MODAL, payload: true });
                        }}
                        className="size-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center justify-center border border-slate-100"
                        title="Edit Lead"
                    >
                        <i className="fas fa-edit text-xs" />
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row)}
                        className="size-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center border border-slate-100"
                        title="Delete Lead"
                    >
                        <i className="fas fa-trash-alt text-xs" />
                    </button>
                </div>
            ),
            width: '100px'
        }
    ], [projects]);

    const filteredLeads = useMemo(() => {
        return filteredByProject.filter(lead => {
            const name = lead.name || ''
            const email = lead.email || ''
            const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                email.toLowerCase().includes(searchTerm.toLowerCase())
            return matchesSearch
        })
    }, [searchTerm, filteredByProject])

    const customStyles = {
        table: { style: { backgroundColor: 'transparent' } },
        header: { style: { display: 'none' } },
        headRow: { style: { backgroundColor: '#f8fafc', borderBottomWidth: '1px', borderBottomColor: '#f1f5f9', minHeight: '56px', borderRadius: '6px 6px 0 0' } },
        headCells: { style: { color: '#64748b', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' } },
        rows: {
            style: {
                minHeight: '72px', fontSize: '14px', fontWeight: '500', color: '#334155',
                '&:not(:last-child)': { borderBottomWidth: '1px', borderBottomColor: '#f1f5f9' },
                '&:hover': { backgroundColor: '#f8fafc', transitionDuration: '0.15s', transitionProperty: 'background-color' }
            }
        },
        pagination: { style: { borderTop: '1px solid #f1f5f9', marginTop: '0.5rem', borderRadius: '0 0 6px 6px' } },
        cells: { style: { paddingLeft: '1rem', paddingRight: '1rem' } }
    };

    const handleDeleteClick = async (lead) => {
        if (!window.confirm(`Are you sure you want to delete ${lead.name}?`)) return
        try {
            await deleteLead(lead.projectId, lead.id)
            toast.success('Lead deleted')
            loadData()
        } catch (err) {
            console.error('Delete error:', err)
            toast.error('Failed to delete lead')
        }
    }

    const handleBulkDelete = async () => {
        if (!selectedLeads.length) return
        if (projectFilter === 'all') {
            toast.error('Please filter by project to bulk delete')
            return
        }
        if (!window.confirm(`Delete ${selectedLeads.length} leads?`)) return
        try {
            await bulkDeleteLeads(projectFilter, selectedLeads)
            toast.success('Leads deleted')
            dispatch({ type: ACTIONS.SET_SELECTED_LEADS, payload: [] });
            loadData()
        } catch (err) {
            console.error('Bulk delete error:', err)
            toast.error('Failed to delete leads')
        }
    }

    const handleSaveLead = async (e) => {
        e.preventDefault()
        dispatch({ type: ACTIONS.SET_SAVING, payload: true });
        try {
            if (currentLead.id) {
                await updateLead(currentLead.id, currentLead)
                toast.success('Lead updated')
            } else {
                await createLead(currentUser.uid, projectFilter, currentLead)
                toast.success('Lead created')
            }
            dispatch({ type: ACTIONS.SET_MODAL, payload: false });
            loadData()
        } catch (err) {
            toast.error(err.message || 'Failed to save lead')
        } finally {
            dispatch({ type: ACTIONS.SET_SAVING, payload: false });
        }
    }

    return (
        <div className="min-h-screen space-y-8 pb-12">
            <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-8 lg:p-12 shadow-2xl border border-slate-800">
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-lg blur-[120px] -mr-48 -mt-48" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500 rounded-lg blur-[120px] -ml-48 -mb-48" />
                </div>
                <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-10">
                    <div>
                        <Badge variant="primary" className="mb-4 bg-indigo-500/20 text-indigo-300 border-indigo-500/30">LEAD INTELLIGENCE中心</Badge>
                        <TitleComponent type="h1" className="text-white text-4xl lg:text-5xl font-black mb-4 font-idGrotesk tracking-tight">
                            <span className="bg-gradient-brand bg-clip-text text-transparent">Lead Decisions</span>
                        </TitleComponent>
                        <div className="max-w-2xl">
                            <TitleComponent type="p" size="lg" className="text-slate-400 leading-relaxed font-medium">
                                Generate and manage high-intent leads specifically tailored to your projects.
                                Select a project to see its target audience and start scouting.
                            </TitleComponent>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            to={projectFilter !== 'all' ? `/dashboard/leads/import?projectId=${projectFilter}` : '/dashboard/leads/import'}
                            className={`inline-flex items-center justify-center gap-3 px-10 py-5 rounded-lg font-black text-sm transition-all transform hover:-translate-y-1 shadow-2xl ${projectFilter === 'all'
                                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                                : 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600'
                                }`}
                        >
                            <i className="fas fa-file-import text-lg" />
                            {projectFilter === 'all' ? 'Select Project to Import' : `Import CSV/XLSX`}
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div 
                    onClick={() => dispatch({ type: ACTIONS.SET_PROJECT_FILTER, payload: 'all' })}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && dispatch({ type: ACTIONS.SET_PROJECT_FILTER, payload: 'all' })}
                    role="button"
                    tabIndex={0}
                    className={`p-8 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${projectFilter === 'all' ? 'bg-slate-900 border-slate-900 shadow-xl text-white' : 'bg-white border-slate-100 text-slate-900 hover:border-indigo-200'}`}
                >
                    <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${projectFilter === 'all' ? 'text-indigo-400' : 'text-slate-400'}`}>Intelligence View</p>
                        <h3 className="text-xl font-bold">All Intelligence</h3>
                    </div>
                    <p className={`text-sm mt-4 font-medium ${projectFilter === 'all' ? 'text-slate-400' : 'text-slate-500'}`}>{leads.length} total leads</p>
                </div>
                {projects.map(proj => (
                    <div 
                        key={proj.id} 
                        onClick={() => dispatch({ type: ACTIONS.SET_PROJECT_FILTER, payload: proj.id })}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && dispatch({ type: ACTIONS.SET_PROJECT_FILTER, payload: proj.id })}
                        role="button"
                        tabIndex={0}
                        className={`p-8 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${projectFilter === proj.id ? 'bg-indigo-600 border-indigo-600 shadow-xl text-white' : 'bg-white border-slate-100 text-slate-900 hover:border-indigo-200'}`}
                    >
                        <div className="truncate">
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${projectFilter === proj.id ? 'text-indigo-200' : 'text-slate-400'}`}>{proj.type}</p>
                            <h3 className="text-xl font-bold truncate">{proj.name}</h3>
                        </div>
                        <p className={`text-sm mt-4 font-medium ${projectFilter === proj.id ? 'text-indigo-100' : 'text-slate-500'}`}>{leads.filter(l => l.projectId === proj.id).length} leads</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {leadStats.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-slate-100 flex items-center space-x-6">
                        <div className={`size-14 lg:size-16 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg transform scale-90 lg:scale-100`}>
                            <i className={`fas ${stat.icon} text-white text-2xl`} />
                        </div>
                        <div>
                            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-4xl font-idGrotesk font-black text-slate-900">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-6 lg:p-8">
                <div className="flex flex-col xl:flex-row gap-8 items-center">
                    <div className="flex-1 w-full relative group">
                        <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter by lead name, email or company..."
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-600"
                            value={searchTerm}
                            onChange={(e) => dispatch({ type: ACTIONS.SET_SEARCH, payload: e.target.value })}
                        />
                    </div>
                    <div className="relative min-w-[280px]">
                        <i className="fas fa-filter absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm text-slate-600 appearance-none cursor-pointer"
                            value={projectFilter}
                            onChange={(e) => dispatch({ type: ACTIONS.SET_PROJECT_FILTER, payload: e.target.value })}
                        >
                            <option value="all">Compare All Projects</option>
                            {projects.map(proj => <option key={proj.id} value={proj.id}>{proj.name}</option>)}
                        </select>
                    </div>
                    {selectedLeads.length > 0 && (
                        <div className="flex items-center gap-6 bg-indigo-50 px-6 py-3 rounded-lg border border-indigo-100 animate-in fade-in slide-in-from-top-4">
                            <span className="text-sm font-black text-indigo-700 uppercase tracking-wider">{selectedLeads.length} Selected</span>
                            <div className="h-6 w-px bg-indigo-100" />
                            <div className="flex gap-4">
                                <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-2 transition-colors"><i className="fas fa-plus-circle" /> Add to Campaign</button>
                                <button onClick={handleBulkDelete} className="text-sm font-bold text-slate-500 hover:text-red-600 flex items-center gap-2 transition-colors"><i className="fas fa-trash-alt" /> Delete</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {dbError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium flex items-center gap-3">
                    <i className="fas fa-exclamation-circle" />{dbError}
                    <button onClick={loadData} className="ml-auto text-xs font-bold underline">Retry</button>
                </div>
            )}
            <div className="bg-white rounded-2xl shadow-premium border border-slate-100 overflow-x-auto px-2">
                {dbLoading ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                        <div className="size-10 border-4 border-indigo-100 border-t-indigo-600 rounded-lg animate-spin" />
                        <p className="text-slate-400 text-sm font-medium">Loading leads...</p>
                    </div>
                ) : leads.length === 0 ? (
                    <div className="py-24 text-center">
                        <i className="fas fa-search-dollar text-indigo-100 text-7xl mb-8 block" />
                        <p className="text-slate-900 font-black text-xl mb-2 font-idGrotesk tracking-tight">Ready to Scout?</p>
                        <Link to={projectFilter !== 'all' ? `/dashboard/leads/import?projectId=${projectFilter}` : '/dashboard/leads/import'} className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-lg font-black text-sm shadow-xl hover:bg-emerald-600 transition-all transform hover:-translate-y-1"><i className="fas fa-file-import" /> Import CSV/XLSX</Link>
                    </div>
                ) : (
                    <DataTable
                        columns={columns} data={filteredLeads} pagination selectableRows
                        onSelectedRowsChange={({ selectedRows }) => dispatch({ type: ACTIONS.SET_SELECTED_LEADS, payload: selectedRows.map(r => r.id) })}
                        customStyles={customStyles} highlightOnHover pointerOnHover responsive
                    />
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                        onClick={() => dispatch({ type: ACTIONS.SET_MODAL, payload: false })}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && dispatch({ type: ACTIONS.SET_MODAL, payload: false })}
                        role="button" tabIndex={0} aria-label="Close modal"
                    />
                    <div className="relative bg-white w-full max-w-2xl rounded-lg shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div><h2 className="text-2xl font-black text-slate-900 font-idGrotesk">{currentLead?.id ? 'Edit Lead' : 'Create New Lead'}</h2></div>
                            <button onClick={() => dispatch({ type: ACTIONS.SET_MODAL, payload: false })} className="size-12 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-900 flex items-center justify-center shadow-sm"><i className="fas fa-times" /></button>
                        </div>
                        <form onSubmit={handleSaveLead} className="p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3"><label htmlFor="lead-name" className="text-[10px] font-black uppercase text-slate-400">Full Name</label><input id="lead-name" type="text" required value={currentLead?.name || ''} onChange={e => dispatch({ type: ACTIONS.SET_CURRENT_LEAD, payload: { ...currentLead, name: e.target.value } })} className="w-full px-6 py-4 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700" /></div>
                                <div className="space-y-3"><label htmlFor="lead-company" className="text-[10px] font-black uppercase text-slate-400">Company</label><input id="lead-company" type="text" value={currentLead?.company || ''} onChange={e => dispatch({ type: ACTIONS.SET_CURRENT_LEAD, payload: { ...currentLead, company: e.target.value } })} className="w-full px-6 py-4 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700" /></div>
                                <div className="space-y-3"><label htmlFor="lead-email" className="text-[10px] font-black uppercase text-slate-400">Email</label><input id="lead-email" type="email" required value={currentLead?.email || ''} onChange={e => dispatch({ type: ACTIONS.SET_CURRENT_LEAD, payload: { ...currentLead, email: e.target.value } })} className="w-full px-6 py-4 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700" /></div>
                            </div>
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={() => dispatch({ type: ACTIONS.SET_MODAL, payload: false })} className="px-10 py-4 border rounded-lg text-slate-500 font-black text-sm">Cancel</button>
                                <button type="submit" disabled={isSaving} className="px-12 py-4 bg-indigo-600 text-white rounded-lg font-black text-sm shadow-xl disabled:opacity-50">{isSaving ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-check-circle" />}{currentLead?.id ? 'Update Lead' : 'Create Lead'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LeadsPage
