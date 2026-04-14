import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import DataTable from 'react-data-table-component'
import TitleComponent from '../components/titleComponent/titleComponent'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import RichTextEditor from '../components/ui/RichTextEditor'
import TemplateStylePicker from '../components/ui/TemplateStylePicker'
import { useAuth } from '../context/AuthContext'
import {
    getUserProjects,
    getProjectLeads,
    createCampaign,
    getProjectCampaigns,
    setCampaignAudience,
    getProject,
    getUserTemplates,
    recordEmailSend,
    updateCampaign
} from '../services/db'
import { renderCampaignEmail } from '../emails/renderEmails'
import { hasEmailTemplate } from '../emails'
import { launchCampaign } from '../services/emailService'

const CAMPAIGN_TYPES = [
    { id: 'brand_introduction', name: 'Brand Introduction', icon: 'fa-bullhorn', color: 'bg-blue-50 text-blue-600' },
    { id: 'product_pitch', name: 'Product Pitch', icon: 'fa-box-open', color: 'bg-emerald-50 text-emerald-600' },
    { id: 'problem_solution', name: 'Problem → Solution', icon: 'fa-lightbulb', color: 'bg-amber-50 text-amber-600' },
    { id: 'demo_request', name: 'Demo Request', icon: 'fa-calendar-check', color: 'bg-indigo-50 text-indigo-600' },
    { id: 'follow_up', name: 'Follow-up', icon: 'fa-reply-all', color: 'bg-slate-50 text-slate-600' },
    { id: 'partnership', name: 'Partnership', icon: 'fa-handshake', color: 'bg-purple-50 text-purple-600' }
]

