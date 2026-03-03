import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import DataTable from 'react-data-table-component'
import TitleComponent from '../components/titleComponent/titleComponent'
import Badge from '../components/ui/Badge'
import { useAuth } from '../context/AuthContext'
import { getUserLeads, getUserProjects } from '../services/db'

const Leads = () => {
    const { currentUser } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [projectFilter, setProjectFilter] = useState('all')
    const [selectedLeads, setSelectedLeads] = useState([])
    const [projects, setProjects] = useState([])

    // ── DB state 
    const [leads, setLeads] = useState([])
    const [dbLoading, setDbLoading] = useState(true)
    const [dbError, setDbError] = useState('')

    const loadData = useCallback(async () => {
        if (!currentUser) return
        try {
            setDbLoading(true)
            setDbError('')
            const [leadsData, projectsData] = await Promise.all([
                getUserLeads(currentUser.uid),
                getUserProjects(currentUser.uid)
            ])
            setLeads(leadsData.sort((a, b) => b.createdAt - a.createdAt))
            setProjects(projectsData)
        } catch (err) {
            console.error('[Leads] load error:', err)
            setDbError('Failed to load data.')
        } finally {
            setDbLoading(false)
        }
    }, [currentUser])

    useEffect(() => { loadData() }, [loadData])

    const selectedProject = useMemo(() =>
        projects.find(p => p.id === projectFilter),
        [projects, projectFilter]
    )

    // Dynamically computed stats for the specific project or all
    const filteredByProject = useMemo(() =>
        projectFilter === 'all' ? leads : leads.filter(l => l.projectId === projectFilter),
        [leads, projectFilter]
    )

    const leadStats = [
        { label: 'Project Leads', value: filteredByProject.length, icon: 'fa-users', color: 'from-purple-500 to-pink-500' },
        { label: 'Follow-ups', value: filteredByProject.filter(l => l.status === 'opened').length, icon: 'fa-user-check', color: 'from-indigo-600 to-blue-500' },
        { label: 'CSV/XLSX Imports', value: filteredByProject.filter(l => l.source === 'csv_import').length, icon: 'fa-file-import', color: 'from-emerald-500 to-teal-500' },
    ]

    const columns = useMemo(() => [
        // ... (columns logic remains same)
        {
            name: 'Contact Details',
            selector: row => row.name,
            sortable: true,
            cell: row => {
                const initials = row.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                const gradients = ['from-blue-500 to-indigo-600', 'from-emerald-500 to-teal-500', 'from-orange-500 to-amber-500', 'from-purple-500 to-pink-500', 'from-cyan-500 to-blue-500']
                const grad = gradients[row.name.charCodeAt(0) % gradients.length]
                return (
                    <div className="flex items-center space-x-3 py-2">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                            {initials}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">{row.name}</h4>
                            <p className="text-xs text-slate-500">{row.email}</p>
                        </div>
                    </div>
                )
            },
            grow: 2,
        },
        {
            name: 'Source',
            selector: row => row.source,
            sortable: true,
            cell: row => row.source === 'csv_import'
                ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-[11px] font-black border border-emerald-100"><i className="fas fa-file-csv text-[9px]" />CSV</span>
                : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-500 text-[11px] font-black"><i className="fas fa-user text-[9px]" /></span>
        },
        {
            name: 'Engagement',
            selector: row => row.status,
            sortable: true,
            center: true,
            cell: row => {
                const map = { opened: ['success', 'fa-eye', 'Opened'], email_sent: ['primary', 'fa-paper-plane', 'Sent'], new: ['default', 'fa-clock', 'New'], replied: ['success', 'fa-reply', 'Replied'] }
                const [variant, icon, label] = map[row.status] || ['default', 'fa-circle', row.status]
                return (
                    <Badge variant={variant}>
                        <i className={`fas ${icon} mr-1`} />{label}
                    </Badge>
                )
            }
        },
        {
            name: 'Last Email',
            selector: row => row.lastEmailSentAt,
            sortable: true,
            cell: row => (
                <div className="text-xs py-2">
                    {row.lastEmailSentAt
                        ? <p className="text-slate-600 font-bold">{new Date(row.lastEmailSentAt).toLocaleDateString()}</p>
                        : <p className="text-slate-400 italic">Not sent</p>
                    }
                </div>
            )
        }
    ], [])

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
        table: {
            style: {
                backgroundColor: 'transparent',
            },
        },
        header: {
            style: {
                display: 'none',
            },
        },
        headRow: {
            style: {
                backgroundColor: '#f8fafc',
                borderBottomWidth: '1px',
                borderBottomColor: '#f1f5f9',
                minHeight: '64px',
            },
        },
        headCells: {
            style: {
                color: '#64748b',
                fontSize: '0.75rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
            },
        },
        rows: {
            style: {
                minHeight: '80px',
                '&:not(:last-child)': {
                    borderBottomWidth: '1px',
                    borderBottomColor: '#f8fafc',
                },
                '&:hover': {
                    backgroundColor: '#f8fafc',
                    transitionDuration: '0.15s',
                    transitionProperty: 'background-color',
                },
            },
        },
        pagination: {
            style: {
                borderTop: '1px solid #f1f5f9',
                marginTop: '1rem',
                borderRadius: '0 0 1rem 1rem',
            },
        },
        cells: {
            style: {
                paddingLeft: '1rem',
                paddingRight: '1rem',
            },
        },
    }

    const handleSelectedRowsChange = ({ selectedRows }) => {
        setSelectedLeads(selectedRows.map(row => row.id))
    }

    return (
        <div className="min-h-screen space-y-8 pb-12">
            {/* Page Header */}
            <div className="relative overflow-hidden rounded-[40px] bg-slate-900 p-12 shadow-2xl border border-slate-800">
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] -mr-48 -mt-48" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] -ml-48 -mb-48" />
                </div>

                <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-10">
                    <div className="max-w-2xl">
                        <Badge variant="primary" className="mb-4 bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                            LEAD INTELLIGENCE中心
                        </Badge>
                        <TitleComponent type="h1" className="text-white text-5xl font-black mb-4 font-idGrotesk tracking-tight">
                            Lead Decisions
                        </TitleComponent>
                        <TitleComponent type="p" size="lg" className="text-slate-400 leading-relaxed font-medium">
                            Generate and manage high-intent leads specifically tailored to your projects.
                            Select a project to see its target audience and start scouting.
                        </TitleComponent>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            to={projectFilter !== 'all' ? `/dashboard/leads/search?projectId=${projectFilter}` : '/dashboard/leads/search'}
                            className={`inline-flex items-center justify-center gap-3 px-10 py-5 rounded-[22px] font-black text-sm transition-all transform hover:-translate-y-1 shadow-2xl ${projectFilter === 'all'
                                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                                : 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600'
                                }`}
                        >
                            <i className="fas fa-file-import text-lg" />
                            {projectFilter === 'all' ? 'Select Project to Import' : `Import for ${selectedProject?.name}`}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Project Selection Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className={`p-8 rounded-[32px] border-2 transition-all cursor-pointer flex flex-col justify-between ${projectFilter === 'all'
                    ? 'bg-slate-900 border-slate-900 shadow-xl text-white'
                    : 'bg-white border-slate-100 text-slate-900 hover:border-indigo-200'
                    }`}
                    onClick={() => setProjectFilter('all')}>
                    <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${projectFilter === 'all' ? 'text-indigo-400' : 'text-slate-400'}`}>Intelligence View</p>
                        <h3 className="text-xl font-bold">All Intelligence</h3>
                    </div>
                    <p className={`text-sm mt-4 font-medium ${projectFilter === 'all' ? 'text-slate-400' : 'text-slate-500'}`}>
                        {leads.length} total leads collected
                    </p>
                </div>

                {projects.map(proj => (
                    <div key={proj.id} className={`p-8 rounded-[32px] border-2 transition-all cursor-pointer flex flex-col justify-between ${projectFilter === proj.id
                        ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-100 text-white'
                        : 'bg-white border-slate-100 text-slate-900 hover:border-indigo-200'
                        }`}
                        onClick={() => setProjectFilter(proj.id)}>
                        <div className="truncate">
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${projectFilter === proj.id ? 'text-indigo-200' : 'text-slate-400'}`}>{proj.type}</p>
                            <h3 className="text-xl font-bold truncate">{proj.name}</h3>
                        </div>
                        <p className={`text-sm mt-4 font-medium ${projectFilter === proj.id ? 'text-indigo-100' : 'text-slate-500'}`}>
                            {leads.filter(l => l.projectId === proj.id).length} project leads
                        </p>
                    </div>
                ))}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {leadStats.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex items-center space-x-6">
                        <div className={`w-16 h-16 rounded-[20px] bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                            <i className={`fas ${stat.icon} text-white text-2xl`} />
                        </div>
                        <div>
                            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-4xl font-idGrotesk font-black text-slate-900">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls & Bulk Actions */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <div className="flex flex-col xl:flex-row gap-8 items-center">
                    <div className="flex-1 w-full relative group">
                        <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter by lead name, email or company..."
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative min-w-[280px]">
                        <i className="fas fa-filter absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm text-slate-600 appearance-none cursor-pointer"
                            value={projectFilter}
                            onChange={(e) => setProjectFilter(e.target.value)}
                        >
                            <option value="all">Compare All Projects</option>
                            {projects.map(proj => (
                                <option key={proj.id} value={proj.id}>{proj.name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedLeads.length > 0 && (
                        <div className="flex items-center gap-6 bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 animate-in fade-in slide-in-from-top-4">
                            <span className="text-sm font-black text-indigo-700 uppercase tracking-wider">{selectedLeads.length} Selected</span>
                            <div className="h-6 w-px bg-indigo-100" />
                            <div className="flex gap-4">
                                <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-2 transition-colors">
                                    <i className="fas fa-plus-circle" /> Add to Campaign
                                </button>
                                <button className="text-sm font-bold text-slate-500 hover:text-red-600 flex items-center gap-2 transition-colors">
                                    <i className="fas fa-trash-alt" /> Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Data Table */}
            {dbError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium flex items-center gap-3">
                    <i className="fas fa-exclamation-circle" />{dbError}
                    <button onClick={loadData} className="ml-auto text-xs font-bold underline">Retry</button>
                </div>
            )}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden px-2">
                {dbLoading ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                        <p className="text-slate-400 text-sm font-medium">Loading leads from database...</p>
                    </div>
                ) : projectFilter === 'all' && leads.length > 0 ? (
                    <div className="py-24 text-center bg-slate-50/50">
                        <div className="w-24 h-24 bg-white rounded-[32px] shadow-sm flex items-center justify-center mx-auto mb-8 text-indigo-600 border border-slate-100">
                            <i className="fas fa-project-diagram text-4xl" />
                        </div>
                        <p className="text-2xl font-black text-slate-900 mb-3 font-idGrotesk">Lead Generation is Project-Specific</p>
                        <p className="text-slate-500 max-w-md mx-auto mb-10 leading-relaxed font-medium">
                            To import new leads from CSV or XLSX files, please select one of your projects above.
                            This allows us to associate data with your specific initiatives.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            {projects.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setProjectFilter(p.id)}
                                    className="px-8 py-4 bg-white border-2 border-slate-100 rounded-[22px] text-sm font-black text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm hover:shadow-xl hover:shadow-indigo-50 transform hover:-translate-y-1"
                                >
                                    <i className="fas fa-folder-open mr-2 opacity-50" />
                                    {p.name}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={filteredLeads}
                        pagination
                        selectableRows
                        onSelectedRowsChange={handleSelectedRowsChange}
                        customStyles={customStyles}
                        highlightOnHover
                        pointerOnHover
                        responsive
                        noDataComponent={
                            <div className="py-24 text-center">
                                <i className="fas fa-search-dollar text-indigo-100 text-7xl mb-8 block" />
                                <p className="text-slate-900 font-black text-xl mb-2 font-idGrotesk tracking-tight">Ready to Scout?</p>
                                <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8 font-medium">
                                    No leads generated for <span className="text-indigo-600 font-bold">"{selectedProject?.name}"</span> yet.
                                </p>
                                <Link
                                    to={`/dashboard/leads/search?projectId=${projectFilter}`}
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all transform hover:-translate-y-1"
                                >
                                    <i className="fas fa-file-import" />
                                    Import CSV/XLSX File
                                </Link>
                            </div>
                        }
                    />
                )}
            </div>
        </div>
    )
}

export default Leads

