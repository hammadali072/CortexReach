// src/services/db.js
// ─────────────────────────────────────────────────────────────────────────────
// CortexReach — Firebase Realtime Database Service Layer
// All phases (2–6) implemented here. Every function is async/await.
// Schema is kept FLAT with references via IDs only.
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

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 2 — PROJECTS
// Node: projects/{projectId}
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a new project for the authenticated user.
 * Uses push() for a server-generated unique ID.
 * Prevents duplicate names (client-side check within same user).
 *
 * @param {string} userId
 * @param {{ name, description, industry, targetAudience, type, status }} data
 * @returns {Promise<{ id: string, ...projectData }>}
 */
export const createProject = async (userId, data) => {
    // Duplicate name check
    const existing = await getUserProjects(userId);
    const isDuplicate = existing.some(
        p => p.name.trim().toLowerCase() === data.name.trim().toLowerCase()
    );
    if (isDuplicate) {
        throw new Error(`A project named "${data.name}" already exists.`);
    }

    const projectsRef = ref(db, 'projects');
    const newRef = push(projectsRef);
    const projectId = newRef.key;

    const project = {
        id: projectId,
        userId,
        name: data.name.trim(),
        description: data.description || '',
        industry: data.industry || '',
        targetAudience: data.targetAudience || '',
        type: data.type || 'Product',
        status: data.status || 'active',
        createdAt: Date.now(),
        // Phase 6 stats node (initialised at creation)
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

/**
 * Fetch all projects belonging to a user.
 * Queries by userId index.
 *
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export const getUserProjects = async (userId) => {
    const q = query(
        ref(db, 'projects'),
        orderByChild('userId'),
        equalTo(userId)
    );
    const snapshot = await get(q);
    if (!snapshot.exists()) return [];
    return Object.values(snapshot.val());
};

/**
 * Fetch a single project by ID.
 */
export const getProject = async (projectId) => {
    const snapshot = await get(ref(db, `projects/${projectId}`));
    return snapshot.exists() ? snapshot.val() : null;
};

/**
 * Update mutable project fields.
 */
export const updateProject = async (projectId, updates) => {
    await update(ref(db, `projects/${projectId}`), updates);
};

/**
 * Delete a project record.
 */
export const deleteProject = async (projectId) => {
    await set(ref(db, `projects/${projectId}`), null);
};


// ═══════════════════════════════════════════════════════════════════════════
// PHASE 3 — LEADS
// Node: leads/{leadId}
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Insert a single lead.
 * Skips insertion if the same email already exists for this project.
 *
 * @param {string} userId
 * @param {string} projectId
 * @param {{ name, email, phone, website, source, relevanceScore }} data
 * @returns {Promise<object|null>} — lead object, or null if skipped
 */
export const createLead = async (userId, projectId, data) => {
    // Duplicate email check within same project
    if (data.email) {
        const existing = await getProjectLeads(projectId);
        const isDuplicate = existing.some(
            l => l.email && l.email.toLowerCase() === data.email.toLowerCase()
        );
        if (isDuplicate) return null; // skip silently
    }

    const leadsRef = ref(db, 'leads');
    const newRef = push(leadsRef);
    const leadId = newRef.key;

    const lead = {
        id: leadId,
        projectId,
        userId,
        name: data.name || 'Unknown',
        email: data.email || null,
        phone: data.phone || null,
        website: data.website || null,
        source: data.source || 'manual',          // google_maps | manual | ai
        relevanceScore: data.relevanceScore || 0,
        status: 'new',
        lastEmailSentAt: null,
        createdAt: Date.now(),
    };

    await set(newRef, lead);

    // Phase 6 — increment project totalLeads counter
    await _incrementStat(projectId, 'totalLeads', 1);

    return lead;
};

/**
 * Bulk-insert an array of leads (e.g. from Google Maps import).
 * Each lead goes through the duplicate check individually.
 *
 * @returns {Promise<{ inserted: number, skipped: number }>}
 */
export const bulkCreateLeads = async (userId, projectId, leads) => {
    let inserted = 0;
    let skipped = 0;

    for (const lead of leads) {
        const result = await createLead(userId, projectId, lead);
        if (result) inserted++;
        else skipped++;
    }

    return { inserted, skipped };
};

/**
 * Fetch all leads for a project.
 */
export const getProjectLeads = async (projectId) => {
    const q = query(
        ref(db, 'leads'),
        orderByChild('projectId'),
        equalTo(projectId)
    );
    const snapshot = await get(q);
    if (!snapshot.exists()) return [];
    return Object.values(snapshot.val());
};

/**
 * Fetch all leads for a user across all projects.
 */
export const getUserLeads = async (userId) => {
    const q = query(
        ref(db, 'leads'),
        orderByChild('userId'),
        equalTo(userId)
    );
    const snapshot = await get(q);
    if (!snapshot.exists()) return [];
    return Object.values(snapshot.val());
};

/**
 * Update a lead's fields (e.g. status, lastEmailSentAt).
 */
export const updateLead = async (leadId, updates) => {
    await update(ref(db, `leads/${leadId}`), updates);
};


// ═══════════════════════════════════════════════════════════════════════════
// PHASE 4 — CAMPAIGNS
// Node: campaigns/{campaignId}
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a campaign.
 * Prevents duplicate names within the same project.
 *
 * @param {string} userId
 * @param {string} projectId
 * @param {{ name, templateId, type }} data
 */
export const createCampaign = async (userId, projectId, data) => {
    // Duplicate name check
    const existing = await getProjectCampaigns(projectId);
    const isDuplicate = existing.some(
        c => c.name.trim().toLowerCase() === data.name.trim().toLowerCase()
    );
    if (isDuplicate) {
        throw new Error(`A campaign named "${data.name}" already exists in this project.`);
    }

    const campaignsRef = ref(db, 'campaigns');
    const newRef = push(campaignsRef);
    const campaignId = newRef.key;

    const campaign = {
        id: campaignId,
        projectId,
        userId,
        name: data.name.trim(),
        templateId: data.templateId || null,
        type: data.type || 'initial',             // 'initial' | 'followup'
        status: 'draft',
        createdAt: Date.now(),
    };

    await set(newRef, campaign);
    return campaign;
};

/**
 * Fetch all campaigns for a project.
 */
export const getProjectCampaigns = async (projectId) => {
    const q = query(
        ref(db, 'campaigns'),
        orderByChild('projectId'),
        equalTo(projectId)
    );
    const snapshot = await get(q);
    if (!snapshot.exists()) return [];
    return Object.values(snapshot.val());
};

/**
 * Fetch all campaigns for a user.
 */
export const getUserCampaigns = async (userId) => {
    const q = query(
        ref(db, 'campaigns'),
        orderByChild('userId'),
        equalTo(userId)
    );
    const snapshot = await get(q);
    if (!snapshot.exists()) return [];
    return Object.values(snapshot.val());
};

/**
 * Update campaign fields (e.g. status: 'active').
 */
export const updateCampaign = async (campaignId, updates) => {
    await update(ref(db, `campaigns/${campaignId}`), updates);
};


// ═══════════════════════════════════════════════════════════════════════════
// PHASE 5 — EMAIL SENDS TRACKING
// Node: email_sends/{sendId}
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Record an email send event.
 * Also updates the lead's status and lastEmailSentAt.
 * Also increments project totalSent counter (Phase 6).
 *
 * @param {{ campaignId, projectId, leadId, subject, body }} data
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
        deliveryStatus: 'sent',
        opened: false,
        replied: false,
        openCount: 0,
    };

    await set(newRef, record);

    // Update lead
    await updateLead(data.leadId, {
        status: 'email_sent',
        lastEmailSentAt: sentAt,
    });

    // Phase 6 — increment totalSent
    await _incrementStat(data.projectId, 'totalSent', 1);

    return record;
};

