import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import TitleComponent from '../components/titleComponent/titleComponent';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import {
    ArrowLeft, Send, Pencil, Loader2, RefreshCw, Reply,
    Users, Target, Database, Terminal, AlertTriangle,
    ExternalLink, Mail, User, Building2, Clock, Inbox,
    FileText, Code
} from 'lucide-react';
import { launchCampaign, fetchResendEmails, fetchResendEmail, syncCampaignStatus } from '../services/emailService';
import {
    getCampaign,
    getCampaignAudienceCount,
    getCampaignSendsStats,
    getCampaignSends,
    getProjectLeads
} from '../services/db';
import { useAuth } from '../context/AuthContext';
import { useFollowUp } from '../hooks/useFollowUp';
import CampaignProgressCard from '../components/ui/CampaignProgressCard';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import RichTextEditor from '../components/ui/RichTextEditor';
import DataTable from 'react-data-table-component';
import toast from 'react-hot-toast';

const customStyles = {
    headRow: {
        style: {
            backgroundColor: '#f5f6fc',
            borderBottomColor: '#e2e5f5',
        },
    },
    headCells: {
        style: {
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#6b7280',
            fontWeight: 500,
            paddingLeft: '16px',
            paddingRight: '16px',
        },
    },
    cells: {
        style: {
            paddingLeft: '16px',
            paddingRight: '16px',
            color: '#1a1d3a',
            fontSize: '14px',
            fontWeight: 400,
        },
    },
    rows: {
        style: {
            minHeight: '56px',
            borderBottomColor: '#f0f2fb',
            '&:hover': {
                backgroundColor: '#f5f6fc',
            },
        },
    },
};

