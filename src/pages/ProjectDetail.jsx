import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import DataTable from 'react-data-table-component'
import TitleComponent from '../components/titleComponent/titleComponent'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'

const ProjectDetail = () => {
    const { id } = useParams()
    const [activeTab, setActiveTab] = useState('overview')

    // Mock project data
    const project = {
        id: id,
        name: 'SaaS Platform Outreach',
        type: 'Product',
        description: 'Accelerating digital transformation for enterprise clients with our core SaaS infrastructure.',
        industry: 'B2B Software',
        audience: 'CTOs / Product Managers',
        status: 'Active'
    }

    const projectLeads = [
        { id: 1, name: 'Alice Thompson', email: 'alice@enterprise.com', company: 'Enterprise Inc', relevance: 'High', status: 'Opened' },
        { id: 2, name: 'Bob Roberts', email: 'bob@techflow.io', company: 'TechFlow', relevance: 'Medium', status: 'Not Opened' },
        { id: 3, name: 'Charlie Dean', email: 'cdean@cloudify.net', company: 'Cloudify', relevance: 'High', status: 'Opened' }
    ]

    const projectCampaigns = [
        { id: 101, name: 'Q1 SaaS Expansion', status: 'Active', yield: '24.5%', sent: '2026-01-15' },
        { id: 102, name: 'CTO Direct Outreach', status: 'Completed', yield: '18.2%', sent: '2026-01-05' }
    ]

    const leadColumns = useMemo(() => [
        { name: 'Lead Name', selector: row => row.name, sortable: true, cell: row => <span className="font-bold text-slate-900">{row.name}</span> },
        { name: 'Email', selector: row => row.email, sortable: true, cell: row => <span className="text-slate-500">{row.email}</span> },
        { name: 'Company', selector: row => row.company, sortable: true, cell: row => <span className="text-slate-600 font-medium">{row.company}</span> },
        {
            name: 'Relevance Status',
            selector: row => row.relevance,
            sortable: true,
            cell: row => (
                <Badge variant={row.relevance === 'High' ? 'primary' : 'default'}>
                    {row.relevance}
                </Badge>
            )
        },
        {
            name: 'Engagement',
            selector: row => row.status,
            sortable: true,
            cell: row => (
                <Badge variant={row.status === 'Opened' ? 'success' : 'danger'}>
                    {row.status}
                </Badge>
            )
        }
    ], [])

    const campaignColumns = useMemo(() => [
        { name: 'Campaign Name', selector: row => row.name, sortable: true, cell: row => <span className="font-bold text-slate-900">{row.name}</span> },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            cell: row => <Badge variant={row.status === 'Active' ? 'primary' : 'success'}>{row.status}</Badge>
        },
        { name: 'Yield', selector: row => row.yield, sortable: true, cell: row => <span className="font-black text-slate-900 tracking-wider">{row.yield}</span> },
        { name: 'Sent Date', selector: row => row.sent, sortable: true, cell: row => <span className="text-slate-500">{row.sent}</span> }
    ], [])

    const customStyles = {
        table: { style: { backgroundColor: 'transparent' } },
        headRow: { style: { backgroundColor: '#f8fafc', borderBottomWidth: '1px', borderBottomColor: '#f1f5f9', minHeight: '52px' } },
        headCells: { style: { color: '#64748b', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' } },
        rows: { style: { minHeight: '64px', '&:not(:last-child)': { borderBottomWidth: '1px', borderBottomColor: '#f8fafc' } } },
    }

    return (
        <div className="min-h-screen space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="primary">PROJECT WORKSPACE</Badge>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">{project.type}</span>
                    </div>
                    <TitleComponent type="h1" className="text-slate-900 text-4xl font-black font-idGrotesk">
                        {project.name}
                    </TitleComponent>
                </div>
                <Link to="/campaigns/create">
                    <Button variant="primary" className="bg-indigo-600 shadow-xl shadow-indigo-100 h-auto py-4 px-8">
                        Launch Campaign for this Project
                    </Button>
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                {['overview', 'leads', 'campaigns'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-10">
                {activeTab === 'overview' && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Project Scope</h4>
                                    <p className="text-slate-700 leading-relaxed font-medium text-lg">
                                        {project.description}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-6 pt-4">
                                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Industry</h5>
                                        <p className="font-bold text-slate-900">{project.industry}</p>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Audience</h5>
                                        <p className="font-bold text-slate-900">{project.audience}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 bg-slate-900 text-white rounded-[32px] flex flex-col justify-between">
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-4">Strategic Enforcement</h4>
                                    <p className="text-slate-300 leading-relaxed font-medium">
                                        All outreach tied to this project is filtered to ensure deep relevance. Leads are generated specifically for the <span className="text-white underline decoration-indigo-500 decoration-2 underline-offset-4">{project.audience}</span> segment defined above.
                                    </p>
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <div className="flex-1">
                                        <p className="text-3xl font-black">{projectLeads.length}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Linked Leads</p>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-3xl font-black">{projectCampaigns.length}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Campaigns</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'leads' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Project-Specific Leads</h3>
                                <p className="text-sm text-slate-500 font-medium">Leads shown here are relevant to this project only.</p>
                            </div>
                            <Button variant="primary" className="bg-emerald-600 shadow-emerald-100">
                                <i className="fas fa-bolt mr-2" />
                                Generate Leads for this Project
                            </Button>
                        </div>
                        <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                            <DataTable
                                columns={leadColumns}
                                data={projectLeads}
                                customStyles={customStyles}
                                highlightOnHover
                                responsive
                                noHeader
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'campaigns' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Related Campaigns</h3>
                                <p className="text-sm text-slate-500 font-medium">Outreach sequences established for this project scope.</p>
                            </div>
                        </div>
                        <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                            <DataTable
                                columns={campaignColumns}
                                data={projectCampaigns}
                                customStyles={customStyles}
                                highlightOnHover
                                responsive
                                noHeader
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProjectDetail
