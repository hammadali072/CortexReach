import { useState, useEffect, useMemo } from 'react'
import TitleComponent from '../components/titleComponent/titleComponent'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import RichTextEditor from '../components/ui/RichTextEditor'
import { useAuth } from '../context/AuthContext'
import { getUserTemplates, createTemplate, updateTemplate, deleteTemplate } from '../services/db'

const CAMPAIGN_TYPES = [
    { id: 'brand_introduction', name: 'Brand Introduction', icon: 'fa-bullhorn', color: 'bg-blue-50 text-blue-600' },
    { id: 'product_pitch', name: 'Product Pitch', icon: 'fa-box-open', color: 'bg-emerald-50 text-emerald-600' },
    { id: 'problem_solution', name: 'Problem → Solution', icon: 'fa-lightbulb', color: 'bg-amber-50 text-amber-600' },
    { id: 'demo_request', name: 'Demo Request', icon: 'fa-calendar-check', color: 'bg-indigo-50 text-indigo-600' },
    { id: 'follow_up', name: 'Follow-up', icon: 'fa-reply-all', color: 'bg-slate-50 text-slate-600' },
    { id: 'partnership', name: 'Partnership', icon: 'fa-handshake', color: 'bg-purple-50 text-purple-600' }
]

const DEFAULT_TEMPLATES = [
    {
        name: 'Standard Brand Intro',
        campaignType: 'brand_introduction',
        subjectTemplate: 'Helping {{companyName}} simplify wellness bookings',
        bodyTemplate: `<p>Hi {{firstName}},</p><p>I came across {{companyName}} while researching businesses in the {{industry}} space.</p><p>I'm reaching out because we built <strong>{{projectName}}</strong>, a platform designed to help {{targetAudience}} streamline daily operations.</p><p>With features like <em>{{keyFeature1}}</em> and <em>{{keyFeature2}}</em>, teams are able to reduce manual work and provide a smoother experience for their clients.</p><p>Would you be open to a quick 10-minute call next week to see if this could be relevant for your team?</p><p>Best regards,<br>{{projectName}} Team</p>`
    },
    {
        name: 'Feature Pitch',
        campaignType: 'product_pitch',
        subjectTemplate: 'New way to handle {{industry}} tasks for {{projectName}}',
        bodyTemplate: `<p>Hello {{firstName}},</p><p>I wanted to share <strong>{{projectName}}</strong> with you. We've seen great results helping {{targetAudience}} achieve better efficiency through {{keyFeature1}}.</p><p>Check out our site at {{website}} to see how it works.</p><p>Best,<br>The {{projectName}} Team</p>`
    }
]

