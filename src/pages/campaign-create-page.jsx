import { useReducer, useEffect, useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

import StepIndicator from '../components/campaigns/create/StepIndicator';
import ProjectStep from '../components/campaigns/create/ProjectStep';
import CampaignTypeStep from '../components/campaigns/create/CampaignTypeStep';
import TemplateStep from '../components/campaigns/create/TemplateStep';
import GenerationStep from '../components/campaigns/create/GenerationStep';
import EditStep from '../components/campaigns/create/EditStep';
import AudienceStep from '../components/campaigns/create/AudienceStep';
import ReviewStep from '../components/campaigns/create/ReviewStep';
import PreviewModal from '../components/campaigns/create/PreviewModal';
import CreateHeader from '../components/campaigns/create/CreateHeader';
import CreateNavigation from '../components/campaigns/create/CreateNavigation';

import { ACTIONS, INITIAL_STATE, campaignReducer } from '../components/campaigns/create/state';
import { replaceProjectPlaceholders } from '../components/campaigns/create/utils';
import {
    getUserProjects,
    getProjectLeads,
    createCampaign,
    setCampaignAudience,
    getProject
} from '../services/db';
import { renderCampaignEmail } from '../emails/renderEmails';
import { hasEmailTemplate } from '../emails';
import { launchCampaign } from '../services/emailService';

const CampaignCreatePage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlProjectId = searchParams.get('projectId');
    const { currentUser } = useAuth();

    const [state, dispatch] = useReducer(campaignReducer, INITIAL_STATE);
    const { currentStep, formData, dbProjects, dbLeads, loading, errors } = state;

    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [aiPrefs, setAiPrefs] = useState(null);

    useEffect(() => {
        const savedAi = localStorage.getItem('cortex_ai_prefs');
        if (savedAi) setAiPrefs(JSON.parse(savedAi));
    }, []);

    const updateForm = (updates) => dispatch({ type: ACTIONS.UPDATE_FORM, payload: updates });

    const handleProjectChange = useCallback(async (projectId) => {
        updateForm({ project: projectId, selectedRows: [] });
        if (!projectId) {
            dispatch({ type: ACTIONS.SET_LEADS, payload: [] });
            dispatch({ type: ACTIONS.UPDATE_FORM, payload: { selectedProject: null } });
            return;
        }
        try {
            dispatch({ type: ACTIONS.SET_LOADING, payload: { leads: true } });
            const [projectData, leads] = await Promise.all([getProject(projectId), getProjectLeads(projectId)]);
            dispatch({ type: ACTIONS.SET_LEADS, payload: leads });
            dispatch({ type: ACTIONS.UPDATE_FORM, payload: { selectedProject: projectData } });
        } catch (err) {
            console.error('[CampaignCreate] load info error:', err);
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: { leads: false } });
        }
    }, []);

    useEffect(() => {
        if (!currentUser) return;
        const loadProjects = async () => {
            try {
                dispatch({ type: ACTIONS.SET_LOADING, payload: { projects: true } });
                const projects = await getUserProjects(currentUser.uid);
                const sorted = projects.sort((a, b) => b.createdAt - a.createdAt);
                dispatch({ type: ACTIONS.SET_PROJECTS, payload: sorted });

                if (urlProjectId) {
                    handleProjectChange(urlProjectId);
                } else if (sorted.length === 1) {
                    handleProjectChange(sorted[0].id);
                }
            } catch (err) {
                console.error('[CampaignCreate] project load error:', err);
                dispatch({ type: ACTIONS.SET_ERROR, payload: { projects: 'Failed to fetch projects.' } });
            } finally {
                dispatch({ type: ACTIONS.SET_LOADING, payload: { projects: false } });
            }
        };
        loadProjects();
    }, [currentUser, urlProjectId, handleProjectChange]);

    const handleGenerateEmail = async () => {
        const project = formData.selectedProject;
        if (!project || !formData.campaignType) return;
        try {
            dispatch({ type: ACTIONS.SET_LOADING, payload: { submitting: true } });
            if (!hasEmailTemplate(formData.campaignType)) throw new Error('Template not found');

            const placeholders = { firstName: '{{firstName}}', lastName: '{{lastName}}', company_name: '{{companyName}}' };
            const subject = replaceProjectPlaceholders('Quick question for {{firstName}} at {{companyName}}', project);
            const html = await renderCampaignEmail(
                formData.campaignType,
                { ...project, description: aiPrefs?.companyDescription || project.description, name: aiPrefs?.companyName || project.name },
                placeholders, null, formData.templateStyle, formData.accentColor
            );

            updateForm({ subject, emailContent: html, templateId: `react_${formData.campaignType}` });
            dispatch({ type: ACTIONS.SET_STEP, payload: 5 });
            toast.success('Generated optimized layout!');
        } catch (err) {
            console.error('[CampaignCreate] generation error:', err);
            toast.error('Failed to render email template.');
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: { submitting: false } });
        }
    };

    const handleApplyStyle = async () => {
        const project = formData.selectedProject;
        if (!project || !formData.campaignType) return;
        try {
            dispatch({ type: ACTIONS.SET_LOADING, payload: { submitting: true } });
            const placeholders = { firstName: '{{firstName}}', lastName: '{{lastName}}', company_name: '{{companyName}}' };
            const html = await renderCampaignEmail(
                formData.campaignType,
                { ...project, description: aiPrefs?.companyDescription || project.description, name: aiPrefs?.companyName || project.name },
                placeholders, null, formData.templateStyle, formData.accentColor
            );
            updateForm({ emailContent: html });
            toast.success('Style applied!');
        } catch (err) {
            console.error('[CampaignCreate] apply style error:', err);
            toast.error('Failed to apply style.');
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: { submitting: false } });
        }
    };

    const handleNext = () => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: { submit: '' } });
        if (currentStep === 1 && !formData.project) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: { submit: 'Please select a project.' } });
            return;
        }
        if (currentStep === 2) {
            if (!formData.campaignType) {
                dispatch({ type: ACTIONS.SET_ERROR, payload: { submit: 'Please select a campaign type.' } });
                return;
            }
            if (!formData.name.trim()) {
                dispatch({ type: ACTIONS.SET_ERROR, payload: { submit: 'Please provide a campaign name.' } });
                return;
            }
        }
        if (currentStep === 5 && (!formData.subject.trim() || !formData.emailContent.trim() || formData.emailContent === '<p></p>')) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: { submit: 'Subject and content are required.' } });
            return;
        }
        if (currentStep === 6 && formData.selectedRows.length === 0) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: { submit: 'Please select at least one lead.' } });
            return;
        }
        if (currentStep < 7) dispatch({ type: ACTIONS.NEXT_STEP });
    };

    const handleSaveDraft = async () => {
        if (!currentUser) return;
        dispatch({ type: ACTIONS.SET_LOADING, payload: { submitting: true } });
        try {
            const leadIds = formData.selectedRows.map(row => row.id);
            const campaign = await createCampaign(currentUser.uid, formData.project, {
                campaignName: formData.name, name: formData.name, templateId: formData.templateId,
                subjectLine: formData.subject, subject: formData.subject, emailBodyHTML: formData.emailContent,
                emailContent: formData.emailContent, body: formData.emailContent, selectedLeadIds: leadIds,
                templateStyle: formData.templateStyle, accentColor: formData.accentColor, createdAt: Date.now(), status: 'draft'
            });
            await setCampaignAudience(formData.project, campaign.id, leadIds);
            toast.success('Campaign saved as draft.');
            navigate(`/dashboard/campaigns/${campaign.id}`);
        } catch (err) {
            toast.error('Failed to save campaign.');
            dispatch({ type: ACTIONS.SET_ERROR, payload: { submit: err.message || 'Failed to save.' } });
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: { submitting: false } });
        }
    };

    const handleLaunchCampaign = async () => {
        if (!currentUser || formData.selectedRows.length === 0) return;
        dispatch({ type: ACTIONS.SET_LOADING, payload: { launching: true } });
        try {
            const leadIds = formData.selectedRows.map(row => row.id);
            const campaignData = {
                campaignName: formData.name, name: formData.name, campaignType: formData.campaignType,
                templateId: formData.templateId, subjectLine: formData.subject, subject: formData.subject,
                emailBodyHTML: formData.emailContent, emailContent: formData.emailContent, body: formData.emailContent,
                selectedLeadIds: leadIds, templateStyle: formData.templateStyle, accentColor: formData.accentColor,
                createdAt: Date.now(), status: 'draft'
            };
            const campaign = await createCampaign(currentUser.uid, formData.project, campaignData);
            await setCampaignAudience(formData.project, campaign.id, leadIds);
            const result = await launchCampaign(campaign.id);
            toast.success(`🚀 Sent to ${result.totalSent} leads!`);
            navigate(`/dashboard/campaigns/${campaign.id}`);
        } catch (err) {
            console.error('[CampaignCreate] launch error:', err);
            toast.error(err.message || 'Launch failed.');
            dispatch({ type: ACTIONS.SET_ERROR, payload: { submit: err.message || 'Launch failed.' } });
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: { launching: false } });
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <CreateHeader />
            <StepIndicator currentStep={currentStep} />

            <div className="bg-white rounded-3xl shadow-premium border border-slate-100 min-h-[500px] overflow-hidden flex flex-col">
                <div className="p-10 flex-grow">
                    {currentStep === 1 && (
                        <ProjectStep 
                            dbProjects={dbProjects} loading={loading.projects} error={errors.projects}
                            selectedProjectId={formData.project} onProjectChange={handleProjectChange}
                        />
                    )}
                    {currentStep === 2 && <CampaignTypeStep campaignName={formData.name} campaignType={formData.campaignType} onUpdate={updateForm} />}
                    {currentStep === 3 && <TemplateStep campaignType={formData.campaignType} />}
                    {currentStep === 4 && <GenerationStep onGenerate={handleGenerateEmail} />}
                    {currentStep === 5 && (
                        <EditStep 
                            formData={formData} onUpdate={updateForm} onApplyStyle={handleApplyStyle}
                            onPreview={() => setShowPreviewModal(true)} submitting={loading.submitting}
                        />
                    )}
                    {currentStep === 6 && (
                        <AudienceStep 
                            projectName={formData.selectedProject?.name} leads={dbLeads} 
                            selectedRows={formData.selectedRows} onSelectionChange={({ selectedRows }) => updateForm({ selectedRows })}
                        />
                    )}
                    {currentStep === 7 && (
                        <ReviewStep 
                            formData={formData} projectName={formData.selectedProject?.name}
                            selectedLeadsCount={formData.selectedRows.length}
                        />
                    )}
                </div>

                <CreateNavigation 
                    currentStep={currentStep} loading={loading} handlePrevious={() => dispatch({ type: ACTIONS.PREV_STEP })}
                    handleNext={handleNext} handleSaveDraft={handleSaveDraft} handleLaunchCampaign={handleLaunchCampaign}
                />
            </div>

            <PreviewModal isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)} formData={formData} />

            {errors.submit && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium text-sm flex items-center gap-2 animate-in shake">
                    <i className="fas fa-exclamation-circle" /> {errors.submit}
                </div>
            )}
        </div>
    );
};

export default CampaignCreatePage



