import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import DataTable from 'react-data-table-component'
import TitleComponent from '../components/titleComponent/titleComponent'
import Badge from '../components/ui/Badge'
import { useAuth } from '../context/AuthContext'
import { getUserLeads } from '../services/db'

const Leads = () => {
    const { currentUser } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [projectFilter, setProjectFilter] = useState('all')
    const [selectedLeads, setSelectedLeads] = useState([])

    // ── DB state 
    const [leads, setLeads] = useState([])
    const [dbLoading, setDbLoading] = useState(true)
    const [dbError, setDbError] = useState('')

    const load = useCallback(async () => {
        if (!currentUser) return
        try {
            setDbLoading(true)
            setDbError('')
            const data = await getUserLeads(currentUser.uid)
            setLeads(data.sort((a, b) => b.createdAt - a.createdAt))
        } catch (err) {
            console.error('[Leads] load error:', err)
            setDbError('Failed to load leads.')
        } finally {
            setDbLoading(false)
        }
    }, [currentUser])

    useEffect(() => { load() }, [load])

    // Dynamically computed stats from live DB leads
    const leadStats = [
        { label: 'Eligible for Follow-up', value: leads.filter(l => l.status === 'opened').length, icon: 'fa-user-check', color: 'from-indigo-600 to-blue-500' },
        { label: 'Google Maps Imports', value: leads.filter(l => l.source === 'google_maps').length, icon: 'fa-map-marker-alt', color: 'from-emerald-500 to-teal-500' },
        { label: 'Total Leads', value: leads.length, icon: 'fa-users', color: 'from-purple-500 to-pink-500' },
    ]

    const columns = useMemo(() => [
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
            name: 'Project ID',
            selector: row => row.projectId,
            sortable: true,
            cell: row => (
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                    {row.projectId?.slice(0, 8) ?? '—'}
                </span>
            )
        },
        {
            name: 'Source',
            selector: row => row.source,
            sortable: true,
            cell: row => row.source === 'google_maps'
                ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-[11px] font-black border border-emerald-100"><i className="fab fa-google text-[9px]" />Maps</span>
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
            name: 'Eligibility',
            selector: row => row.status,
            sortable: true,
            center: true,
            cell: row => row.status === 'opened' ? (
                <Badge variant="primary" className="bg-indigo-100 text-indigo-700 border-indigo-200">
                    <i className="fas fa-check-circle mr-1" /> Follow-up
                </Badge>
            ) : (
                <span className="text-xs text-slate-400 italic">Stopped</span>
            )
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
                    <p className="text-slate-400">{row.source}</p>
                </div>
            )
        },
        {
            name: 'Action',
            cell: () => (
                <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                    <i className="fas fa-chevron-right" />
                </button>
            ),
            button: true,
            right: true,
        }
    ], [])

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const name = lead.name || ''
            const email = lead.email || ''
            const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                email.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesProject = projectFilter === 'all' || lead.projectId === projectFilter
            return matchesSearch && matchesProject
        })
    }, [searchTerm, projectFilter, leads])

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
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-10 shadow-xl border border-slate-800">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <TitleComponent type="h1" className="text-white text-4xl font-bold mb-2">
                            Lead Decisions
                        </TitleComponent>
                        <TitleComponent type="p" size="lg" className="text-slate-400">
                            Monitor engagement signals and identify follow-up opportunities.
                        </TitleComponent>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            to="/dashboard/leads/search"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5"
                        >
                            <i className="fab fa-google" /> Import from Google Maps
                        </Link>
                    </div>
                </div>
            </div>

            {/* Signal Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {leadStats.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex items-center space-x-5">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg shadow-indigo-100`}>
                            <i className={`fas ${stat.icon} text-white text-2xl`} />
                        </div>
                        <div>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-idGrotesk font-black text-slate-900">{stat.value}</h3>
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

                    <div className="relative min-w-[240px]">
                        <i className="fas fa-filter absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm text-slate-600 appearance-none"
                            value={projectFilter}
                            onChange={(e) => setProjectFilter(e.target.value)}
                        >
                            <option value="all">All Projects</option>
                            {[...new Set(leads.map(l => l.projectId).filter(Boolean))].map(pid => (
                                <option key={pid} value={pid}>{pid.slice(0, 12)}...</option>
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
                    <button onClick={load} className="ml-auto text-xs font-bold underline">Retry</button>
                </div>
            )}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden px-2">
                {dbLoading ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                        <p className="text-slate-400 text-sm font-medium">Loading leads from database...</p>
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
                            <div className="py-16 text-center">
                                <i className="fas fa-user-slash text-slate-200 text-5xl mb-4 block" />
                                <p className="text-slate-400 font-medium">No leads found. Import leads via a project page.</p>
                            </div>
                        }
                    />
                )}
            </div>
        </div>
    )
}

export default Leads