const Templates = () => {
    const { currentUser } = useAuth()
    const [templates, setTemplates] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        campaignType: 'brand_introduction',
        subjectTemplate: '',
        bodyTemplate: ''
    })

    const loadTemplates = async () => {
        if (!currentUser?.uid) return
        try {
            setLoading(true)
            setError('')
            let data = await getUserTemplates(currentUser.uid)

            // Auto-seed if empty
            if (data.length === 0) {
                console.log('[Templates] Seeding default templates...')
                await Promise.all(DEFAULT_TEMPLATES.map(t => createTemplate(currentUser.uid, t)))
                data = await getUserTemplates(currentUser.uid)
            }

            setTemplates(data)
        } catch (err) {
            console.error('[Templates] load error:', err)
            setError('Failed to fetch templates from backend.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (currentUser?.uid) {
            loadTemplates()
        }
    }, [currentUser?.uid])

    const handleOpenModal = (template = null) => {
        if (template) {
            setEditingTemplate(template)
            setFormData({
                name: template.name,
                campaignType: template.campaignType,
                subjectTemplate: template.subjectTemplate,
                bodyTemplate: template.bodyTemplate
            })
        } else {
            setEditingTemplate(null)
            setFormData({
                name: '',
                campaignType: 'brand_introduction',
                subjectTemplate: '',
                bodyTemplate: ''
            })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            if (editingTemplate) {
                await updateTemplate(editingTemplate.id, formData)
            } else {
                await createTemplate(currentUser.uid, formData)
            }
            setIsModalOpen(false)
            loadTemplates()
        } catch (err) {
            console.error('[Templates] save error:', err)
            alert('Failed to save template.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return
        try {
            await deleteTemplate(id)
            loadTemplates()
        } catch (err) {
            console.error('[Templates] delete error:', err)
        }
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <TitleComponent type="h1" className="text-3xl font-bold">Email Templates</TitleComponent>
                    <p className="text-slate-500 mt-1">Manage reusable outreach sequences and content blocks.</p>
                </div>
                <Button variant="primary" onClick={() => handleOpenModal()} className="shadow-lg shadow-indigo-100">
                    <i className="fas fa-plus mr-2" />
                    New Template
                </Button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium flex items-center gap-3 animate-in shake">
                    <i className="fas fa-exclamation-circle" />
                    {error}
                    <button onClick={loadTemplates} className="ml-auto text-xs font-bold underline">Retry</button>
                </div>
            )}

            {loading ? (
                <div className="py-20 flex justify-center">
                    <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-lg animate-spin" />
                </div>
            ) : templates.length === 0 ? (
                <div className="bg-white rounded-[24px] border-2 border-dashed border-slate-100 p-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <i className="fas fa-file-invoice text-3xl text-slate-200" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">No Templates Found</h3>
                    <p className="text-slate-500 mt-2 mb-8 max-w-sm mx-auto">Create your first template to start building professional outreach campaigns.</p>
                    <Button variant="outline" onClick={() => handleOpenModal()}>Get Started</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map(t => (
                        <div key={t.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 group">
                            <div className="p-8 flex-grow">
                                <div className="flex justify-between items-start mb-6">
                                    <Badge variant="secondary" className={CAMPAIGN_TYPES.find(ct => ct.id === t.campaignType)?.color + " border-none"}>
                                        {CAMPAIGN_TYPES.find(ct => ct.id === t.campaignType)?.name}
                                    </Badge>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenModal(t)} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center">
                                            <i className="fas fa-edit text-[10px]" />
                                        </button>
                                        <button onClick={() => handleDelete(t.id)} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center">
                                            <i className="fas fa-trash text-[10px]" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-1">{t.name}</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">Subject Template</p>
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed italic border-l-4 border-slate-100 pl-4">"{t.subjectTemplate}"</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">Internal Body Preview</p>
                                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{t.bodyTemplate.replace(/<[^>]*>/g, '')}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50/50 px-8 py-4 flex justify-between items-center border-t border-slate-50">
                                <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase">Placeholder Engine Active</span>
                                <div className="flex -space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                        <i className="fas fa-tag text-[8px] text-indigo-500" />
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                        <i className="fas fa-magic text-[8px] text-emerald-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTemplate ? 'Edit Template' : 'Create New Template'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-8 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input
                            label="Internal Reference Name"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="e.g. Wellness Intro - Standard"
                        />
                        <div className="space-y-2">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Campaign Goal / Type</label>
                            <select
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                                value={formData.campaignType}
                                onChange={e => setFormData({ ...formData, campaignType: e.target.value })}
                            >
                                {CAMPAIGN_TYPES.map(type => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Input
                            label="Email Subject Line Template"
                            value={formData.subjectTemplate}
                            onChange={e => setFormData({ ...formData, subjectTemplate: e.target.value })}
                            required
                            placeholder="e.g. Quick question for {{firstName}} at {{companyName}}"
                            className="bg-slate-50 border-slate-100 font-bold"
                        />

                        <div className="bg-indigo-50 rounded-3xl p-8 space-y-4 border border-indigo-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                                    <i className="fas fa-tags" />
                                </div>
                                <div>
                                    <p className="font-bold text-indigo-900 text-sm">Dynamic Placeholders</p>
                                    <p className="text-xs text-indigo-700 opacity-70">Click to copy placeholder to your clipboard (conceptually)</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    '{{firstName}}', '{{companyName}}', '{{projectName}}',
                                    '{{industry}}', '{{targetAudience}}', '{{mainBenefit}}',
                                    '{{keyFeature1}}', '{{keyFeature2}}', '{{website}}'
                                ].map(p => (
                                    <span key={p} className="px-3 py-1.5 bg-white text-[10px] font-black text-indigo-600 rounded-lg border border-indigo-200 cursor-pointer hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <RichTextEditor
                            label="Email Body Template"
                            value={formData.bodyTemplate}
                            onChange={content => setFormData({ ...formData, bodyTemplate: content })}
                        />
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-[200px]">Ensure all placeholders match the project data fields.</p>
                        <div className="flex gap-4">
                            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)} className="px-10 h-14">Cancel</Button>
                            <Button variant="primary" type="submit" disabled={submitting} className="px-16 h-14 bg-indigo-600 shadow-xl shadow-indigo-100">
                                {submitting ? <><i className="fas fa-spinner fa-spin mr-2" />Saving...</> : (editingTemplate ? 'Update Master' : 'Save Template')}
                            </Button>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default Templates