const CampaignDetail = () => {
    const { id } = useParams();
    const { currentUser } = useAuth();

    const [campaign, setCampaign] = useState(null);
    const [stats, setStats] = useState({
        totalLeads: 0,
        sent: 0,
        delivered: 0,
        opened: 0,
        replied: 0,
        bounced: 0,
        followUpSent: 0
    });
    
    // Audience data state
    const [audienceSends, setAudienceSends] = useState([]);
    const [projectLeadsMap, setProjectLeadsMap] = useState({});
    const [resendEmails, setResendEmails] = useState([]);
    const [fetchingLogs, setFetchingLogs] = useState(false);
    const [activeTab, setActiveTab] = useState('sent');

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Confirmation Modal
    const [showConfirm, setShowConfirm] = useState(false);

    // FollowUp Hook
    const {
        isFollowUpModalOpen,
        isSending,
        subject,
        setSubject,
        body,
        setBody,
        eligibleCount,
        openFollowUpModal,
        closeFollowUpModal,
        handleSendFollowUp
    } = useFollowUp();

    // ── Load campaign data + live stats from Firebase ──────────────────────────
    const loadData = useCallback(async () => {
        if (!currentUser || !id) return;
        try {
            setLoading(true);
            const data = await getCampaign(id);
            if (!data) return;

            const audienceCount = await getCampaignAudienceCount(id);
            const sendsStats = await getCampaignSendsStats(id);

            setCampaign(data);
            setStats({
                totalLeads: audienceCount || data.totalLeads || 0,
                ...sendsStats
            });

            // If sent, load detailed audience
            if (data.status === 'sent') {
                const rawSends = await getCampaignSends(id);
                setAudienceSends(rawSends);

                const leads = await getProjectLeads(data.projectId);
                const leadsMap = {};
                leads.forEach(l => { leadsMap[l.id] = l; });
                setProjectLeadsMap(leadsMap);
            }

        } catch (err) {
            console.error('[CampaignDetail] load error:', err);
            toast.error('Failed to load campaign data.');
        } finally {
            setLoading(false);
        }
    }, [id, currentUser]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Fetch Resend logs when the activeTab is 'resend_logs'
    useEffect(() => {
        if (activeTab === 'resend_logs' && resendEmails.length === 0) {
            const getLogs = async () => {
                setFetchingLogs(true);
                try {
                    const emails = await fetchResendEmails();
                    setResendEmails(emails);
                } catch (err) {
                    console.error('Resend fetch error:', err);
                    toast.error('Failed to fetch Resend logs');
                } finally {
                    setFetchingLogs(false);
                }
            };
            getLogs();
        }
    }, [activeTab, resendEmails.length]);

    const handleLaunchCampaign = async () => {
        setShowConfirm(false);
        setActionLoading(true);
        try {
            const result = await launchCampaign(id);
            toast.success(`Campaign sent to ${result.totalSent} leads!`);
            await loadData();
        } catch (err) {
            console.error('[CampaignDetail] launch error:', err);
            toast.error(err.message || 'Failed to launch campaign. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSyncStats = async () => {
        setActionLoading(true);
        const toastId = toast.loading('Syncing latest stats from Resend...');
        try {
            const result = await syncCampaignStatus(id);
            toast.success(`Synced ${result.updated} records!`, { id: toastId });
            await loadData();
        } catch (err) {
            console.error('[CampaignDetail] sync error:', err);
            toast.error('Failed to sync with Resend.', { id: toastId });
        } finally {
            setActionLoading(false);
        }
    };

    const statusVariant = (status) => {
        const map = {
            draft: 'default',
            scheduled: 'info',
            sent: 'primary',
            completed: 'success',
        };
        return map[status] || 'default';
    };

    // Filter audience leads client side based on tab
    const getFilteredSends = () => {
        if (activeTab === 'resend_logs') return resendEmails;

        return audienceSends.filter(s => {
            if (activeTab === 'sent') return true;
            if (activeTab === 'opened') return s.opened === true;
            if (activeTab === 'replied') return s.replied === true;
            if (activeTab === 'bounced') return s.deliveryStatus === 'bounced';
            return false;
        });
    };

    const formatTimeAgo = (ts) => {
        if (!ts) return 'Unknown';
        const now = Date.now();
        const diff = now - ts;
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
        return `${Math.floor(mins / 1440)}d ago`;
    };

    const audienceColumns = useMemo(() => {
        if (activeTab === 'resend_logs') {
            return [
                { name: 'Email ID', selector: row => row.id, cell: row => <span className="text-xs font-mono text-subtle">{row.id.substring(0, 8)}</span>, width: '120px' },
                { name: 'To', selector: row => Array.isArray(row.to) ? row.to.join(', ') : row.to },
                { name: 'Subject', selector: row => row.subject, wrap: true },
                { name: 'Status', selector: row => row.last_event, cell: row => <Badge variant={row.last_event === 'delivered' ? 'success' : row.last_event === 'bounced' ? 'danger' : 'default'}>{row.last_event || 'sent'}</Badge> },
                { name: 'Created At', selector: row => row.created_at, cell: row => formatTimeAgo(new Date(row.created_at).getTime()), sortable: true },
            ];
        }

        const cols = [
            {
                name: 'Recipient',
                selector: row => projectLeadsMap[row.leadId]?.email || row.leadId,
                sortable: true,
                cell: row => {
                    const leadData = projectLeadsMap[row.leadId];
                    return (
                        <div className="flex flex-col py-2">
                            <span className="text-sm font-medium text-dark">{leadData?.email || 'Unknown Email'}</span>
                            <span className="text-xs text-subtle font-mono">ID: {row.leadId.substring(1, 8)}</span>
                        </div>
                    );
                }
            },
        ];

        if (activeTab === 'sent') {
            cols.push(
                { name: 'Status', selector: row => row.deliveryStatus, sortable: true, cell: row => <Badge variant={row.deliveryStatus === 'delivered' ? 'success' : 'default'}>{row.deliveryStatus}</Badge> },
                { name: 'Sent At', selector: row => row.sentAt, cell: row => formatTimeAgo(row.sentAt), sortable: true }
            );
        } else if (activeTab === 'opened') {
            cols.push(
                { name: 'Opens', selector: row => row.openCount, sortable: true },
                { name: 'First Opened', selector: row => row.firstOpenAt, cell: row => formatTimeAgo(row.firstOpenAt), sortable: true }
            );
        } else if (activeTab === 'replied') {
            cols.push(
                { name: 'Replied At', selector: row => row.repliedAt, cell: row => formatTimeAgo(row.repliedAt), sortable: true },
                { 
                    name: 'Action',
                    cell: () => (
                        <Button variant="outline" size="sm" className="h-8 shadow-none" onClick={() => openFollowUpModal(campaign.id, 1)}>
                            Follow-up
                        </Button>
                    ),
                    button: true,
                    width: '120px'
                }
            );
        } else if (activeTab === 'bounced') {
            cols.push(
                { name: 'Bounced At', selector: row => row.bouncedAt, cell: row => formatTimeAgo(row.bouncedAt), sortable: true }
            );
        }
        return cols;
    }, [activeTab, projectLeadsMap, campaign?.id, openFollowUpModal]);

    const ExpandedComponent = ({ data }) => {
        const [realEmail, setRealEmail] = useState(null);
        const [loadingEmail, setLoadingEmail] = useState(false);

        useEffect(() => {
            if (activeTab !== 'resend_logs' && data.resendEmailId) {
                const getEmail = async () => {
                    setLoadingEmail(true);
                    try {
                        const email = await fetchResendEmail(data.resendEmailId);
                        setRealEmail(email);
                    } catch (err) {
                        console.error('Failed to fetch resend email', err);
                    } finally {
                        setLoadingEmail(false);
                    }
                };
                getEmail();
            }
        }, [data.resendEmailId]);

        if (activeTab === 'resend_logs') {
            return (
                <div className="p-6 bg-background border-y border-border">
                    <div className="flex items-center justify-between mb-5">
                        <p className="text-xs font-medium tracking-wide text-muted uppercase">Provider details</p>
                        <Badge variant="default">Resend API</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="space-y-1">
                            <p className="text-xs font-medium tracking-wide text-muted uppercase">Email ID</p>
                            <p className="font-mono text-xs text-dark bg-surface p-2 rounded-lg border border-border">{data.id}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-medium tracking-wide text-muted uppercase">Subject</p>
                            <p className="text-sm font-medium text-dark truncate">{data.subject}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-medium tracking-wide text-muted uppercase">To</p>
                            <p className="text-sm text-muted truncate">{Array.isArray(data.to) ? data.to.join(', ') : data.to}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-medium tracking-wide text-muted uppercase">Last Event</p>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${data.last_event === 'delivered' ? 'bg-emerald-500' : data.last_event === 'bounced' ? 'bg-red-500' : 'bg-amber-500'}`} />
                                <span className="text-sm font-medium text-dark">{data.last_event || 'Processing'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-5 mt-5 border-t border-border">
                        <a 
                            href={`https://resend.com/emails/${data.id}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg text-xs font-medium text-primary hover:bg-white-tint transition-colors"
                        >
                            View in Resend <ExternalLink size={12} />
                        </a>
                    </div>
                </div>
            );
        }
        const leadData = projectLeadsMap[data.leadId];
        return (
            <div className="p-6 bg-background border-y border-border text-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs font-medium tracking-wide text-muted uppercase mb-3">Send details</p>
                        <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted">Send ID</span>
                                <span className="font-mono text-xs text-dark bg-background px-2 py-0.5 rounded border border-border">{data.id}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted">Lead ID</span>
                                <span className="font-mono text-xs text-dark bg-background px-2 py-0.5 rounded border border-border">{data.leadId}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted">Status</span>
                                <Badge variant={data.deliveryStatus === 'delivered' ? 'success' : 'default'}>{data.deliveryStatus}</Badge>
                            </div>
                            {data.resendEmailId && (
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted">Resend ID</span>
                                    <span className="font-mono text-xs text-primary bg-white-tint px-2 py-0.5 rounded border border-gray-tint">{data.resendEmailId}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-medium tracking-wide text-muted uppercase mb-3">Recipient</p>
                        <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-gradient-brand flex items-center justify-center">
                                    <User size={16} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-dark">{leadData?.email || 'Unknown'}</p>
                                    <p className="text-xs text-subtle">{leadData ? `${leadData.firstName || ''} ${leadData.lastName || ''}`.trim() || leadData.name : 'Unknown'}</p>
                                </div>
                            </div>
                            <div className="pt-3 border-t border-border grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-subtle">Company</p>
                                    <p className="text-sm text-dark mt-0.5">{leadData?.companyName || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-subtle">Sent at</p>
                                    <p className="text-sm text-dark mt-0.5">{data.sentAt ? new Date(data.sentAt).toLocaleString() : 'Unknown'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-6 space-y-4">
                    <p className="text-xs font-medium tracking-wide text-muted uppercase">Email content</p>
                    <div className="bg-surface rounded-xl border border-border overflow-hidden">
                        <div className="px-4 py-3 border-b border-border bg-background">
                            <p className="text-sm font-medium text-dark">
                                {realEmail ? realEmail.subject : (loadingEmail ? 'Loading subject...' : (data.subject || 'No subject'))}
                            </p>
                        </div>
                        <div className="p-6 relative min-h-[200px]">
                            {loadingEmail && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-b-xl">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Loader2 size={16} className="animate-spin" />
                                        <span className="text-sm font-medium">Loading content...</span>
                                    </div>
                                </div>
                            )}
                            <div className="prose prose-sm max-w-none text-muted" dangerouslySetInnerHTML={{ 
                                __html: realEmail?.html ? realEmail.html : (data.body || '<p class="text-center text-subtle">No content available</p>') 
                            }} />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center gap-3">
                <Loader2 size={24} className="animate-spin text-purple-tint" />
                <p className="text-sm text-muted">Loading campaign data...</p>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="py-20 text-center">
                <p className="text-sm text-muted">Campaign not found.</p>
                <Link to="/dashboard/campaigns">
                    <Button variant="outline" className="mt-4">Back to Campaigns</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* ── Launch Confirmation Modal ─────────────────────────────────── */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-surface rounded-xl shadow-xl border border-border max-w-md w-full mx-4">
                        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-brand flex items-center justify-center">
                                <Send size={18} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-dark">Launch Campaign?</h3>
                                <p className="text-xs text-muted">This will send emails to all assigned leads.</p>
                            </div>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <div className="p-4 bg-background rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">Campaign</span>
                                    <span className="font-medium text-dark">{campaign.name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">Recipients</span>
                                    <span className="font-medium text-primary">{stats.totalLeads} leads</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">Subject</span>
                                    <span className="font-medium text-dark text-right max-w-[60%] truncate">
                                        {campaign.subjectLine || campaign.subject}
                                    </span>
                                </div>
                            </div>
                            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3 font-medium">
                                This action cannot be undone. Once sent, emails cannot be recalled.
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-border bg-background/50 flex justify-end gap-3 rounded-b-xl">
                            <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={actionLoading}>Cancel</Button>
                            <Button variant="primary" className="bg-primary hover:bg-primary-hover shadow-primary" onClick={handleLaunchCampaign} disabled={actionLoading}>
                                {actionLoading ? <><Loader2 size={14} className="animate-spin mr-2" />Sending...</> : <><Send size={14} className="mr-2" />Confirm & Send</>}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Follow-Up Modal ─────────────────────────────────── */}
            <Modal
                isOpen={isFollowUpModalOpen}
                onClose={closeFollowUpModal}
                title={`Send Follow-up to ${eligibleCount} Replied Leads`}
                size="xl"
            >
                <div className="px-6 py-5 space-y-5">
                    <div>
                        <label className="block text-xs font-medium tracking-wide text-muted uppercase mb-2">Subject Line</label>
                        <Input
                            placeholder="Following up: {{firstName}}"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                        <p className="text-xs text-subtle mt-2">Use {'{{firstName}}'}, {'{{lastName}}'}, {'{{companyName}}'}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-medium tracking-wide text-muted uppercase mb-2">Email Body</label>
                        <RichTextEditor
                            value={body}
                            onChange={setBody}
                            placeholder="Write your follow-up message..."
                        />
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-border bg-background/50 flex justify-end gap-3 rounded-b-xl">
                    <Button variant="outline" onClick={closeFollowUpModal} disabled={isSending}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        className="bg-primary hover:bg-primary-hover shadow-primary"
                        onClick={() => handleSendFollowUp(loadData)}
                        disabled={isSending || !subject || !body}
                    >
                        {isSending ? <><Loader2 size={14} className="animate-spin mr-2" /> Sending...</> : <><Send size={14} className="mr-2" /> Send Follow-up</>}
                    </Button>
                </div>
            </Modal>

            {/* ── Header ──────────────────────────────────────── */}
            <div className="space-y-5">
                <div className="flex items-center gap-2 text-sm">
                    <Link to="/dashboard/campaigns" className="text-muted hover:text-primary transition-colors flex items-center gap-1.5">
                        <ArrowLeft size={14} />
                        <span>Campaigns</span>
                    </Link>
                    <span className="text-gray-tint">/</span>
                    <Badge variant={statusVariant(campaign.status)}>{campaign.status}</Badge>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <TitleComponent type="h1" className="text-2xl font-semibold text-dark">
                            {campaign.name}
                        </TitleComponent>
                        <p className="text-sm text-muted mt-1">
                            {campaign.status === 'draft' ? 'Created on ' : 'Launched on '}
                            {new Date(campaign.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        {campaign.status === 'draft' ? (
                            <>
                                <Link to={`/dashboard/campaigns/${id}/edit`}>
                                    <Button variant="outline" className="border-border text-primary hover:bg-white-tint">
                                        <Pencil size={14} className="mr-2" />Edit Content
                                    </Button>
                                </Link>
                                <Button
                                    variant="primary"
                                    className="bg-primary hover:bg-primary-hover shadow-primary"
                                    onClick={() => setShowConfirm(true)}
                                    disabled={actionLoading || stats.totalLeads === 0}
                                >
                                    {actionLoading ? <><Loader2 size={14} className="animate-spin mr-2" />Launching...</> : <><Send size={14} className="mr-2" />Launch Campaign</>}
                                </Button>
                            </>
                        ) : campaign.status === 'sent' ? (
                            <>
                                <Button 
                                    variant="outline" 
                                    className="border-border text-primary hover:bg-white-tint"
                                    onClick={handleSyncStats}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? (
                                        <><Loader2 size={14} className="animate-spin mr-2" />Syncing...</>
                                    ) : (
                                        <><RefreshCw size={14} className="mr-2" />Sync Stats</>
                                    )}
                                </Button>
                                {stats.replied > 0 && (
                                    <Button 
                                        variant="primary" 
                                        className="bg-primary hover:bg-primary-hover shadow-primary"
                                        onClick={() => openFollowUpModal(id, stats.replied)}
                                    >
                                        <Reply size={14} className="mr-2" />Send Follow-up
                                    </Button>
                                )}
                            </>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* ── Stats Overview ────────────────────────────────────────────── */}
            {campaign.status === 'sent' ? (
                <CampaignProgressCard stats={stats} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Audience', value: stats.totalLeads, Icon: Users },
                        { label: 'Projected Reach', value: '100%', Icon: Target },
                        { label: 'Lead Sources', value: '1', Icon: Database },
                        { label: 'Status', value: 'Ready', Icon: Terminal },
                    ].map((stat, i) => (
                        <div key={i} className="bg-surface p-6 rounded-xl border border-border shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-brand flex items-center justify-center">
                                    <stat.Icon size={18} className="text-white" />
                                </div>
                            </div>
                            <p className="text-2xl font-semibold text-dark">{stat.value}</p>
                            <p className="text-xs font-medium tracking-wide text-muted uppercase mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {campaign.status === 'draft' && stats.totalLeads === 0 && (
                <div className="p-5 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white border border-amber-100 flex items-center justify-center">
                        <AlertTriangle size={18} className="text-amber-500" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-amber-900">No leads assigned</p>
                        <p className="text-xs text-amber-700 mt-0.5">Add an audience before launching this campaign.</p>
                    </div>
                    <Link to={`/dashboard/campaigns/${id}/edit`} className="ml-auto">
                        <Button variant="outline" className="border-amber-200 text-amber-800 hover:bg-amber-100 text-xs">Add Audience</Button>
                    </Link>
                </div>
            )}

            {/* ── Audience Tabs ────────────────────────────────────────────── */}
            {campaign.status === 'sent' && (
                <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
                    <div className="flex border-b border-border bg-background p-1.5 gap-1 overflow-x-auto">
                        {['sent', 'opened', 'replied', 'bounced', 'resend_logs'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 whitespace-nowrap rounded-lg text-xs font-medium transition-colors ${
                                    activeTab === tab 
                                    ? 'bg-white-tint text-primary' 
                                    : 'text-muted hover:bg-background hover:text-dark'
                                }`}
                            >
                                {tab.replace('_', ' ')}
                                <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] ${activeTab === tab ? 'bg-primary/10 text-primary' : 'bg-border text-subtle'}`}>
                                    {tab === 'resend_logs' ? (fetchingLogs ? '…' : resendEmails.length) :
                                     tab === 'sent' ? stats.total :
                                     tab === 'opened' ? stats.opened : 
                                     tab === 'replied' ? stats.replied : 
                                     stats.bounced}
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className="p-4">
                        <DataTable
                            columns={audienceColumns}
                            data={getFilteredSends()}
                            customStyles={customStyles}
                            pagination
                            highlightOnHover
                            persistTableHead
                            expandableRows
                            expandableRowsComponent={ExpandedComponent}
                            noDataComponent={(
                                <div className="py-16 text-center space-y-3">
                                    <div className="w-12 h-12 rounded-xl bg-white-tint mx-auto flex items-center justify-center">
                                        <Inbox size={24} className="text-purple-tint" />
                                    </div>
                                    <p className="text-sm text-muted">No records in this category</p>
                                </div>
                            )}
                        />
                    </div>
                </div>
            )}

            {/* ── Content Preview ─────────────────────────────────── */}
            <div className="bg-surface rounded-xl shadow-sm border border-border p-6 space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-dark">Content Preview</h3>
                        <p className="text-sm text-muted mt-0.5">Email template configuration</p>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-medium tracking-wide text-muted uppercase flex items-center gap-1.5">
                            <FileText size={12} /> Subject Line
                        </label>
                        <div className="p-4 bg-background rounded-lg border border-border text-sm font-medium text-dark">
                            {campaign.subjectLine || campaign.subject || 'No subject set'}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium tracking-wide text-muted uppercase flex items-center gap-1.5">
                            <Code size={12} /> Email Body
                        </label>
                        <div className="p-6 bg-surface rounded-lg border border-border prose prose-sm max-w-none text-muted">
                            <div dangerouslySetInnerHTML={{ __html: campaign.emailBodyHTML || campaign.emailContent || campaign.body || '<p class="text-subtle">No content set.</p>' }} />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default CampaignDetail;
