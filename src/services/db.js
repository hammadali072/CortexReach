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
import { db, functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';

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
        features: data.features || '',
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
    try {
        const snapshot = await get(ref(db, 'projects'));
        if (!snapshot.exists()) return [];

        const data = snapshot.val();
        return Object.values(data)
            .filter(p => p.userId === userId)
            .sort((a, b) => b.createdAt - a.createdAt);
    } catch (err) {
        console.error('[db] getUserProjects error:', err);
        throw err;
    }
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
    // Phase 1 — Simple deduplication based on email
    const getEmail = (obj) => {
        if (obj.email) return obj.email;
        const key = Object.keys(obj).find(k => k.includes('email') || k.includes('mail'));
        return key ? obj[key] : null;
    };

    const email = getEmail(data);

    if (email) {
        // Fetch existing for this project to ensure we don't duplicate
        const existing = await getProjectLeads(projectId);
        const isDuplicate = existing.some(l => {
            const existingEmail = getEmail(l);
            return existingEmail && existingEmail.toLowerCase() === email.toLowerCase();
        });
        if (isDuplicate) return null; // skip silently
    }

    const leadsRef = ref(db, 'leads');
    const newRef = push(leadsRef);
    const leadId = newRef.key;

    const lead = {
        ...data,
        id: leadId,
        projectId,
        userId,
        status: data.status || 'new',
        lastEmailSentAt: data.lastEmailSentAt || null,
        createdAt: data.createdAt || Date.now(),
    };

    await set(newRef, lead);

    // Phase 6 — increment project totalLeads counter
    await _incrementStat(projectId, 'totalLeads', 1);

    return lead;
};

/**
 * Bulk-insert an array of leads (e.g. from Google Maps import).
 * Each lead goes through the duplicate check individually.
 * a
 * @returns {Promise<{ inserted: number, skipped: number }>}
 */
export const bulkCreateLeads = async (userId, projectId, leads) => {
    let inserted = 0;
    let skipped = 0;

    // Fetch existing once to optimize duplicate checks
    const existingLeads = await getProjectLeads(projectId);
    const getEmail = (obj) => {
        if (obj.email) return obj.email;
        const key = Object.keys(obj).find(k => k.includes('email') || k.includes('mail'));
        return key ? obj[key] : null;
    };

    const existingEmails = new Set(
        existingLeads.map(l => getEmail(l)?.toLowerCase()).filter(Boolean)
    );

    for (const lead of leads) {
        const email = getEmail(lead);
        if (email && existingEmails.has(email.toLowerCase())) {
            skipped++;
            continue;
        }

        // We use createLead but skipping its internal fetch check by ensuring we only pass leads that didn't match emails
        // Ideally we'd bypass the fetch in createLead too for performance
        // For now, calling createLead is safe (won't overwrite because of push())
        const result = await createLead(userId, projectId, lead);
        if (result) {
            inserted++;
            if (email) existingEmails.add(email.toLowerCase());
        } else {
            skipped++;
        }
    }

    return { inserted, skipped };
};

/**
 * Fetch all leads for a project.
 */
export const getProjectLeads = async (projectId) => {
    try {
        const snapshot = await get(ref(db, 'leads'));
        if (!snapshot.exists()) return [];
        const data = snapshot.val();
        return Object.values(data).filter(l => l.projectId === projectId);
    } catch (err) {
        console.error('[db] getProjectLeads error:', err);
        return [];
    }
};

/**
 * Fetch all leads for a user across all projects.
 */
export const getUserLeads = async (userId) => {
    try {
        const snapshot = await get(ref(db, 'leads'));
        if (!snapshot.exists()) return [];
        const data = snapshot.val();
        return Object.values(data).filter(l => l.userId === userId);
    } catch (err) {
        console.error('[db] getUserLeads error:', err);
        return [];
    }
};

/**
 * Update a lead's fields (e.g. status, lastEmailSentAt).
 */
export const updateLead = async (leadId, updates) => {
    await update(ref(db, `leads/${leadId}`), {
        ...updates,
        updatedAt: Date.now()
    });
};

/**
 * Delete a single lead.
 * Decrements project totalLeads counter.
 */
export const deleteLead = async (projectId, leadId) => {
    await set(ref(db, `leads/${leadId}`), null);
    await _incrementStat(projectId, 'totalLeads', -1);
};

