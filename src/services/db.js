// src/services/db.js
// ─────────────────────────────────────────────────────────────────────────────
// CortexReach — Firebase Realtime Database Service Layer
// ─────────────────────────────────────────────────────────────────────────────

import {
    ref,
    get,
    set,
    push,
    update,
    query,
    orderByChild,
    equalTo,
} from 'firebase/database';
import { db } from '../firebase';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PROJECT OPERATIONS
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const createProject = async (userId, data) => {
    const projectsRef = ref(db, 'projects');
    const newRef = push(projectsRef);
    const projectId = newRef.key;

    const project = {
        id: projectId,
        userId,
        name: data.name.trim(),
        description: data.description || '',
        features: data.features || '',
        targetAudience: data.targetAudience || '',
        type: data.type || 'Product',
        status: data.status || 'active',
        createdAt: Date.now(),
        stats: {
            totalLeads: 0,
            totalSent: 0,
            totalOpened: 0,
            totalReplied: 0,
        },
    };

    await set(newRef, project);
    return project;
};

export const getUserProjects = async (userId) => {
    const snapshot = await get(ref(db, 'projects'));
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.values(data)
        .filter(p => p.userId === userId)
        .sort((a, b) => b.createdAt - a.createdAt);
};

export const getProject = async (projectId) => {
    const snapshot = await get(ref(db, `projects/${projectId}`));
    return snapshot.exists() ? snapshot.val() : null;
};

export const updateProject = async (projectId, updates) => {
    await update(ref(db, `projects/${projectId}`), updates);
};

