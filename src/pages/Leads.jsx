import { useState, useMemo } from 'react'
import DataTable from 'react-data-table-component'
import TitleComponent from '../components/titleComponent/titleComponent'
import Badge from '../components/ui/Badge'

const Leads = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [projectFilter, setProjectFilter] = useState('all')
    const [selectedLeads, setSelectedLeads] = useState([])

    /**
     * Product Rule: 
     * Leads are always associated with a project to ensure relevance.
     */
    const leads = [
        {
            id: 1,
            name: 'John Smith',
            email: 'john.smith@techcorp.com',
            company: 'TechCorp Inc.',
            project: 'SaaS Platform Outreach',
            firstEmailSent: '2026-01-20',
            lastActivity: '2026-01-21',
            status: 'Opened',
            isEligible: true,
            avatarGradient: 'from-blue-500 to-indigo-600'
        },
        {
            id: 2,
            name: 'Sarah Johnson',
            email: 'sarah.j@innovate.io',
            company: 'Innovate.io',
            project: 'Cloud Consulting Service',
            firstEmailSent: '2026-01-19',
            lastActivity: '2026-01-19',
            status: 'Not Opened',
            isEligible: false,
            avatarGradient: 'from-emerald-500 to-teal-500'
        },
        {
            id: 3,
            name: 'Michael Chen',
            email: 'mchen@growth.com',
            company: 'Growth Co.',
            project: 'SaaS Platform Outreach',
            firstEmailSent: '2026-01-18',
            lastActivity: '2026-01-18',
            status: 'Opened',
            isEligible: true,
            avatarGradient: 'from-orange-500 to-amber-500'
        },
        {
            id: 4,
            name: 'Emma Williams',
            email: 'emma.w@startup.tech',
            company: 'Startup Tech',
            project: 'Internal Talent Acquisition',
            firstEmailSent: '2026-01-17',
            lastActivity: '2026-01-17',
            status: 'Not Opened',
            isEligible: false,
            avatarGradient: 'from-purple-500 to-pink-500'
        },
        {
            id: 5,
            name: 'David Brown',
            email: 'dbrown@enterprise.com',
            company: 'Enterprise Solutions',
            project: 'SaaS Platform Outreach',
            firstEmailSent: 'Pending',
            lastActivity: '-',
            status: 'Pending',
            isEligible: false,
            avatarGradient: 'from-cyan-500 to-blue-500'
        }
    ]

    const leadStats = [
        { label: 'Eligible for Follow-up', value: '456', icon: 'fa-user-check', color: 'from-indigo-600 to-blue-500' },
        { label: 'Outreach Stopped', value: '1,889', icon: 'fa-hand-paper', color: 'from-orange-500 to-red-500' },
        { label: 'Engagement Rate', value: '19.4%', icon: 'fa-chart-pie', color: 'from-emerald-500 to-teal-500' },
    ]

    const columns = useMemo(() => [
        {
            name: 'Contact Details',
            selector: row => row.name,
            sortable: true,
            cell: row => (
                <div className="flex items-center space-x-3 py-2">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${row.avatarGradient} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                        {row.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900">{row.name}</h4>
                        <p className="text-xs text-slate-500">{row.email}</p>
                    </div>
                </div>
            ),
            grow: 2,
        },
        {
            name: 'Project',
            selector: row => row.project,
            sortable: true,
            cell: row => (
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                    {row.project}
                </span>
            )
        },
        {
            name: 'Engagement',
            selector: row => row.status,
            sortable: true,
            center: true,
            cell: row => (
                <Badge variant={row.status === 'Opened' ? 'success' : row.status === 'Not Opened' ? 'danger' : 'default'}>
                    {row.status === 'Opened' ? <i className="fas fa-eye mr-1"></i> :
                        row.status === 'Not Opened' ? <i className="fas fa-eye-slash mr-1"></i> : null}
                    {row.status}
                </Badge>
            )
        },
        {
            name: 'Eligibility',
            selector: row => row.isEligible,
            sortable: true,
            center: true,
            cell: row => row.isEligible ? (
                <Badge variant="primary" className="bg-indigo-100 text-indigo-700 border-indigo-200">
                    <i className="fas fa-check-circle mr-1"></i> Follow-up
                </Badge>
            ) : (
                <span className="text-xs text-slate-400 italic">Stopped</span>
            )
        },
        {
            name: 'Sent / Active',
            selector: row => row.firstEmailSent,
            sortable: true,
            cell: row => (
                <div className="text-xs py-2">
                    <p className="text-slate-600 font-bold">Sent: {row.firstEmailSent}</p>
                    <p className="text-slate-400">Last: {row.lastActivity}</p>
                </div>
            )
        },
        {
            name: 'Action',
            cell: row => (
                <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                    <i className="fas fa-chevron-right"></i>
                </button>
            ),
            button: true,
            right: true,
        }
    ], [])

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.company.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesProject = projectFilter === 'all' || lead.project === projectFilter

            return matchesSearch && matchesProject
        })
    }, [searchTerm, projectFilter])

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
                        <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5">
                            Import New Prospects
                        </button>
                    </div>
                </div>
            </div>

            {/* Signal Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {leadStats.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex items-center space-x-5">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg shadow-indigo-100`}>
                            <i className={`fas ${stat.icon} text-white text-2xl`}></i>
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
                        <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
                        <input
                            type="text"
                            placeholder="Filter by lead name, email or company..."
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative min-w-[240px]">
                        <i className="fas fa-filter absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <select
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm text-slate-600 appearance-none"
                            value={projectFilter}
                            onChange={(e) => setProjectFilter(e.target.value)}
                        >
                            <option value="all">All Projects</option>
                            <option value="SaaS Platform Outreach">SaaS Platform Outreach</option>
                            <option value="Cloud Consulting Service">Cloud Consulting Service</option>
                            <option value="Internal Talent Acquisition">Internal Talent Acquisition</option>
                        </select>
                    </div>

                    {selectedLeads.length > 0 && (
                        <div className="flex items-center gap-6 bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 animate-in fade-in slide-in-from-top-4">
                            <span className="text-sm font-black text-indigo-700 uppercase tracking-wider">{selectedLeads.length} Selected</span>
                            <div className="h-6 w-px bg-indigo-100"></div>
                            <div className="flex gap-4">
                                <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-2 transition-colors">
                                    <i className="fas fa-plus-circle"></i> Add to Campaign
                                </button>
                                <button className="text-sm font-bold text-slate-500 hover:text-red-600 flex items-center gap-2 transition-colors">
                                    <i className="fas fa-trash-alt"></i> Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden px-2">
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
                />
            </div>
        </div>
    )
}

export default Leads

