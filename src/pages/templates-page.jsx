import React, { useState, useEffect, useRef } from 'react';
import TitleComponent from '../components/titleComponent/titleComponent';
import Badge from '../components/ui/badge/badge';
import Button from '../components/ui/button/button';
import Input from '../components/ui/input/input';
import Modal from '../components/ui/modal/modal';
import RichTextEditor from '../components/ui/richTextEditor/richTextEditor';
import { ALL_TEMPLATES } from '../emails';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '../services/db';
import toast from 'react-hot-toast';

const TemplatesPage = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const hasAttemptedSeed = useRef(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        body: '',
        description: ''
    });

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const data = await getTemplates();

            if (data.length === 0 && !hasAttemptedSeed.current) {
                hasAttemptedSeed.current = true;
                const seededData = await seedInitialPresets();
                setTemplates(seededData);
            } else {
                setTemplates(data);
            }
        } catch (err) {
            console.error('Fetch templates error:', err);
            toast.error('Failed to load templates.');
        } finally {
            setLoading(false);
        }
    };

    const seedInitialPresets = async () => {
        try {
            const results = [];
            for (const preset of ALL_TEMPLATES) {
                const record = await createTemplate({
                    name: preset.name,
                    subject: preset.subject || `About ${preset.name}`,
                    body: preset.body || '<p>Hello {{firstName}},</p><p>I am reaching out regarding...</p>',
                    description: preset.description
                });
                results.push(record);
            }
            return results.sort((a, b) => b.updatedAt - a.updatedAt);
        } catch (err) {
            console.error('Initial seeding error:', err);
            return [];
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleOpenModal = (template = null) => {
        if (template) {
            setEditingTemplate(template);
            setFormData({
                name: template.name,
                subject: template.subject,
                body: template.body,
                description: template.description || ''
            });
        } else {
            setEditingTemplate(null);
            setFormData({
                name: '',
                subject: '',
                body: '',
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim() || !formData.subject.trim() || (!formData.body.trim() || formData.body === '<p><br></p>')) {
            toast.error('Please fill in Name, Subject, and Body.');
            return;
        }

        setIsSaving(true);
        try {
            if (editingTemplate) {
                await updateTemplate(editingTemplate.id, formData);
                toast.success('Template updated successfully!');
            } else {
                await createTemplate(formData);
                toast.success('New template created!');
            }
            const freshData = await getTemplates();
            setTemplates(freshData);
            setIsModalOpen(false);
        } catch (err) {
            console.error('Save template error:', err);
            toast.error('Failed to save template.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return;

        try {
            await deleteTemplate(id);
            toast.success('Template deleted.');
            setTemplates(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error('Delete template error:', err);
            toast.error('Failed to delete template.');
        }
    };

    return (
        <div className="space-y-12 pb-20 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <TitleComponent type="h1" className="text-4xl font-bold bg-gradient-brand bg-clip-text text-transparent">
                        Templates Library
                    </TitleComponent>
                    <p className="text-slate-500 mt-2 font-medium">Manage your outreach scripts. All presets are loaded and fully editable.</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="primary"
                        className="h-14 px-8 bg-primary shadow-premium hover:shadow-xl duration-300"
                        onClick={() => handleOpenModal()}
                    >
                        <i className="fas fa-plus mr-2" />
                        New Template
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                {loading ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                        <div className="size-10 border-4 border-slate-100 border-t-primary rounded-xl animate-spin" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Library...</p>
                    </div>
                ) : templates.length === 0 ? (
                    <div className="p-20 bg-white rounded-[40px] border border-dashed border-white-tint text-center space-y-4 shadow-sm">
                        <div className="size-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-300">
                            <i className="fas fa-inbox text-3xl" />
                        </div>
                        <div className="max-w-sm mx-auto mt-2">
                            <p className="text-xl font-bold text-slate-900">Your Library is Empty</p>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Feel free to create new templates or modify existing ones as needed.
                            </p>
                        </div>
                        <div className="flex justify-center gap-4 pt-4">
                            <Button variant="primary" className="bg-primary" onClick={() => handleOpenModal()}>Create Custom Template</Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map(t => (
                            <div key={t.id} className="group relative bg-white rounded-[32px] border border-slate-100 shadow-premium hover:shadow-2xl hover:-translate-y-1 duration-300 flex flex-col overflow-hidden">
                                <div className="p-8 flex-grow">
                                    <div className="flex justify-between items-start mb-6">
                                        <Badge variant="primary" className="bg-primary/5 text-primary border-none text-[10px] py-1 px-3">
                                            Editable Script
                                        </Badge>
                                        <div className="flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 duration-300">
                                            <button
                                                onClick={() => handleOpenModal(t)}
                                                className="size-10 rounded-xl bg-white text-primary hover:bg-primary hover:text-white duration-200 flex items-center justify-center border border-slate-100 shadow-sm"
                                                title="Edit Template"
                                            >
                                                <i className="fas fa-edit text-xs" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                className="size-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white duration-200 flex items-center justify-center border border-red-100 shadow-sm"
                                                title="Delete Template"
                                            >
                                                <i className="fas fa-trash text-xs" />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary duration-300">{t.name}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 italic leading-relaxed">{t.description || 'No description provided.'}</p>

                                    <div className="mt-6 pt-6 border-t border-slate-50">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Subject</p>
                                        <p className="text-xs font-bold text-slate-700 line-clamp-1">{t.subject}</p>
                                    </div>
                                </div>
                                <div className="px-8 py-4 bg-slate-100/30 flex items-center justify-between border-t border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <div className="size-2 rounded-full bg-primary animate-pulse" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400 italic">
                                        Refreshed {new Date(t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTemplate ? 'Edit Template' : 'New Template'}
                size="xl"
            >
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            id="template-name"
                            label="Template Name"
                            placeholder="e.g., Cold Email - Series A Founders"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <Input
                            id="template-notes"
                            label="Internal Notes"
                            placeholder="Purpose of this template..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Input
                            id="template-subject"
                            label="Default Subject Line"
                            placeholder="e.g. Quick question for {{firstName}}"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        />
                        <p className="text-[10px] text-slate-400 italic px-1">Variables: {'{{firstName}}'}, {'{{lastName}}'}, {'{{companyName}}'}</p>
                    </div>

                    <RichTextEditor
                        label="Content Editor"
                        value={formData.body}
                        onChange={(val) => setFormData({ ...formData, body: val })}
                    />

                    <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancel</Button>
                        <Button
                            variant="primary"
                            className="bg-primary px-10 h-12 shadow-premium"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <><i className="fas fa-spinner fa-spin mr-2" /> Saving...</>
                            ) : (
                                <><i className="fas fa-save mr-2" /> {editingTemplate ? 'Save Changes' : 'Create Template'}</>
                            )}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TemplatesPage;
