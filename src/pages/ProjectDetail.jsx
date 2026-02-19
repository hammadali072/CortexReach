import { useState, useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import DataTable from 'react-data-table-component'
import TitleComponent from '../components/titleComponent/titleComponent'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import AIAnalysisCard from '../components/ui/AIAnalysisCard'
import LeadSourcingModal from '../components/ui/LeadSourcingModal'
import GoogleMapsImportModal from '../components/ui/GoogleMapsImportModal'
import ImportSuccessToast from '../components/ui/ImportSuccessToast'

const ProjectDetail = () => {
    const { id } = useParams()
    const [activeTab, setActiveTab] = useState('overview')
    const [isSourcingModalOpen, setIsSourcingModalOpen] = useState(false);
    const [isGoogleMapsModalOpen, setIsGoogleMapsModalOpen] = useState(false);
    const [importToast, setImportToast] = useState(null); // null | { count: number }
    const [aiLeads, setAiLeads] = useState([]);
    const [relevanceFilter, setRelevanceFilter] = useState(0);
    const [personaFilter, setPersonaFilter] = useState('');

    const mockGeneratedLeads = [
        { id: 'ai-1', name: 'James Wilson', company: 'Nexus Systems', role: 'CTO', industry: 'Enterprise SaaS', relevance: 98, status: 'New', persona: 'The Visionary CTO' },
        { id: 'ai-2', name: 'Sarah Chen', company: 'Global Stream', role: 'VP Growth', industry: 'E-commerce', relevance: 92, status: 'New', persona: 'The Growth VP' },
        { id: 'ai-3', name: 'Marcus Thorne', company: 'Scale Logic', role: 'VP Engineering', industry: 'FinTech', relevance: 89, status: 'New', persona: 'The Visionary CTO' },
        { id: 'ai-4', name: 'Elena Rodriguez', company: 'Product Mint', role: 'Head of Product', industry: 'Product-Led Growth', relevance: 85, status: 'New', persona: 'The Product Lead' },
        { id: 'ai-5', name: 'David Kim', company: 'Innova Cloud', role: 'Chief Architect', industry: 'Enterprise SaaS', relevance: 82, status: 'New', persona: 'The Visionary CTO' },
        { id: 'ai-6', name: 'Sophie Laurent', company: 'Market Flow', role: 'Growth Lead', industry: 'FinTech', relevance: 78, status: 'New', persona: 'The Growth VP' },
    ];

    // Load project data from localStorage or fallback to mock
    const project = useMemo(() => {
        const saved = localStorage.getItem('cortex_projects')
        const projects = saved ? JSON.parse(saved) : []
        const found = projects.find(p => p.id.toString() === id.toString())

        return found || {
            id: id,
            name: 'SaaS Platform Outreach',
            type: 'Product',
            description: 'Accelerating digital transformation for enterprise clients with our core SaaS infrastructure.',
            industry: 'B2B Software',
            audience: 'CTOs / Product Managers',
            status: 'Active'
        }
    }, [id])

    const [projectLeads, setProjectLeads] = useState([
        { id: 1, name: 'Alice Thompson', email: 'alice@enterprise.com', company: 'Enterprise Inc', phone: null, website: null, source: 'Manual', relevance: 'High', status: 'Opened' },
        { id: 2, name: 'Bob Roberts', email: 'bob@techflow.io', company: 'TechFlow', phone: null, website: null, source: 'Manual', relevance: 'Medium', status: 'Not Opened' },
        { id: 3, name: 'Charlie Dean', email: 'cdean@cloudify.net', company: 'Cloudify', phone: null, website: null, source: 'Manual', relevance: 'High', status: 'Opened' }
    ])

    const projectCampaigns = [
        { id: 101, name: 'Q1 SaaS Expansion', status: 'Active', yield: '24.5%', sent: '2026-01-15' },
        { id: 102, name: 'CTO Direct Outreach', status: 'Completed', yield: '18.2%', sent: '2026-01-05' }
    ]

    const leadColumns = useMemo(() => [
        {
            name: 'Lead Name',
            selector: row => row.name,
            sortable: true,
            minWidth: '160px',
            cell: row => (
                <div>
                    <div className="font-bold text-slate-900 text-sm">{row.name}</div>
                    {row.phone && <div className="text-[11px] text-slate-400 font-medium">{row.phone}</div>}
                </div>
            )
        },
        {
            name: 'Email',
            selector: row => row.email,
            sortable: true,
            minWidth: '180px',
            cell: row => row.email
                ? <span className="text-slate-500 text-xs">{row.email}</span>
                : <span className="text-slate-300 italic text-xs">—</span>
        },
        {
            name: 'Company',
            selector: row => row.company,
            sortable: true,
            cell: row => <span className="text-slate-600 font-medium text-sm">{row.company}</span>
        },
        {
            name: 'Source',
            selector: row => row.source,
            sortable: true,
            minWidth: '130px',
            cell: row => row.source === 'Google Maps' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-[11px] font-black border border-emerald-100">
                    <i className="fab fa-google text-[9px]" />
                    Google Maps
                </span>
            ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-500 text-[11px] font-black">
                    <i className="fas fa-user text-[9px]" />
                    {row.source || 'Manual'}
                </span>
            )
        },
        {
            name: 'Website',
            selector: row => row.website,
            minWidth: '160px',
            cell: row => row.website ? (
                <a
                    href={row.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-[12px] font-bold hover:underline"
                    onClick={e => e.stopPropagation()}
                >
                    <i className="fas fa-external-link-alt text-[9px]" />
                    {row.website.replace(/^https?:\/\//, '').replace(/\/$/, '').slice(0, 22)}
                </a>
            ) : <span className="text-slate-300 italic text-xs">—</span>
        },
        {
            name: 'Relevance',
            selector: row => row.relevance,
            sortable: true,
            cell: row => (
                <Badge variant={row.relevance === 'High' ? 'primary' : 'default'}>
                    {row.relevance}
                </Badge>
            )
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            cell: row => (
                <Badge variant={row.status === 'Opened' ? 'success' : row.status === 'New' ? 'info' : 'danger'}>
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

    const aiColumns = useMemo(() => [
        { name: 'Lead Name', selector: row => row.name, sortable: true, cell: row => <span className="font-bold text-slate-900">{row.name}</span> },
        { name: 'Company', selector: row => row.company, sortable: true, cell: row => <span className="text-slate-600 font-medium">{row.company}</span> },
        { name: 'Role', selector: row => row.role, sortable: true, cell: row => <span className="text-slate-500">{row.role}</span> },
        { name: 'Industry', selector: row => row.industry, sortable: true, cell: row => <span className="text-slate-500">{row.industry}</span> },
        {
            name: 'Relevance Score',
            selector: row => row.relevance,
            sortable: true,
            cell: row => (
                <div className="w-full max-w-[100px]">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-indigo-600">{row.relevance}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                            style={{ width: `${row.relevance}%` }}
                        ></div>
                    </div>
                </div>
            )
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            cell: row => <Badge variant="info">{row.status}</Badge>
        }
    ], []);

    // ── Google Maps import handler ─────────────────────────────────────────
    const handleAddGoogleLeads = (newLeads) => {
        setProjectLeads((prev) => [...prev, ...newLeads]);
        setImportToast({ count: newLeads.length });
    };

    // Auto-dismiss toast after 4 seconds
    useEffect(() => {
        if (!importToast) return;
        const timer = setTimeout(() => setImportToast(null), 4000);
        return () => clearTimeout(timer);
    }, [importToast]);

    const handleGenerateLeads = (config) => {
        // Filter mock data based on persona if needed to simulate real behavior
        const filtered = mockGeneratedLeads.filter(l => l.persona === config.persona);
        setAiLeads(filtered.length > 0 ? filtered : mockGeneratedLeads);
    };

    const filteredAiLeads = useMemo(() => {
        return aiLeads.filter(lead => {
            const matchesRelevance = lead.relevance >= relevanceFilter;
            const matchesPersona = personaFilter === '' || lead.persona === personaFilter;
            return matchesRelevance && matchesPersona;
        });
    }, [aiLeads, relevanceFilter, personaFilter]);

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
                <Link to="/dashboard/campaigns/create">
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

                        {/* AI Intelligence Section */}
                        <AIAnalysisCard />
                    </div>
                )}

                {activeTab === 'leads' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Project-Specific Leads</h3>
                                <p className="text-sm text-slate-500 font-medium">Leads shown here are relevant to this project only.</p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setIsSourcingModalOpen(true)}
                                    variant="primary"
                                    className="bg-indigo-600 shadow-xl shadow-indigo-100"
                                >
                                    <i className="fas fa-magic mr-2" />
                                    Source Leads via AI
                                </Button>
                                <Button
                                    onClick={() => setIsGoogleMapsModalOpen(true)}
                                    variant="primary"
                                    className="bg-emerald-600 shadow-xl shadow-emerald-100"
                                >
                                    <i className="fab fa-google mr-2" />
                                    Import from Google Maps
                                </Button>
                            </div>
                        </div>

                        {/* All Project Leads Table (manual + gmaps) */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <TitleComponent type="p" size="small" className="text-slate-400 font-black uppercase tracking-widest">
                                    All Project Leads
                                </TitleComponent>
                                <span className="text-[11px] font-bold text-slate-400">
                                    {projectLeads.length} total
                                </span>
                            </div>
                            <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                                <DataTable
                                    columns={leadColumns}
                                    data={projectLeads}
                                    customStyles={customStyles}
                                    highlightOnHover
                                    responsive
                                    noHeader
                                    noDataComponent={
                                        <div className="py-12 text-center">
                                            <i className="fas fa-user-slash text-slate-200 text-3xl mb-3 block" />
                                            <p className="text-slate-400 font-medium text-sm">No leads added yet.</p>
                                            <p className="text-slate-300 text-xs mt-1">Use the buttons above to import from Google Maps or source via AI.</p>
                                        </div>
                                    }
                                />
                            </div>
                        </div>

                        {/* Google Maps Import flash notice */}
                        {projectLeads.some(l => l.source === 'Google Maps') && (
                            <div className="flex items-center gap-3 px-5 py-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <i className="fab fa-google text-white text-sm" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-emerald-900">
                                        {projectLeads.filter(l => l.source === 'Google Maps').length} lead{projectLeads.filter(l => l.source === 'Google Maps').length !== 1 ? 's' : ''} imported from Google Maps
                                    </p>
                                    <p className="text-xs text-emerald-700 font-medium">Showing in the table above with a Google Maps source badge.</p>
                                </div>
                            </div>
                        )}

                        {/* AI Sourced Leads Section */}
                        {aiLeads.length > 0 && (
                            <div className="pt-10 space-y-6 animate-in fade-in zoom-in-95 duration-500">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-slate-100 pt-10">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
                                                <i className="fas fa-radar text-[10px] text-white"></i>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900">AI Intelligence Sourcing</h3>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium ml-7">Qualified leads surfaced through cross-platform signal analysis.</p>
                                    </div>

                                    {/* AI Filters */}
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Relevance {relevanceFilter}%+</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="90"
                                                value={relevanceFilter}
                                                onChange={(e) => setRelevanceFilter(parseInt(e.target.value))}
                                                className="w-32 accent-indigo-600"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Persona Filter</label>
                                            <select
                                                value={personaFilter}
                                                onChange={(e) => setPersonaFilter(e.target.value)}
                                                className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none"
                                            >
                                                <option value="">All Personas</option>
                                                <option value="The Visionary CTO">The Visionary CTO</option>
                                                <option value="The Growth VP">The Growth VP</option>
                                                <option value="The Product Lead">The Product Lead</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="border border-indigo-100 rounded-[32px] overflow-hidden shadow-2xl shadow-indigo-50/50 bg-white">
                                    <DataTable
                                        columns={aiColumns}
                                        data={filteredAiLeads}
                                        customStyles={{
                                            ...customStyles,
                                            headRow: { style: { ...customStyles.headRow.style, backgroundColor: '#f5f7ff' } },
                                        }}
                                        highlightOnHover
                                        responsive
                                        noHeader
                                        noDataComponent={
                                            <div className="py-10 text-center text-slate-400 font-medium">No leads match your active filters.</div>
                                        }
                                    />
                                </div>
                            </div>
                        )}
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

            <LeadSourcingModal
                isOpen={isSourcingModalOpen}
                onClose={() => setIsSourcingModalOpen(false)}
                onGenerate={handleGenerateLeads}
            />
            <GoogleMapsImportModal
                isOpen={isGoogleMapsModalOpen}
                onClose={() => setIsGoogleMapsModalOpen(false)}
                onAddLeads={handleAddGoogleLeads}
            />
            {importToast && (
                <ImportSuccessToast
                    count={importToast.count}
                    onClose={() => setImportToast(null)}
                />
            )}
        </div>
    )
}

export default ProjectDetail