/**
 * Delete multiple leads at once.
 */
export const bulkDeleteLeads = async (projectId, leadIds) => {
    const updates = {};
    leadIds.forEach(id => {
        updates[`leads/${id}`] = null;
    });
    await update(ref(db), updates);
    await _incrementStat(projectId, 'totalLeads', -leadIds.length);
};


// ═══════════════════════════════════════════════════════════════════════════
// PHASE 4 — CAMPAIGNS
// Node: campaigns/{campaignId}
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a campaign.
 * Prevents duplicate names within the same project.
 * Validates project ownership.
 *
 * @param {string} userId
 * @param {string} projectId
 * @param {{ name, subject, body, templateId, templateTone }} data
 */
export const createCampaign = async (userId, projectId, data) => {
    // 1. Validate Project Ownership
    const project = await getProject(projectId);
    if (!project || project.userId !== userId) {
        throw new Error('Unauthorized: You do not own this project.');
    }

    // 2. Duplicate name check
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

    const timestamp = Date.now();
    const campaign = {
        id: campaignId,
        userId,
        createdBy: userId,
        projectId,
        campaignName: data.name.trim(),
        name: data.name.trim(), // Keep for compatibility
        subjectLine: data.subjectLine || data.subject || '',
        subject: data.subject || '', // Keep for compatibility
        emailBodyHTML: data.emailBodyHTML || data.body || data.emailContent || '',
        emailContent: data.emailContent || data.body || '', // Keep for compatibility
        body: data.body || '', // Keep for compatibility
        selectedLeadIds: data.selectedLeadIds || [],
        templateId: data.templateId || '',
        templateStyle: data.templateStyle || 'clean_minimal',
        accentColor: data.accentColor || '#4f46e5',
        status: 'draft',
        totalLeads: data.selectedLeadIds ? data.selectedLeadIds.length : 0,
        createdAt: timestamp,
        updatedAt: timestamp,
    };

    await set(newRef, campaign);

    // Increment project totalCampaigns count
    await _incrementStat(projectId, 'totalCampaigns', 1);

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
    try {
        const snapshot = await get(ref(db, 'campaigns'));
        if (!snapshot.exists()) return [];
        const data = snapshot.val();
        return Object.values(data).filter(c => c.userId === userId);
    } catch (err) {
        console.error('[db] getUserCampaigns error:', err);
        return [];
    }
};

/**
 * Fetch a single campaign by ID.
 */
export const getCampaign = async (campaignId) => {
    const snapshot = await get(ref(db, `campaigns/${campaignId}`));
    return snapshot.exists() ? snapshot.val() : null;
};

/**
 * Update campaign fields (e.g. status: 'active').
 * Enforces integrity: Cannot edit if status is not 'draft'.
 */
export const updateCampaign = async (campaignId, updates) => {
    const campaign = await getCampaign(campaignId);
    if (!campaign) throw new Error('Campaign not found.');

    // Status Integrity: draft only
    if (campaign.status !== 'draft' && !updates.status) {
        throw new Error(`Cannot edit campaign content after it has been ${campaign.status}.`);
    }

    await update(ref(db, `campaigns/${campaignId}`), {
        ...updates,
        updatedAt: Date.now(),
    });
};

/**
 * Delete a campaign and all associated data.
 * Enforces integrity: Cannot delete if status is not 'draft'.
 * Validates project ownership.
 */
export const deleteCampaign = async (userId, projectId, campaignId) => {
    // 1. Validate Project Ownership
    const project = await getProject(projectId);
    if (!project || project.userId !== userId) {
        throw new Error('Unauthorized: You do not own this project.');
    }

    const campaign = await getCampaign(campaignId);
    if (!campaign) return;

    // 2. Status Integrity: draft only
    if (campaign.status !== 'draft') {
        throw new Error(`Cannot delete a campaign that has already been ${campaign.status}.`);
    }

    // 1. Remove related email_sends (if any exist for draft - unlikely but for integrity)
    const sends = await getCampaignSends(campaignId);
    if (sends.length > 0) {
        for (const send of sends) {
            await set(ref(db, `email_sends/${send.id}`), null);
        }
    }

    // 2. Remove audience mapping
    await set(ref(db, `campaign_audience/${campaignId}`), null);

    // 3. Remove campaign record
    await set(ref(db, `campaigns/${campaignId}`), null);

    // 4. Update project stats
    await _incrementStat(projectId, 'totalCampaigns', -1);
};


