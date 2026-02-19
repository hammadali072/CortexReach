import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable from 'react-data-table-component'
import TitleComponent from '../components/titleComponent/titleComponent'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import TemplateCard from '../components/ui/TemplateCard'
import { useAuth } from '../context/AuthContext'
import { getUserProjects, getProjectLeads, createCampaign } from '../services/db'

const CampaignCreate = () => {
    const navigate = useNavigate()
    const { currentUser } = useAuth()
    const [currentStep, setCurrentStep] = useState(1)

    // DB state
    const [dbProjects, setDbProjects] = useState([])
    const [dbLeads, setDbLeads] = useState([])
    const [leadsLoading, setLeadsLoading] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // Load projects on mount
    useEffect(() => {
        if (!currentUser) return
        getUserProjects(currentUser.uid)
            .then(data => setDbProjects(data.sort((a, b) => b.createdAt - a.createdAt)))
            .catch(err => console.error('[CampaignCreate] load projects:', err))
    }, [currentUser])

    // Form state
    const [formData, setFormData] = useState({
        project: '',
        name: '',
        subject: '',
        emailContent: '',
        templateId: null,
        selectedRows: []
    })

    const [genStatus, setGenStatus] = useState('idle'); // idle, generating, completed

    const mockTemplates = [
        {
            id: 1,
            title: "Executive Priority",
            subject: "Streamlining your Q2 roadmap for {{company}}",
            body: "Hi {{name}}, I noticed your recent push towards automation. Our AI model suggests this is a high-yield priority for Nexus Systems...",
            tone: "Formal",
            cta: "Meeting Link",
            prediction: 94
        },
        {
            id: 2,
            title: "Growth Catalyst",
            subject: "Quick question about growth at {{company}}",
            body: "Hey {{name}}, really impressed with what you're doing. We've helped similar teams scale their outreach yield by 40%. Interested in a quick sync?",
            tone: "Friendly",
            cta: "Direct Reply",
            prediction: 88
        },
        {
            id: 3,
            title: "Problem Solver",
            subject: "Solving the developer churn at {{company}}",
            body: "Hi {{name}}, most CTOs we talk to are struggling with engineering retention. We have a specific framework that might help. Open to a chat?",
            tone: "Direct",
            cta: "Calendar",
            prediction: 91
        }
    ];

    const handleGenerateTemplates = () => {
        setGenStatus('generating');
        setTimeout(() => setGenStatus('completed'), 2000);
    }

    // When project selection changes, load its leads from DB
    const handleProjectChange = async (projectId) => {
        setFormData(prev => ({ ...prev, project: projectId, selectedRows: [] }))
        if (!projectId) { setDbLeads([]); return }
        try {
            setLeadsLoading(true)
            const leads = await getProjectLeads(projectId)
            setDbLeads(leads)
        } catch (err) {
            console.error('[CampaignCreate] load leads:', err)
        } finally {
            setLeadsLoading(false)
        }
    }

    /**
     * Product Rule: Simplified 3-step outreach setup.
     * 1. Content: What are you sending? Tied specifically to a Project.
     * 2. Audience: Who is getting it?
     * 3. Review: Final check before engagement starts.
     */
    const steps = [
        { number: 1, title: 'Project & Content', icon: 'fa-edit' },
        { number: 2, title: 'Select Audience', icon: 'fa-users' },
        { number: 3, title: 'Review & Send', icon: 'fa-check-circle' }
    ]

    // Use DB leads (fallback to empty array)
    const availableLeads = dbLeads

    const columns = useMemo(() => [
        {
            name: 'Contact',
            selector: row => row.name,
            sortable: true,
            cell: row => (
                <div className="py-2">
                    <div className="text-sm font-bold text-slate-900">{row.name}</div>
                    <div className="text-xs text-slate-500">{row.email}</div>
                </div>
            )
        },
        {
            name: 'Company',
            selector: row => row.company,
            sortable: true,
            cell: row => <span className="text-sm text-slate-600 font-medium">{row.company}</span>
        }
    ], [])

    const customStyles = {
        table: {
            style: {
                backgroundColor: 'transparent',
            },
        },
        headRow: {
            style: {
                backgroundColor: '#f8fafc',
                borderBottomWidth: '1px',
                borderBottomColor: '#f1f5f9',
                minHeight: '52px',
            },
        },
        headCells: {
            style: {
                color: '#64748b',
                fontSize: '0.7rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
            },
        },
        rows: {
            style: {
                minHeight: '64px',
                '&:not(:last-child)': {
                    borderBottomWidth: '1px',
                    borderBottomColor: '#f8fafc',
                },
            },
        },
    }

    const handleNext = () => {
        if (currentStep === 1 && !formData.project) {
            setSubmitError('Please select a project before proceeding.')
            return
        }
        if (currentStep === 1 && !formData.name.trim()) {
            setSubmitError('Campaign name is required.')
            return
        }
        setSubmitError('')
        if (currentStep < 3) setCurrentStep(currentStep + 1)
    }

    const handlePrevious = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1)
    }

    const handleSubmit = async () => {
        if (!currentUser) return
        setSubmitError('')
        setSubmitting(true)
        try {
            await createCampaign(currentUser.uid, formData.project, {
                name: formData.name,
                templateId: formData.templateId,
                type: 'initial',
            })
            navigate('/dashboard/campaigns')
        } catch (err) {
            setSubmitError(err.message || 'Failed to create campaign.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleSelectedRowsChange = ({ selectedRows }) => {
        setFormData(prev => ({ ...prev, selectedRows }))
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <TitleComponent type="h1" className="text-slate-900 text-3xl font-bold font-idGrotesk">
                        Create Outreach
                    </TitleComponent>
                    <TitleComponent type="p" size="base" className="text-slate-500 mt-1">
                        Outreach is strictly project-based to ensure maximum relevance.
                    </TitleComponent>
                </div>
                {formData.project && (
                    <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
                        <i className="fas fa-folder-open" />
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Active Project</p>
                            <p className="text-xs font-bold">{dbProjects.find(p => p.id === formData.project)?.name || formData.project}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-between px-8 py-6 bg-white rounded-3xl shadow-sm border border-slate-100">
                {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center flex-1 last:flex-none">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black font-idGrotesk text-lg transition-all ${currentStep === step.number ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-110' :
                                currentStep > step.number ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                                }`}>
                                {currentStep > step.number ? <i className="fas fa-check"></i> : step.number}
                            </div>
                            <span className={`text-sm font-black uppercase tracking-wider ${currentStep === step.number ? 'text-slate-900' : 'text-slate-400'}`}>
                                {step.title}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className="flex-1 h-px bg-slate-100 mx-8" />
                        )}
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-10 min-h-[450px]">
                {/* Step 1: Content */}
                {currentStep === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Target Project</label>
                                <select
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700"
                                    value={formData.project}
                                    onChange={(e) => handleProjectChange(e.target.value)}
                                    required
                                >
                                    <option value="">Select a Project...</option>
                                    {dbProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <p className="text-[10px] text-slate-400 mt-1 px-1">Campaigns must be tied to a project for relevance enforcement.</p>
                            </div>
                            <Input
                                label="Campaign Identifier"
                                placeholder="e.g., Q1 Expansion Outreach"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">AI Template Generation</label>
                                    <p className="text-[10px] text-slate-400 mt-1 px-1">Generate multi-template assets optimized for your project.</p>
                                </div>
                                {genStatus === 'idle' && (
                                    <Button
                                        variant="primary"
                                        onClick={handleGenerateTemplates}
                                        className="bg-indigo-600 shadow-lg shadow-indigo-100 animate-in fade-in"
                                    >
                                        <i className="fas fa-sparkles mr-2"></i>
                                        Generate AI Templates
                                    </Button>
                                )}
                            </div>

                            {genStatus === 'generating' && (
                                <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
                                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                    <p className="text-sm font-bold text-slate-500 animate-pulse">Our AI is drafting high-intent templates...</p>
                                </div>
                            )}

                            {genStatus === 'completed' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                    {mockTemplates.map((template) => (
                                        <TemplateCard
                                            key={template.id}
                                            template={template}
                                            isSelected={formData.templateId === template.id}
                                            onSelect={() => {
                                                setFormData({
                                                    ...formData,
                                                    templateId: template.id,
                                                    subject: template.subject,
                                                    emailContent: template.body
                                                });
                                            }}
                                        />
                                    ))}
                                </div>
                            )}

                            {(genStatus === 'idle' || genStatus === 'generating') && (
                                <div className="p-12 border-2 border-dashed border-slate-100 rounded-[40px] flex flex-col items-center justify-center text-center opacity-50">
                                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
                                        <i className="fas fa-magic text-2xl text-slate-200"></i>
                                    </div>
                                    <p className="text-sm font-bold text-slate-300">Run the generator to see AI insights</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Audience */}
                {currentStep === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center justify-between mb-2">
                            <TitleComponent type="h3" className="text-slate-900 font-black text-xl">Target Leads</TitleComponent>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Only leads for "{formData.project}" shown</span>
                                <span className="text-sm font-bold text-indigo-600 px-4 py-1 bg-indigo-50 rounded-full">{formData.selectedRows.length} Selected</span>
                            </div>
                        </div>
                        <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                            <DataTable
                                columns={columns}
                                data={availableLeads}
                                selectableRows
                                onSelectedRowsChange={handleSelectedRowsChange}
                                customStyles={customStyles}
                                highlightOnHover
                                responsive
                                noHeader
                            />
                        </div>
                    </div>
                )}

                {/* Step 3: Review */}
                {currentStep === 3 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Campaign Details</h4>
                                    <p className="text-xl font-bold text-slate-900">{formData.name || 'Unnamed Campaign'}</p>
                                    <p className="text-slate-500 font-medium">Context: <span className="text-indigo-600 font-bold">{formData.project}</span></p>
                                    <p className="text-slate-500 font-medium mt-1">Subject: <span className="text-slate-900">{formData.subject || 'Not specified'}</span></p>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl">
                                    <i className="fas fa-users text-emerald-600 text-xl" />
                                    <div>
                                        <p className="text-sm font-black text-emerald-900">{formData.selectedRows.length} Leads Targeted</p>
                                        <p className="text-xs text-emerald-700">Initial engagement signals will be tracked</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 bg-slate-900 text-white rounded-[32px] shadow-xl relative overflow-hidden group">
                                <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-4">Project Relevance</h4>
                                <p className="text-sm leading-relaxed text-slate-300 font-medium">
                                    You are initiating outreach for <span className="text-white underline decoration-indigo-500 decoration-2 underline-offset-4">{formData.project}</span>. The system will ensure all content and leads are synchronized with this project scope.
                                </p>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Final Message Preview</h4>
                            <div className="p-8 bg-slate-50 text-slate-700 rounded-[32px] border border-slate-100 leading-relaxed font-medium">
                                {formData.emailContent || 'No content provided.'}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Error display */}
            {submitError && (
                <div className="px-2 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium flex items-center gap-3">
                    <i className="fas fa-exclamation-circle ml-2" />
                    {submitError}
                </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center px-2">
                <Button variant="outline" className="px-10 py-4 border-slate-200" onClick={handlePrevious} disabled={currentStep === 1}>
                    Go Back
                </Button>
                <div className="flex gap-4">
                    <Button variant="outline" className="px-10 border-slate-200" onClick={() => navigate('/dashboard/campaigns')}>Exit</Button>
                    {currentStep < 3 ? (
                        <Button variant="primary" className="px-12 py-4 h-auto text-lg shadow-xl shadow-indigo-100" onClick={handleNext}>Next Step</Button>
                    ) : (
                        <Button variant="primary" onClick={handleSubmit} disabled={submitting} className="px-16 py-4 h-auto text-lg bg-indigo-600 shadow-xl shadow-indigo-200">
                            {submitting ? <><i className="fas fa-spinner fa-spin mr-2" />Launching...</> : 'Launch Campaign'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CampaignCreate