export const deleteProject = async (projectId) => {
    await set(ref(db, `projects/${projectId}`), null);
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * LEAD OPERATIONS
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const createLead = async (userId, projectId, data) => {
    const leadsRef = ref(db, 'leads');
    const newRef = push(leadsRef);
    const leadId = newRef.key;

    const lead = {
        ...data,
        id: leadId,
        projectId,
        userId,
        status: data.status || 'new',
        createdAt: Date.now(),
    };

    await set(newRef, lead);
    await _incrementStat(projectId, 'totalLeads', 1);
    return lead;
};

export const bulkCreateLeads = async (userId, projectId, leads) => {
    let inserted = 0;
    for (const leadData of leads) {
        await createLead(userId, projectId, leadData);
        inserted++;
    }
    return { inserted };
};

export const getProjectLeads = async (projectId) => {
    const snapshot = await get(ref(db, 'leads'));
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.values(data).filter(l => l.projectId === projectId);
};

export const getUserLeads = async (userId) => {
    const snapshot = await get(ref(db, 'leads'));
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.values(data).filter(l => l.userId === userId);
};

export const updateLead = async (leadId, updates) => {
    await update(ref(db, `leads/${leadId}`), {
        ...updates,
        updatedAt: Date.now()
    });
};

export const deleteLead = async (projectId, leadId) => {
    await set(ref(db, `leads/${leadId}`), null);
    await _incrementStat(projectId, 'totalLeads', -1);
};

export const bulkDeleteLeads = async (projectId, leadIds) => {
    for (const leadId of leadIds) {
        await deleteLead(projectId, leadId);
    }
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CAMPAIGN OPERATIONS
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const createCampaign = async (userId, projectId, data) => {
    const campaignsRef = ref(db, 'campaigns');
    const newRef = push(campaignsRef);
    const campaignId = newRef.key;

    const campaign = {
        id: campaignId,
        userId,
        projectId,
        name: data.name.trim(),
        subject: data.subject || '',
        body: data.body || '',
        templateStyle: data.templateStyle || 'clean_minimal',
        accentColor: data.accentColor || '#4f46e5',
        status: 'draft',
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    await set(newRef, campaign);
    await _incrementStat(projectId, 'totalCampaigns', 1);
    return campaign;
};

export const getProjectCampaigns = async (projectId) => {
    const q = query(ref(db, 'campaigns'), orderByChild('projectId'), equalTo(projectId));
    const snapshot = await get(q);
    if (!snapshot.exists()) return [];
    return Object.values(snapshot.val());
};

export const getUserCampaigns = async (userId) => {
    const snapshot = await get(ref(db, 'campaigns'));
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.values(data).filter(c => c.userId === userId);
};

export const getCampaign = async (campaignId) => {
    const snapshot = await get(ref(db, `campaigns/${campaignId}`));
    return snapshot.exists() ? snapshot.val() : null;
};

export const updateCampaign = async (campaignId, updates) => {
    await update(ref(db, `campaigns/${campaignId}`), {
        ...updates,
        updatedAt: Date.now()
    });
};

export const deleteCampaign = async (projectId, campaignId) => {
    await set(ref(db, `campaigns/${campaignId}`), null);
    await _incrementStat(projectId, 'totalCampaigns', -1);
};

export const setCampaignAudience = async (projectId, campaignId, leadIds) => {
    await set(ref(db, `campaign_audiences/${campaignId}`), leadIds);
};

export const getCampaignAudienceIds = async (campaignId) => {
    const snapshot = await get(ref(db, `campaign_audiences/${campaignId}`));
    return snapshot.exists() ? snapshot.val() : [];
};

export const getCampaignAudienceCount = async (campaignId) => {
    const ids = await getCampaignAudienceIds(campaignId);
    return ids.length;
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ANALYTICS & TRACKING
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const recordEmailSend = async (data) => {
    const sendsRef = ref(db, 'email_sends');
    const newRef = push(sendsRef);
    const sendId = newRef.key;
    const sentAt = Date.now();

    const record = {
        id: sendId,
        campaignId: data.campaignId,
        projectId: data.projectId,
        leadId: data.leadId,
        subject: data.subject,
        body: data.body,
        sentAt,
        opened: false,
        replied: false,
        openCount: 0,
    };

    await set(newRef, record);
    await updateLead(data.leadId, { status: 'email_sent', lastEmailSentAt: sentAt });
    await _incrementStat(data.projectId, 'totalSent', 1);
    return record;
};

export const recordEmailOpen = async (sendId, leadId, projectId) => {
    const sendRef = ref(db, `email_sends/${sendId}`);
    const snapshot = await get(sendRef);
    if (!snapshot.exists()) return;

    const current = snapshot.val();
    const isFirstOpen = !current.opened;

    await update(sendRef, {
        opened: true,
        openCount: (current.openCount || 0) + 1,
    });

    if (isFirstOpen) {
        await updateLead(leadId, { status: 'opened' });
        await _incrementStat(projectId, 'totalOpened', 1);
    }
};

export const recordEmailReply = async (sendId, leadId, projectId) => {
    await update(ref(db, `email_sends/${sendId}`), { replied: true });
    await updateLead(leadId, { status: 'replied' });
    await _incrementStat(projectId, 'totalReplied', 1);
};

export const getCampaignSends = async (campaignId) => {
    const q = query(ref(db, 'email_sends'), orderByChild('campaignId'), equalTo(campaignId));
    const snapshot = await get(q);
    if (!snapshot.exists()) return [];
    return Object.values(snapshot.val());
};

const _incrementStat = async (projectId, field, delta = 1) => {
    try {
        const statRef = ref(db, `projects/${projectId}/stats/${field}`);
        const snapshot = await get(statRef);
        const current = snapshot.exists() ? (snapshot.val() || 0) : 0;
        await set(statRef, current + delta);
    } catch (err) {
        console.warn(`[db] Failed to increment stat ${field}:`, err);
    }
};

export const getProjectStats = async (projectId) => {
    const snapshot = await get(ref(db, `projects/${projectId}/stats`));
    return snapshot.exists() ? snapshot.val() : { totalLeads: 0, totalCampaigns: 0, totalSent: 0, totalOpened: 0, totalReplied: 0 };
};

export const getCampaignSendsStats = async (campaignId) => {
    const sends = await getCampaignSends(campaignId);
    return sends.reduce((acc, send) => {
        acc.total++;
        if (send.opened) acc.opened++;
        if (send.replied) acc.replied++;
        return acc;
    }, { total: 0, opened: 0, replied: 0 });
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TEMPLATE CRUD OPERATIONS
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const createTemplate = async (templateData) => {
    const templatesRef = ref(db, 'user_templates');
    const newTemplateRef = push(templatesRef);
    const id = newTemplateRef.key;
    
    const record = {
        id,
        name: templateData.name || 'Untitled Template',
        subject: templateData.subject || '',
        body: templateData.body || '',
        description: templateData.description || '',
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    
    await set(newTemplateRef, record);
    return record;
};

export const getTemplates = async () => {
    const templatesRef = ref(db, 'user_templates');
    const snapshot = await get(templatesRef);
    if (!snapshot.exists()) return [];
    
    return Object.values(snapshot.val()).sort((a, b) => b.updatedAt - a.updatedAt);
};

export const updateTemplate = async (id, updates) => {
    const templateRef = ref(db, `user_templates/${id}`);
    const finalUpdates = {
        ...updates,
        updatedAt: Date.now()
    };
    await update(templateRef, finalUpdates);
    return { id, ...finalUpdates };
};

export const deleteTemplate = async (id) => {
    const templateRef = ref(db, `user_templates/${id}`);
    await set(templateRef, null); // Using set(ref, null) for deletion as requested
    return { id };
};
