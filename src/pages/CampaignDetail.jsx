import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import TitleComponent from '../components/titleComponent/titleComponent';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
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
            backgroundColor: '#f8fafc',
            borderBottomColor: '#e2e8f0',
        },
    },
    headCells: {
        style: {
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#64748b',
            fontWeight: 800,
            paddingLeft: '16px',
            paddingRight: '16px',
        },
    },
    cells: {
        style: {
            paddingLeft: '16px',
            paddingRight: '16px',
            color: '#334155',
            fontSize: '14px',
            fontWeight: 500,
        },
    },
    rows: {
        style: {
            minHeight: '60px',
            '&:hover': {
                backgroundColor: '#f8fafc',
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
                // We'd ideally fetch all leads via getOpenedLeads, etc., 
                // but doing it manually via filtering is easier since it's already an array
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
                } catch (error) {
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
            toast.success(`🚀 Campaign sent to ${result.totalSent} leads!`);
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
                { name: 'Email ID', selector: row => row.id, cell: row => <span className="text-xs font-mono text-slate-400">{row.id.substring(0, 8)}</span>, width: '120px' },
                { name: 'To', selector: row => Array.isArray(row.to) ? row.to.join(', ') : row.to },
                { name: 'Subject', selector: row => row.subject, wrap: true },
                { name: 'Status', selector: row => row.last_event, cell: row => <Badge variant={row.last_event === 'delivered' ? 'success' : row.last_event === 'bounced' ? 'danger' : 'default'} className="uppercase">{row.last_event || 'sent'}</Badge> },
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
                            <span className="font-semibold text-slate-800">{leadData?.email || 'Unknown Email'}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {row.leadId.substring(1, 8)}</span>
                        </div>
                    );
                }
            },
        ];

        if (activeTab === 'sent') {
            cols.push(
                { name: 'Status', selector: row => row.deliveryStatus, sortable: true, cell: row => <Badge variant={row.deliveryStatus === 'delivered' ? 'success' : 'default'} className="uppercase">{row.deliveryStatus}</Badge> },
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
                    cell: row => (
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
    }, [activeTab, projectLeadsMap]);

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
                <div className="p-8 bg-slate-50/50 border-y border-slate-100 flex flex-col gap-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Provider Metadata</h4>
                        <Badge variant="default" className="text-[10px] bg-white border-slate-200">Resend API v1</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email ID</p>
                            <p className="font-mono text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100">{data.id}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</p>
                            <p className="text-sm font-bold text-slate-800 truncate">{data.subject}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">To</p>
                            <p className="text-sm font-medium text-slate-600 truncate">{Array.isArray(data.to) ? data.to.join(', ') : data.to}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Event</p>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${data.last_event === 'delivered' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{data.last_event || 'Processing'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <a 
                            href={`https://resend.com/emails/${data.id}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="bg-white px-4 py-2 border border-slate-200 rounded-xl text-xs font-black text-indigo-600 hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-sm shadow-indigo-100/50"
                        >
                            View Raw Logs <i className="fas fa-external-link-alt text-[10px]" />
                        </a>
                    </div>
                </div>
            );
        }
        const leadData = projectLeadsMap[data.leadId];
        return (
            <div className="p-10 bg-white border-y border-slate-100 text-sm text-slate-600 space-y-10 animate-in slide-in-from-top-4 duration-500 overflow-hidden relative">
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/30 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Journey Identity</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center group/id">
                                <span className="text-xs font-bold text-slate-500">Event ID</span>
                                <span className="font-mono text-[10px] bg-slate-50 px-2 py-1 rounded border border-slate-100 group-hover/id:border-indigo-200 transition-colors uppercase tracking-widest">{data.id}</span>
                            </div>
                            <div className="flex justify-between items-center group/id">
                                <span className="text-xs font-bold text-slate-500">Lead Registry</span>
                                <span className="font-mono text-[10px] bg-slate-50 px-2 py-1 rounded border border-slate-100 group-hover/id:border-indigo-200 transition-colors uppercase tracking-widest">{data.leadId}</span>
                            </div>
                            <div className="flex justify-between items-center group/id">
                                <span className="text-xs font-bold text-slate-500">Delivery Hash</span>
                                <span className="font-mono text-[10px] bg-indigo-50/50 text-indigo-600 px-2 py-1 rounded border border-indigo-100 group-hover/id:border-indigo-300 transition-colors uppercase tracking-widest">{data.resendEmailId || 'NONE'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Engagement Status</h4>
                        <div className="space-y-4 bg-slate-50/50 p-6 rounded-2xl border border-dashed border-slate-200">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm ring-1 ring-slate-100">
                                    <i className="fas fa-user text-indigo-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{leadData?.email || 'Unknown Lead'}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{leadData ? `${leadData.firstName || ''} ${leadData.lastName || ''}`.trim() : 'Anonymous'}</p>
                                </div>
                             </div>
                             <div className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Activity</p>
                                    <p className="text-xs font-bold text-indigo-600 mt-1">{data.sentAt ? new Date(data.sentAt).toLocaleTimeString() : '--:--'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Organization</p>
                                    <p className="text-xs font-bold text-slate-700 mt-1 truncate">{leadData?.companyName || 'N/A'}</p>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
                
                <div className="pt-10 border-t border-slate-100 space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transmission Content</h4>
                        <Badge variant="success" className="bg-emerald-50 text-emerald-600 border-emerald-100 px-3 uppercase tracking-widest text-[9px] font-black">Verified Delivered</Badge>
                    </div>

                    <div className="space-y-4">
                        <div className="p-5 bg-slate-900 rounded-2xl text-white shadow-2xl shadow-indigo-200/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 font-mono">Subject_Primary</p>
                            <p className="font-black text-lg tracking-tight leading-tight">
                                {realEmail ? realEmail.subject : (loadingEmail ? 'Fetching...' : (data.subject || 'UNTITLED'))}
                            </p>
                        </div>

                        <div className="p-1 w-full bg-slate-100 rounded-[24px] relative group overflow-hidden">
                             {loadingEmail && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center font-black text-indigo-600 rounded-[24px] z-20 space-y-2">
                                    <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-lg animate-spin" />
                                    <span className="text-[10px] uppercase tracking-widest">Reconstructing Assets</span>
                                </div>
                            )}
                            <div className="p-8 md:p-12 bg-white rounded-[20px] shadow-sm-inner relative z-10 min-h-[400px]">
                                <article className="prose prose-sm prose-slate max-w-none text-slate-700" dangerouslySetInnerHTML={{ 
                                    __html: realEmail?.html ? realEmail.html : (data.body || '<div class="text-center text-slate-300 font-bold py-20 flex flex-col items-center gap-3"><i class="fas fa-ghost text-4xl"></i> No transmission content found</div>') 
                                }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-[8px] animate-spin" />
                <p className="text-slate-400 text-sm font-medium">Loading campaign analysis...</p>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="py-20 text-center">
                <p className="text-slate-500">Campaign not found.</p>
                <Link to="/dashboard/campaigns">
                    <Button variant="outline" className="mt-4">Back to Campaigns</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen space-y-10 pb-12">
            {/* ── Launch Confirmation Modal ─────────────────────────────────── */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                                <i className="fas fa-paper-plane text-indigo-600 text-xl" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Launch Campaign?</h3>
                                <p className="text-sm text-slate-500">This will send emails to all assigned leads.</p>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 font-medium">Campaign</span>
                                <span className="font-bold text-slate-900">{campaign.name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 font-medium">Recipients</span>
                                <span className="font-bold text-indigo-600">{stats.totalLeads} leads</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 font-medium">Subject</span>
                                <span className="font-bold text-slate-700 text-right max-w-[60%] truncate">
                                    {campaign.subjectLine || campaign.subject}
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg p-3 font-medium">
                            ⚠️ This action cannot be undone. Once sent, emails cannot be recalled.
                        </p>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)} disabled={actionLoading}>Cancel</Button>
                            <Button variant="primary" className="flex-1 bg-indigo-600" onClick={handleLaunchCampaign} disabled={actionLoading}>
                                {actionLoading ? <><i className="fas fa-spinner fa-spin mr-2" />Sending...</> : <><i className="fas fa-paper-plane mr-2" />Confirm & Send</>}
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
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">Subject Line</label>
                        <Input
                            placeholder="Following up: {{firstName}}"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                        <p className="text-xs text-slate-500 mt-2 font-medium">Use {'{{firstName}}'}, {'{{lastName}}'}, {'{{companyName}}'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">Email Body</label>
                        <RichTextEditor
                            value={body}
                            onChange={setBody}
                            placeholder="Write your follow-up message..."
                        />
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <Button variant="outline" onClick={closeFollowUpModal} disabled={isSending}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        className="bg-indigo-600 font-bold"
                        onClick={() => handleSendFollowUp(loadData)}
                        disabled={isSending || !subject || !body}
                    >
                        {isSending ? <><i className="fas fa-spinner fa-spin mr-2" /> Sending...</> : <><i className="fas fa-paper-plane mr-2" /> Send Follow-up</>}
                    </Button>
                </div>
            </Modal>

            {/* ── Breadcrumbs + Header ──────────────────────────────────────── */}
            <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3">
                    <Link to="/dashboard/campaigns" className="text-slate-400 hover:text-indigo-600 transition-all font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
                        <i className="fas fa-arrow-left text-[8px]" />
                        Campaigns
                    </Link>
                    <span className="text-slate-200 font-thin">/</span>
                    <Badge variant={statusVariant(campaign.status)} className="uppercase tracking-[0.2em] text-[10px] py-1 px-3 shadow-sm font-black">
                        {campaign.status}
                    </Badge>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                    <div className="space-y-2">
                        <TitleComponent type="h1" className="text-slate-900 text-5xl md:text-6xl font-black font-idGrotesk tracking-tighter leading-none">
                            {campaign.name}
                        </TitleComponent>
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
                                {campaign.status === 'draft' ? 'Initialized on ' : 'Operational since '}
                                <span className="text-slate-900">{new Date(campaign.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        {campaign.status === 'draft' ? (
                            <>
                                <Link to={`/dashboard/campaigns/${id}/edit`}>
                                    <Button variant="outline" className="border-slate-200 h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50">
                                        <i className="fas fa-edit mr-3" />Edit Model
                                    </Button>
                                </Link>
                                <Button
                                    variant="primary"
                                    className="px-10 h-14 rounded-2xl bg-indigo-600 font-black text-xs uppercase tracking-[0.1em] border-none shadow-xl shadow-indigo-200 hover:scale-105 active:scale-95 transform transition-all"
                                    onClick={() => setShowConfirm(true)}
                                    disabled={actionLoading || stats.totalLeads === 0}
                                >
                                    {actionLoading ? <><i className="fas fa-spinner fa-spin mr-3" />Deploying...</> : <><i className="fas fa-paper-plane mr-3" />Launch Network</>}
                                </Button>
                            </>
                        ) : campaign.status === 'sent' ? (
                            <>
                                <Button 
                                    variant="outline" 
                                    className="border-slate-200 h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm"
                                    onClick={handleSyncStats}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? (
                                        <><i className="fas fa-spinner fa-spin mr-3" />Syncing Resonance...</>
                                    ) : (
                                        <><i className="fas fa-sync-alt mr-3 text-indigo-500" />Deep Status Sync</>
                                    )}
                                </Button>
                                {stats.replied > 0 && (
                                    <Button 
                                        variant="primary" 
                                        className="bg-indigo-600 h-14 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.1em] border-none shadow-xl shadow-indigo-200 hover:scale-105 active:scale-95 transform transition-all"
                                        onClick={() => openFollowUpModal(id, stats.replied)}
                                    >
                                        <i className="fas fa-reply mr-3" />Initiate Follow-up
                                    </Button>
                                )}
                            </>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* ── Stats Overview ────────────────────────────────────────────── */}
            {campaign.status === 'sent' ? (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <CampaignProgressCard stats={stats} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-bottom-10 duration-1000">
                    {[
                        { label: 'Initial Audience', value: stats.totalLeads, icon: 'fa-users', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                        { label: 'Projected Reach', value: '100%', icon: 'fa-bullseye', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Lead Sources', value: '1', icon: 'fa-database', color: 'text-amber-600', bg: 'bg-amber-50' },
                        { label: 'Status', value: 'READY', icon: 'fa-terminal', color: 'text-slate-600', bg: 'bg-slate-100' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50/50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} shadow-sm ring-1 ring-inset ring-black/5`}>
                                    <i className={`fas ${stat.icon} text-lg`} />
                                </div>
                                <Badge variant="default" className="text-[9px] uppercase tracking-widest bg-slate-50 border-slate-100 py-1 font-black">Blueprint</Badge>
                            </div>
                            <p className="text-4xl font-black text-slate-900 tracking-tight relative z-10">{stat.value}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 relative z-10">{stat.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {campaign.status === 'draft' && stats.totalLeads === 0 && (
                <div className="p-8 bg-amber-50 border border-amber-200/50 rounded-3xl flex items-center gap-6 animate-in zoom-in-95 duration-500">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200/20">
                        <i className="fas fa-exclamation-triangle text-amber-500 text-2xl" />
                    </div>
                    <div>
                        <p className="font-black text-amber-900 text-lg uppercase tracking-tight tracking-tight">Lead Registry Empty</p>
                        <p className="text-amber-700/80 text-sm font-medium">Assign a target audience before protocol deployment.</p>
                    </div>
                    <Link to={`/dashboard/campaigns/${id}/edit`} className="ml-auto">
                        <Button variant="outline" className="bg-white border-amber-200 text-amber-900 h-12 px-6 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-100/50 transition-all shadow-sm">
                            Add Leads
                        </Button>
                    </Link>
                </div>
            )}

            {/* ── Audience Tabs ────────────────────────────────────────────── */}
            {campaign.status === 'sent' && (
                <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000">
                    <div className="flex border-b border-slate-50 bg-slate-50/30 p-3 gap-2 overflow-x-auto scrollbar-hide">
                        {['sent', 'opened', 'replied', 'bounced', 'resend_logs'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-8 py-4 whitespace-nowrap rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                                    activeTab === tab 
                                    ? 'bg-white text-indigo-600 shadow-sm shadow-indigo-100 ring-1 ring-slate-100' 
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
                                }`}
                            >
                                {tab.replace('_', ' ')} <span className={`ml-2 px-2 py-0.5 rounded-full text-[9px] ${activeTab === tab ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {tab === 'resend_logs' ? (fetchingLogs ? '...' : resendEmails.length) :
                                     tab === 'sent' ? stats.total :
                                     tab === 'opened' ? stats.opened : 
                                     tab === 'replied' ? stats.replied : 
                                     stats.bounced}
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className="p-4 md:p-8">
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
                                <div className="py-32 text-center space-y-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-200 border border-slate-100 border-dashed">
                                        <i className="fas fa-inbox text-2xl" />
                                    </div>
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Registry Empty in this Node</p>
                                </div>
                            )}
                        />
                    </div>
                </div>
            )}

            {/* ── Content Preview ─────────────────────────────────── */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150">
                <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Content Blueprint</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Operational configuration for this outreach model</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-sm bg-slate-100" />
                        <div className="w-3 h-3 rounded-sm bg-slate-200" />
                        <div className="w-3 h-3 rounded-sm bg-slate-300" />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <i className="fas fa-heading text-[8px]" /> Subject Line Allocation
                        </label>
                        <div className="p-6 bg-slate-900 text-white rounded-2xl font-black text-lg tracking-tight shadow-xl shadow-indigo-200/20 border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                            {campaign.subjectLine || campaign.subject || 'UNTITLED_BLUEPRINT'}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <i className="fas fa-code text-[8px]" /> Deployed HTML Matrix
                        </label>
                        <div className="p-1 bg-slate-100 rounded-[32px] overflow-hidden group">
                             <div className="bg-white rounded-[28px] p-8 md:p-16 border border-slate-200 shadow-inner min-h-[500px] relative overflow-hidden">
                                 {/* Background Pattern */}
                                 <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
                                 
                                 <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed relative z-10">
                                    <div dangerouslySetInnerHTML={{ __html: campaign.emailBodyHTML || campaign.emailContent || campaign.body || '<div class="text-center font-bold text-slate-300">SYSTEM_ERROR: NULL_CONTENT</div>' }} />
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default CampaignDetail;