const CampaignCreate = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const urlProjectId = searchParams.get('projectId')
    const { currentUser } = useAuth()
    const [currentStep, setCurrentStep] = useState(1)

    // DB state
    const [dbProjects, setDbProjects] = useState([])
    const [projectsLoading, setProjectsLoading] = useState(true)
    const [dbLeads, setDbLeads] = useState([])
    const [dbTemplates, setDbTemplates] = useState([])
    const [leadsLoading, setLeadsLoading] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [projectsError, setProjectsError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [launching, setLaunching] = useState(false)
    const [launchProgress, setLaunchProgress] = useState({ total: 0, current: 0 })
    const [selectedProject, setSelectedProject] = useState(null)

    // Form state
    const [formData, setFormData] = useState({
        project: '',
        name: '',
        campaignType: '',
        templateId: '',
        subject: '',
        emailContent: '',
        selectedRows: [],
        templateStyle: 'clean_minimal',
        accentColor: '#4f46e5'
    })

    const [showPreviewModal, setShowPreviewModal] = useState(false)

    // Load initial data
    useEffect(() => {
        if (!currentUser) return

        const loadProjects = async () => {
            try {
                setProjectsLoading(true)
                setProjectsError('')
                const projects = await getUserProjects(currentUser.uid)
                const sorted = projects.sort((a, b) => b.createdAt - a.createdAt)
                setDbProjects(sorted)

                // Handlers for pre-selection
                if (urlProjectId) {
                    handleProjectChange(urlProjectId)
                } else if (sorted.length === 1) {
                    handleProjectChange(sorted[0].id)
                }
            } catch (err) {
                console.error('[CampaignCreate] project load error:', err)
                setProjectsError('Failed to fetch projects.')
            } finally {
                setProjectsLoading(false)
            }
        }

        loadProjects()
    }, [currentUser, urlProjectId])

    const handleProjectChange = async (projectId) => {
        setFormData(prev => ({ ...prev, project: projectId, selectedRows: [] }))
        if (!projectId) {
            setDbLeads([])
            setSelectedProject(null)
            return
        }
        try {
            setLeadsLoading(true)
            const [projectData, leads] = await Promise.all([
                getProject(projectId),
                getProjectLeads(projectId)
            ])
            setSelectedProject(projectData)
            setDbLeads(leads)
        } catch (err) {
            console.error('[CampaignCreate] load project info:', err)
        } finally {
            setLeadsLoading(false)
        }
    }

    const replaceProjectPlaceholders = (text, project) => {
        if (!text || !project) return text
        let result = text
        const features = typeof project.features === 'string'
            ? project.features.split(',').map(f => f.trim())
            : (Array.isArray(project.features) ? project.features : [])

        const replacements = {
            '{{projectName}}': project.name || '',
            '{{industry}}': project.industry || '',
            '{{targetAudience}}': project.targetAudience || '',
            '{{mainBenefit}}': project.description || '',
            '{{keyFeature1}}': features[0] || 'core efficiency',
            '{{keyFeature2}}': features[1] || 'seamless workflow',
            '{{website}}': project.website || 'our platform'
        }

        Object.keys(replacements).forEach(key => {
            result = result.split(key).join(replacements[key])
        })
        return result
    }

    const replaceLeadPlaceholders = (text, lead) => {
        if (!text || !lead) return text
        let result = text
        const replacements = {
            '{{firstName}}': lead.firstName || lead.first_name || lead.name?.split(' ')[0] || 'there',
            '{{lastName}}': lead.lastName || lead.last_name || lead.name?.split(' ').slice(1).join(' ') || '',
            '{{companyName}}': lead.company_name || lead.company || 'your company',
            '{{email}}': lead.email || ''
        }

        Object.keys(replacements).forEach(key => {
            result = result.split(key).join(replacements[key])
        })
        return result
    }

    const handleGenerateEmail = async () => {
        if (!selectedProject || !formData.campaignType) return

        try {
            setSubmitting(true)
            if (!hasEmailTemplate(formData.campaignType)) throw new Error('Template not found for this category')

            // Use placeholders for lead data so they can be replaced at send time
            const leadPlaceholder = {
                firstName: '{{firstName}}',
                lastName: '{{lastName}}',
                company_name: '{{companyName}}'
            }

            const subject = replaceProjectPlaceholders('Quick question for {{firstName}} at {{companyName}}', selectedProject)

            // Render the email template with project info, lead placeholders, style + accent
            const html = await renderCampaignEmail(
                formData.campaignType,
                selectedProject,
                leadPlaceholder,
                null,
                formData.templateStyle,
                formData.accentColor
            )

            setFormData(prev => ({
                ...prev,
                subject,
                emailContent: html,
                templateId: `react_${formData.campaignType}`
            }))
            setCurrentStep(5)
            toast.success('Generated optimized layout!')
        } catch (err) {
            console.error('[CampaignCreate] generation error:', err)
            toast.error('Failed to render email template.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleApplyStyle = async () => {
        if (!selectedProject || !formData.campaignType) return
        try {
            setSubmitting(true)
            const leadPlaceholder = {
                firstName: '{{firstName}}',
                lastName: '{{lastName}}',
                company_name: '{{companyName}}'
            }
            const html = await renderCampaignEmail(
                formData.campaignType,
                selectedProject,
                leadPlaceholder,
                null,
                formData.templateStyle,
                formData.accentColor
            )
            setFormData(prev => ({ ...prev, emailContent: html }))
            toast.success('Style applied!')
        } catch (err) {
            console.error('[CampaignCreate] apply style error:', err)
            toast.error('Failed to apply style.')
        } finally {
            setSubmitting(false)
        }
    }

    const steps = [
        { number: 1, title: 'Project', icon: 'fa-folder' },
        { number: 2, title: 'Campaign Type', icon: 'fa-tags' },
        { number: 3, title: 'Template', icon: 'fa-file-alt' },
        { number: 4, title: 'Generate', icon: 'fa-magic' },
        { number: 5, title: 'Edit', icon: 'fa-edit' },
        { number: 6, title: 'Audience', icon: 'fa-users' },
        { number: 7, title: 'Review & Save', icon: 'fa-save' }
    ]

    const handleNext = async () => {
        setSubmitError('')
        if (currentStep === 1 && !formData.project) {
            setSubmitError('Please select a project.')
            return
        }
        if (currentStep === 2) {
            if (!formData.campaignType) {
                setSubmitError('Please select a campaign type.')
                return
            }
            if (!formData.name.trim()) {
                setSubmitError('Please provide a campaign name.')
                return
            }
        }
        if (currentStep === 3) {
            // Template is auto-selected based on campaignType
            setCurrentStep(currentStep + 1)
            return
        }
        if (currentStep === 5) {
            if (!formData.subject.trim() || !formData.emailContent.trim() || formData.emailContent === '<p></p>') {
                setSubmitError('Subject and content are required.')
                return
            }
        }
        if (currentStep === 6 && formData.selectedRows.length === 0) {
            setSubmitError('Please select at least one lead.')
            return
        }
        if (currentStep < 7) setCurrentStep(currentStep + 1)
    }

    const handlePrevious = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1)
    }

    const handleSubmit = async () => {
        if (!currentUser) return
        setSubmitting(true)
        setSubmitError('')
        try {
            const leadIds = formData.selectedRows.map(row => row.id)
            const campaign = await createCampaign(currentUser.uid, formData.project, {
                campaignName: formData.name,
                name: formData.name,
                templateId: formData.templateId,
                subjectLine: formData.subject,
                subject: formData.subject,
                emailBodyHTML: formData.emailContent,
                emailContent: formData.emailContent,
                body: formData.emailContent,
                selectedLeadIds: leadIds,
                templateStyle: formData.templateStyle,
                accentColor: formData.accentColor,
                createdAt: Date.now(),
                status: 'draft'
            })
            await setCampaignAudience(formData.project, campaign.id, leadIds)
            toast.success('Campaign saved as draft.')
            navigate(`/dashboard/campaigns/${campaign.id}`)
        } catch (err) {
            toast.error('Failed to save campaign.')
            setSubmitError(err.message || 'Failed to save campaign.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleLaunchCampaign = async () => {
        if (!currentUser || formData.selectedRows.length === 0) return
        setLaunching(true)
        setSubmitError('')

        try {
            // 1. Save campaign as draft first
            const leadIds = formData.selectedRows.map(row => row.id)
            const campaign = await createCampaign(currentUser.uid, formData.project, {
                campaignName: formData.name,
                name: formData.name,
                campaignType: formData.campaignType,   // ← needed by send-campaign.js
                templateId: formData.templateId,
                subjectLine: formData.subject,
                subject: formData.subject,
                emailBodyHTML: formData.emailContent,
                emailContent: formData.emailContent,
                body: formData.emailContent,
                selectedLeadIds: leadIds,
                templateStyle: formData.templateStyle,
                accentColor: formData.accentColor,
                createdAt: Date.now(),
                status: 'draft'                        // ← draft, not 'sending'
            })
            await setCampaignAudience(formData.project, campaign.id, leadIds)

            // 2. NOW call Resend via the Vercel API — this is what actually sends emails
            const result = await launchCampaign(campaign.id)

            toast.success(`🚀 Sent to ${result.totalSent} leads!`)
            navigate(`/dashboard/campaigns/${campaign.id}`)

        } catch (err) {
            console.error('[CampaignCreate] launch error:', err)
            toast.error(err.message || 'Launch failed.')
            setSubmitError(err.message || 'Launch failed.')
        } finally {
            setLaunching(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex justify-between items-start">
                <div>
                    <TitleComponent type="h1" className="text-slate-900 text-3xl font-bold font-idGrotesk">Create New Campaign</TitleComponent>
                    <TitleComponent type="p" size="base" className="text-slate-500 mt-1">Guided template-based outreach workflow.</TitleComponent>
                </div>
            </div>

            {/* Steps */}
            <div className="bg-white rounded-[16px] shadow-sm border border-slate-100 p-6 overflow-x-auto">
                <div className="flex justify-between gap-4 min-w-[600px]">
                    {steps.map((st, i) => (
                        <div key={st.number} className="flex flex-col items-center flex-1 relative">
                            <div className={`z-10 w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${currentStep === st.number ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-100' : currentStep > st.number ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {currentStep > st.number ? <i className="fas fa-check text-xs" /> : st.number}
                            </div>
                            <span className={`mt-2 text-[10px] font-black uppercase tracking-tighter text-center ${currentStep === st.number ? 'text-indigo-600' : 'text-slate-400'}`}>{st.title}</span>
                            {i < steps.length - 1 && <div className="absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-[2px] bg-slate-50" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Container */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 min-h-[500px] overflow-hidden flex flex-col">
                <div className="p-10 flex-grow">
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pt-4">
                            <div className="text-center max-w-md mx-auto">
                                <h2 className="text-2xl font-bold text-slate-900 font-idGrotesk uppercase tracking-tight">Select Project</h2>
                                <p className="text-slate-500 mt-2 italic text-sm">Target one of your existing workspaces.</p>
                            </div>

                            {projectsLoading ? (
                                <div className="py-20 flex flex-col items-center gap-4">
                                    <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-lg animate-spin" />
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fetching your projects...</p>
                                </div>
                            ) : projectsError ? (
                                <div className="py-20 text-center space-y-4">
                                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-500">
                                        <i className="fas fa-exclamation-triangle text-3xl" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Connection Error</h3>
                                    <p className="text-slate-500 max-w-xs mx-auto text-xs">{projectsError}</p>
                                    <Button variant="outline" onClick={() => window.location.reload()}>Retry Connection</Button>
                                </div>
                            ) : dbProjects.length === 0 ? (
                                <div className="py-20 text-center space-y-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-200">
                                        <i className="fas fa-folder-open text-3xl" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">No Projects Found</h3>
                                    <p className="text-slate-500 max-w-xs mx-auto text-xs">You need at least one project to launch a campaign.</p>
                                    <Button variant="outline" onClick={() => navigate('/dashboard/projects/create')}>Create Project</Button>
                                </div>
                            ) : (
                                <div className="max-w-xl mx-auto space-y-10">
                                    {/* Dropdown Selector */}
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Project Workspace Dropdown</label>
                                        <div className="relative">
                                            <select
                                                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-700 text-lg shadow-inner appearance-none cursor-pointer"
                                                value={formData.project}
                                                onChange={(e) => handleProjectChange(e.target.value)}
                                            >
                                                <option value="">Select a project from the list...</option>
                                                {dbProjects.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <i className="fas fa-chevron-down" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative py-2 pb-10">
                                        {leadsLoading && formData.project && (
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 text-center justify-center bg-indigo-50/50 py-3 rounded-xl animate-pulse">
                                                <i className="fas fa-spinner fa-spin" />
                                                <span>FETCHING PROJECT ASSETS & LEADS...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 pt-4">
                            <div className="max-w-xl mx-auto space-y-10">
                                <Input label="Campaign Name" placeholder="e.g. March Expansion Outreach" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                <div className="space-y-4">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Campaign Category</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {CAMPAIGN_TYPES.map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => setFormData({ ...formData, campaignType: type.id })}
                                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.campaignType === type.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-50 bg-white hover:border-slate-100'}`}
                                            >
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type.color}`}>
                                                    <i className={`fas ${type.icon}`} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-tighter text-center">{type.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 pt-4">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-slate-900">Confirm Outreach Template</h2>
                                <p className="text-slate-500 mt-2">Personalizing the "{CAMPAIGN_TYPES.find(ct => ct.id === formData.campaignType)?.name}" React Email layout.</p>
                            </div>
                            <div className="flex justify-center">
                                {formData.campaignType && (
                                    <div className="p-10 rounded-[32px] border-2 border-indigo-600 bg-indigo-50/30 max-w-lg w-full text-center shadow-xl shadow-indigo-100/50 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <i className={`fas ${CAMPAIGN_TYPES.find(ct => ct.id === formData.campaignType)?.icon} text-6xl`} />
                                        </div>
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm text-indigo-600">
                                            <i className="fas fa-magic text-2xl" />
                                        </div>
                                        <h4 className="font-black text-slate-900 text-xl uppercase tracking-tight">
                                            {CAMPAIGN_TYPES.find(ct => ct.id === formData.campaignType)?.name}
                                        </h4>
                                        <p className="text-sm text-slate-500 mt-3 leading-relaxed font-medium">
                                            Our high-converting, responsive React layout including personalized company features, lead variables, and custom branding.
                                        </p>
                                        <div className="mt-8 pt-8 border-t border-indigo-100 flex justify-center gap-4">
                                            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest bg-white px-3 py-1 rounded-full shadow-sm">Variable Engine</span>
                                            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest bg-white px-3 py-1 rounded-full shadow-sm">Auto-Branding</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="flex flex-col items-center justify-center space-y-8 py-20 animate-in fade-in zoom-in-95">
                            <div className="w-24 h-24 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-indigo-100">
                                <i className="fas fa-magic text-4xl" />
                            </div>
                            <div className="text-center">
                                <h2 className="text-3xl font-idGrotesk font-black text-slate-900 uppercase">Ready to Personalize</h2>
                                <p className="text-slate-500 mt-2 max-w-sm">We'll inject your project features and benefits into the selected template.</p>
                            </div>
                            <Button variant="primary" onClick={handleGenerateEmail} className="px-16 py-6 h-auto text-xl font-bold rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-100">Generate Email Content</Button>
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

                            {/* Template style + accent color picker */}
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <TemplateStylePicker
                                    selectedStyle={formData.templateStyle}
                                    onStyleChange={style => setFormData(prev => ({ ...prev, templateStyle: style }))}
                                    accentColor={formData.accentColor}
                                    onAccentColorChange={color => setFormData(prev => ({ ...prev, accentColor: color }))}
                                />
                                {/* Apply Style button */}
                                <div className="mt-5 pt-5 border-t border-slate-100 flex items-center gap-3">
                                    <Button
                                        variant="primary"
                                        className="h-10 px-6 bg-indigo-600 font-bold text-sm"
                                        onClick={handleApplyStyle}
                                        disabled={submitting}
                                    >
                                        {submitting
                                            ? <><i className="fas fa-spinner fa-spin mr-2" />Applying...</>
                                            : <><i className="fas fa-paint-brush mr-2" />Apply Style</>}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-10 px-6 text-sm font-bold"
                                        onClick={() => setShowPreviewModal(true)}
                                    >
                                        <i className="fas fa-eye mr-2" />Preview Email
                                    </Button>
                                </div>
                            </div>

                            {/* Subject line */}
                            <Input
                                label="Subject Line"
                                value={formData.subject}
                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                required
                                className="bg-slate-50 border-slate-100 font-bold"
                            />

                            {/* Rich text editor for manual edits */}
                            <RichTextEditor
                                label="Email Body"
                                value={formData.emailContent}
                                onChange={content => setFormData({ ...formData, emailContent: content })}
                            />
                        </div>
                    )}

                    {/* Email preview modal */}
                    {showPreviewModal && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                            {/* Backdrop */}
                            <div
                                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                                onClick={() => setShowPreviewModal(false)}
                            />
                            {/* Modal */}
                            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
                                {/* Header */}
                                <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900">Email Preview</h3>
                                        <p className="text-xs text-slate-400 mt-0.5">{formData.subject || 'No subject set'}</p>
                                    </div>
                                    <button
                                        onClick={() => setShowPreviewModal(false)}
                                        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all"
                                    >
                                        <i className="fas fa-times" />
                                    </button>
                                </div>
                                {/* iFrame preview */}
                                <div className="p-4 bg-slate-50">
                                    <iframe
                                        srcDoc={formData.emailContent}
                                        title="Email preview"
                                        className="w-full rounded-xl border border-slate-200 bg-white shadow-inner"
                                        style={{ height: '60vh', minHeight: 400 }}
                                        sandbox="allow-same-origin"
                                    />
                                </div>
                                {/* Footer */}
                                <div className="px-8 py-4 border-t border-slate-100 flex justify-end">
                                    <Button
                                        variant="outline"
                                        className="h-9 px-6 text-sm"
                                        onClick={() => setShowPreviewModal(false)}
                                    >
                                        Close Preview
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 6 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Target Audience</h3>
                                    <p className="text-xs text-slate-500">Only showing leads from project "{selectedProject?.name}"</p>
                                </div>
                                <Badge variant="primary">{formData.selectedRows.length} Leads Selected</Badge>
                            </div>
                            <div className="border border-slate-100 rounded-2xl overflow-hidden">
                                <DataTable
                                    columns={[
                                        {
                                            name: 'Name',
                                            selector: r => `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.name || 'N/A',
                                            sortable: true,
                                            cell: r => <span className="font-bold text-slate-800">{`${r.first_name || ''} ${r.last_name || ''}`.trim() || r.name || 'N/A'}</span>
                                        },
                                        { name: 'Company', selector: r => r.company_name || r.company || 'N/A', sortable: true },
                                        { name: 'Email', selector: r => r.email }
                                    ]}
                                    data={dbLeads}
                                    selectableRows
                                    onSelectedRowsChange={({ selectedRows }) => setFormData({ ...formData, selectedRows })}
                                    highlightOnHover
                                    responsive
                                    noHeader
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 7 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaign</p>
                                    <p className="text-lg font-bold text-slate-900">{formData.name}</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project</p>
                                    <p className="text-lg font-bold text-slate-900">{selectedProject?.name}</p>
                                </div>
                                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Audience</p>
                                    <p className="text-lg font-bold text-emerald-900">{formData.selectedRows.length} Leads</p>
                                </div>
                            </div>
                            <div className="rounded-2xl border border-slate-100 overflow-hidden">
                                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Email Preview</span>
                                    <span className="text-xs font-bold text-indigo-600">{formData.subject}</span>
                                </div>
                                <div className="p-8 prose prose-slate max-w-none bg-white">
                                    <div dangerouslySetInnerHTML={{ __html: formData.emailContent }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navbar/Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center px-10">
                    <Button variant="outline" className="px-10 h-14" onClick={handlePrevious} disabled={currentStep === 1}>Go Back</Button>
                    <div className="flex gap-4">
                        {currentStep < 7 ? (
                            <Button variant="primary" className="px-16 h-14 bg-indigo-600 font-bold" onClick={handleNext}>Next Step</Button>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    className="px-8 h-14 border-emerald-200 text-emerald-700 font-bold"
                                    onClick={handleSubmit}
                                    disabled={submitting || launching}
                                >
                                    {submitting ? 'Saving...' : 'Save as Draft'}
                                </Button>
                                <Button
                                    variant="primary"
                                    className={`px-12 h-14 font-bold border-none transition-all ${launching ? 'bg-indigo-400' : 'bg-indigo-600 shadow-xl shadow-indigo-100'}`}
                                    onClick={handleLaunchCampaign}
                                    disabled={launching || submitting}
                                >
                                    {launching ? (
                                        <><i className="fas fa-spinner fa-spin mr-2" /> Sending...</>
                                    ) : (
                                        <><i className="fas fa-paper-plane mr-2" /> Launch Campaign</>
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {submitError && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium text-sm flex items-center gap-2 animate-in shake"><i className="fas fa-exclamation-circle" /> {submitError}</div>}
        </div>
    )
}

export default CampaignCreate