// ═══════════════════════════════════════════════════════════════════════════
// PHASE 2.5 — CAMPAIGN AUDIENCE MAPPING (PHASE 2)
// Node: campaign_audience/{campaignId}/{leadId}: true
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Replace/Set the audience mapping for a campaign.
 * Validates that each lead belongs to the specified project.
 * 
 * @param {string} projectId 
 * @param {string} campaignId 
 * @param {Array<string>} leadIds 
 */
export const setCampaignAudience = async (projectId, campaignId, leadIds) => {
    // 1. Fetch project leads to validate ownership
    const projectLeads = await getProjectLeads(projectId);
    const validLeadIds = new Set(projectLeads.map(l => l.id));

    // 2. Filter leadIds to ensure they belong to this project
    const filteredIds = leadIds.filter(id => validLeadIds.has(id));

    // 3. Prepare audience object { leadId: true }
    const audienceMap = {};
    filteredIds.forEach(id => {
        audienceMap[id] = true;
    });

    // 4. Update database
    await set(ref(db, `campaign_audience/${campaignId}`), audienceMap);

    // 5. Update campaign totalLeads count
    await updateCampaign(campaignId, { totalLeads: filteredIds.length });

    return filteredIds.length;
};

/**
 * Get count of leads in a campaign audience.
 */
export const getCampaignAudienceCount = async (campaignId) => {
    const snapshot = await get(ref(db, `campaign_audience/${campaignId}`));
    if (!snapshot.exists()) return 0;
    return Object.keys(snapshot.val()).length;
};

/**
 * Get all lead IDs for a campaign.
 */
export const getCampaignAudienceIds = async (campaignId) => {
    const snapshot = await get(ref(db, `campaign_audience/${campaignId}`));
    if (!snapshot.exists()) return [];
    return Object.keys(snapshot.val());
};


// ═══════════════════════════════════════════════════════════════════════════
// PHASE 8 — TEMPLATES (CRUD)
// Node: templates/{templateId}
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a new email template.
 */
export const createTemplate = async (userId, data) => {
    const templatesRef = ref(db, 'templates');
    const newRef = push(templatesRef);
    const templateId = newRef.key;

    const template = {
        id: templateId,
        userId,
        name: data.name.trim(),
        campaignType: data.campaignType, // brand_introduction, product_pitch, etc.
        subjectTemplate: data.subjectTemplate.trim(),
        bodyTemplate: data.bodyTemplate.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    await set(newRef, template);
    return template;
};


/**
 * Fetch all templates for a user.
 */
export const getUserTemplates = async (userId) => {
    try {
        const snapshot = await get(ref(db, 'templates'));
        if (!snapshot.exists()) return [];

        const data = snapshot.val();
        // Client-side filtering to avoid index requirements in dev
        return Object.values(data)
            .filter(t => t.userId === userId)
            .sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
        console.error('[db] getUserTemplates error:', err);
        throw err;
    }
};

/**
 * Fetch a single template by ID.
 */
export const getTemplate = async (templateId) => {
    const snapshot = await get(ref(db, `templates/${templateId}`));
    return snapshot.exists() ? snapshot.val() : null;
};

/**
 * Update a template.
 */
export const updateTemplate = async (templateId, updates) => {
    const templateRef = ref(db, `templates/${templateId}`);
    const data = {
        ...updates,
        updatedAt: Date.now()
    };
    await update(templateRef, data);
};

/**
 * Delete a template.
 */
export const deleteTemplate = async (templateId) => {
    await set(ref(db, `templates/${templateId}`), null);
};

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 3 — EMAIL SENDS TRACKING
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
 * Execute a campaign: Create email_sends for each lead, update lead statuses,
 * and mark campaign as 'sent'.
 * 
 * @param {string} campaignId 
 */
// launchCampaignExecution removed (deprecated SendGrid)


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
        : { totalLeads: 0, totalCampaigns: 0, totalSent: 0, totalOpened: 0, totalReplied: 0 };
};