/**
 * Mark an email as opened.
 * Increments openCount; if first open, sets opened = true.
 * Updates lead status to 'opened'.
 * Increments project totalOpened (Phase 6).
 */
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

/**
 * Mark an email as replied.
 * Updates lead status and project totalReplied (Phase 6).
 */
export const recordEmailReply = async (sendId, leadId, projectId) => {
    await update(ref(db, `email_sends/${sendId}`), { replied: true });
    await updateLead(leadId, { status: 'replied' });
    await _incrementStat(projectId, 'totalReplied', 1);
};

/**
 * Fetch all sends for a campaign.
 */
export const getCampaignSends = async (campaignId) => {
    const q = query(
        ref(db, 'email_sends'),
        orderByChild('campaignId'),
        equalTo(campaignId)
    );
    const snapshot = await get(q);
    if (!snapshot.exists()) return [];
    return Object.values(snapshot.val());
};

/**
 * Fetch all sends for a project.
 */
export const getProjectSends = async (projectId) => {
    const q = query(
        ref(db, 'email_sends'),
        orderByChild('projectId'),
        equalTo(projectId)
    );
    const snapshot = await get(q);
    if (!snapshot.exists()) return [];
    return Object.values(snapshot.val());
};


// ═══════════════════════════════════════════════════════════════════════════
// PHASE 6 — STATS (internal helper)
// Node: projects/{projectId}/stats/{field}
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Increment a single counter inside projects/{projectId}/stats.
 * Read → increment → write (safe for low-concurrency prototype).
 *
 * @param {string} projectId
 * @param {string} field    — totalLeads | totalSent | totalOpened | totalReplied
 * @param {number} delta    — amount to add (default 1)
 */
const _incrementStat = async (projectId, field, delta = 1) => {
    try {
        const statRef = ref(db, `projects/${projectId}/stats/${field}`);
        const snapshot = await get(statRef);
        const current = snapshot.exists() ? (snapshot.val() || 0) : 0;
        await set(statRef, current + delta);
    } catch (err) {
        // Non-critical — log but don't throw
        console.warn(`[db] Failed to increment stat ${field}:`, err);
    }
};

/**
 * Fetch the stats object for a project.
 */
export const getProjectStats = async (projectId) => {
    const snapshot = await get(ref(db, `projects/${projectId}/stats`));
    return snapshot.exists()
        ? snapshot.val()
        : { totalLeads: 0, totalSent: 0, totalOpened: 0, totalReplied: 0 };
};
