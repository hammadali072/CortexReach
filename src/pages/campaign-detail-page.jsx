import React, { useReducer, useEffect, useCallback, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import TitleComponent from '../components/titleComponent/titleComponent';
import Badge from '../components/ui/badge/badge';
import Button from '../components/ui/button/button';
import {
    ArrowLeft, Send, Pencil, Loader2, RefreshCw,
    Users, Target, Database, Terminal, AlertTriangle,
    ExternalLink, User, Clock, Inbox,
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
import CampaignProgressCard from '../components/ui/campaignProgressCard/campaignProgressCard';
import DataTable from 'react-data-table-component';
import toast from 'react-hot-toast';
import SanitizedHTML from '../components/ui/sanitizedHTML/sanitizedHTML';

const customStyles = {
    headRow: { style: { backgroundColor: '#f5f6fc', borderBottomColor: '#e2e5f5' } },
    headCells: { style: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', fontWeight: 500, paddingLeft: '16px', paddingRight: '16px' } },
    cells: { style: { paddingLeft: '16px', paddingRight: '16px', color: '#1a1d3a', fontSize: '14px', fontWeight: 400 } },
    rows: { style: { minHeight: '56px', borderBottomColor: '#f0f2fb', '&:hover': { backgroundColor: '#f5f6fc' } } },
};

const ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    SET_CAMPAIGN_DATA: 'SET_CAMPAIGN_DATA',
    SET_AUDIENCE_DATA: 'SET_AUDIENCE_DATA',
    SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
    SET_RESEND_LOGS: 'SET_RESEND_LOGS',
    SET_FETCHING_LOGS: 'SET_FETCHING_LOGS',
    SET_ACTION_LOADING: 'SET_ACTION_LOADING',
    SET_SHOW_CONFIRM: 'SET_SHOW_CONFIRM',
    SET_ERROR: 'SET_ERROR'
};

const campaignDetailReducer = (state, action) => {
    switch (action.type) {
        case ACTIONS.SET_LOADING: return { ...state, loading: action.payload };
        case ACTIONS.SET_CAMPAIGN_DATA:
            return { 
                ...state, 
                campaign: action.payload.campaign, 
                stats: { ...state.stats, ...action.payload.stats },
                loading: false 
            };
        case ACTIONS.SET_AUDIENCE_DATA:
            return { ...state, audienceSends: action.payload.sends, projectLeadsMap: action.payload.leadsMap };
        case ACTIONS.SET_ACTIVE_TAB: return { ...state, activeTab: action.payload };
        case ACTIONS.SET_RESEND_LOGS: return { ...state, resendEmails: action.payload, fetchingLogs: false };
        case ACTIONS.SET_FETCHING_LOGS: return { ...state, fetchingLogs: action.payload };
        case ACTIONS.SET_ACTION_LOADING: return { ...state, actionLoading: action.payload };
        case ACTIONS.SET_SHOW_CONFIRM: return { ...state, showConfirm: action.payload };
        case ACTIONS.SET_ERROR: return { ...state, error: action.payload, loading: false, actionLoading: false };
        default: return state;
    }
};

const ExpandedComponent = ({ data, activeTab, projectLeadsMap }) => {
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
    }, [data.resendEmailId, activeTab]);

    const leadData = projectLeadsMap[data.leadId];
    
    if (activeTab === 'resend_logs') {
        return (
            <div className="p-6 bg-slate-50 border-y border-slate-100">
                <div className="flex items-center justify-between mb-5">
                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Provider details</p>
                    <Badge variant="default">Resend API</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Email ID</p>
                        <p className="font-mono text-[10px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200">{data.id}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Subject</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{data.subject}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">To</p>
                        <p className="text-sm text-slate-500 truncate">{Array.isArray(data.to) ? data.to.join(', ') : data.to}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Last Event</p>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${data.last_event === 'delivered' ? 'bg-emerald-500' : data.last_event === 'bounced' ? 'bg-red-500' : 'bg-amber-500'}`} />
                            <span className="text-sm font-bold text-slate-700">{data.last_event || 'Processing'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end pt-5 mt-5 border-t border-slate-100">
                    <a href={`https://resend.com/emails/${data.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-indigo-600 hover:bg-white transition-colors">
                        View in Resend <ExternalLink size={12} />
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 border-y border-slate-100 text-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-3">Send details</p>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-sm">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-bold uppercase tracking-tighter">Send ID</span>
                            <span className="font-mono text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{data.id}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-bold uppercase tracking-tighter">Lead ID</span>
                            <span className="font-mono text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{data.leadId}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-bold uppercase tracking-tighter">Status</span>
                            <Badge variant={data.deliveryStatus === 'delivered' ? 'success' : 'default'}>{data.deliveryStatus}</Badge>
                        </div>
                        {data.resendEmailId && (
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-bold uppercase tracking-tighter">Resend ID</span>
                                <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{data.resendEmailId}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-3">Recipient</p>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-brand flex items-center justify-center">
                                <User size={16} className="text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">{leadData?.email || 'Unknown'}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{leadData ? `${leadData.firstName || ''} ${leadData.lastName || ''}`.trim() || leadData.name : 'Unknown'}</p>
                            </div>
                        </div>
                        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Company</p>
                                <p className="text-xs font-bold text-slate-700 mt-0.5">{leadData?.companyName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Sent at</p>
                                <p className="text-xs font-bold text-slate-700 mt-0.5">{data.sentAt ? new Date(data.sentAt).toLocaleString() : 'Unknown'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-6 space-y-4">
                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Email content</p>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                        <p className="text-sm font-bold text-slate-900">
                            {realEmail ? realEmail.subject : (loadingEmail ? 'Loading subject...' : (data.subject || 'No subject'))}
                        </p>
                    </div>
                    <div className="p-6 relative min-h-[200px]">
                        {loadingEmail && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-b-xl">
                                <div className="flex items-center gap-2 text-indigo-600">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span className="text-sm font-bold">Loading content...</span>
                                </div>
                            </div>
                        )}
                        <SanitizedHTML className="prose prose-sm max-w-none text-slate-600" html={realEmail?.html ? realEmail.html : (data.body || '<p class="text-center text-slate-300">No content available</p>')} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const CampaignDetailPage = () => {
    const { id } = useParams();
    const { currentUser } = useAuth();

    const [state, dispatch] = useReducer(campaignDetailReducer, {
        campaign: null,
        stats: { totalLeads: 0, sent: 0, delivered: 0, opened: 0, replied: 0, bounced: 0 },
        audienceSends: [],
        projectLeadsMap: {},
        resendEmails: [],
        fetchingLogs: false,
        activeTab: 'sent',
        loading: true,
        actionLoading: false,
        showConfirm: false,
        error: null
    });

    const { campaign, stats, audienceSends, projectLeadsMap, resendEmails, fetchingLogs, activeTab, loading, actionLoading, showConfirm } = state;

    const loadData = useCallback(async () => {
        if (!currentUser || !id) return;
        try {
            dispatch({ type: ACTIONS.SET_LOADING, payload: true });
            const data = await getCampaign(id);
            if (!data) {
                dispatch({ type: ACTIONS.SET_ERROR, payload: 'Campaign not found.' });
                return;
            }

            const audienceCount = await getCampaignAudienceCount(id);
            const sendsStats = await getCampaignSendsStats(id);

            dispatch({ 
                type: ACTIONS.SET_CAMPAIGN_DATA, 
                payload: { 
                    campaign: data, 
                    stats: { totalLeads: audienceCount || data.totalLeads || 0, ...sendsStats } 
                } 
            });

            if (data.status === 'sent') {
                const rawSends = await getCampaignSends(id);
                const leads = await getProjectLeads(data.projectId);
                const leadsMap = {};
                leads.forEach(l => { leadsMap[l.id] = l; });
                dispatch({ type: ACTIONS.SET_AUDIENCE_DATA, payload: { sends: rawSends, leadsMap } });
            }
        } catch (err) {
            console.error('[CampaignDetail] load error:', err);
            toast.error('Failed to load campaign data.');
            dispatch({ type: ACTIONS.SET_ERROR, payload: err.message });
        }
    }, [id, currentUser]);

    useEffect(() => { loadData(); }, [loadData]);

    useEffect(() => {
        if (activeTab === 'resend_logs' && resendEmails.length === 0) {
            const getLogs = async () => {
                dispatch({ type: ACTIONS.SET_FETCHING_LOGS, payload: true });
                try {
                    const emails = await fetchResendEmails();
                    dispatch({ type: ACTIONS.SET_RESEND_LOGS, payload: emails });
                } catch (err) {
                    console.error('Resend fetch error:', err);
                    toast.error('Failed to fetch Resend logs');
                    dispatch({ type: ACTIONS.SET_FETCHING_LOGS, payload: false });
                }
            };
            getLogs();
        }
    }, [activeTab, resendEmails.length]);

    const handleLaunchCampaign = async () => {
        dispatch({ type: ACTIONS.SET_SHOW_CONFIRM, payload: false });
        dispatch({ type: ACTIONS.SET_ACTION_LOADING, payload: true });
        try {
            const result = await launchCampaign(id);
            toast.success(`Campaign sent to ${result.totalSent} leads!`);
            await loadData();
        } catch (err) {
            console.error('[CampaignDetail] launch error:', err);
            toast.error(err.message || 'Failed to launch campaign.');
        } finally {
            dispatch({ type: ACTIONS.SET_ACTION_LOADING, payload: false });
        }
    };

    const handleSyncStats = async () => {
        dispatch({ type: ACTIONS.SET_ACTION_LOADING, payload: true });
        const toastId = toast.loading('Syncing latest stats from Resend...');
        try {
            const result = await syncCampaignStatus(id);
            toast.success(`Synced ${result.updated} records!`, { id: toastId });
            await loadData();
        } catch (err) {
            console.error('[CampaignDetail] sync error:', err);
            toast.error('Failed to sync with Resend.', { id: toastId });
        } finally {
            dispatch({ type: ACTIONS.SET_ACTION_LOADING, payload: false });
        }
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
                { name: 'Email ID', selector: row => row.id, cell: row => <span className="text-xs font-mono text-slate-500">{row.id.substring(0, 8)}</span>, width: '120px' },
                { name: 'To', selector: row => Array.isArray(row.to) ? row.to.join(', ') : row.to },
                { name: 'Subject', selector: row => row.subject, wrap: true },
                { name: 'Status', selector: row => row.last_event, cell: row => <Badge variant={row.last_event === 'delivered' ? 'success' : row.last_event === 'bounced' ? 'danger' : 'default'}>{row.last_event || 'sent'}</Badge> },
                { name: 'Created At', selector: row => row.created_at, cell: row => formatTimeAgo(new Date(row.created_at).getTime()), sortable: true },
            ];
        }
        const cols = [{
            name: 'Recipient', selector: row => projectLeadsMap[row.leadId]?.email || row.leadId, sortable: true,
            cell: row => (
                <div className="flex flex-col py-2">
                    <span className="text-sm font-bold text-slate-900">{projectLeadsMap[row.leadId]?.email || 'Unknown Email'}</span>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {row.leadId.substring(1, 8)}</span>
                </div>
            )
        }];
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
            cols.push({ name: 'Replied At', selector: row => row.repliedAt, cell: row => formatTimeAgo(row.repliedAt), sortable: true });
        } else if (activeTab === 'bounced') {
            cols.push({ name: 'Bounced At', selector: row => row.bouncedAt, cell: row => formatTimeAgo(row.bouncedAt), sortable: true });
        }
        return cols;
    }, [activeTab, projectLeadsMap]);

    if (loading) return (
        <div className="py-20 flex flex-col items-center gap-3">
            <Loader2 size={24} className="animate-spin text-indigo-600" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading campaign details...</p>
        </div>
    );

    if (!campaign) return (
        <div className="py-20 text-center">
            <p className="text-sm text-slate-500 italic">Campaign not found.</p>
            <Link to="/dashboard/campaigns"><Button variant="outline" className="mt-4">Back to Campaigns</Button></Link>
        </div>
    );

    const filteredSends = activeTab === 'resend_logs' ? resendEmails : audienceSends.filter(s => {
        if (activeTab === 'sent') return true;
        if (activeTab === 'opened') return s.opened === true;
        if (activeTab === 'replied') return s.replied === true;
        if (activeTab === 'bounced') return s.deliveryStatus === 'bounced';
        return false;
    });

    return (
        <div className="space-y-8 pb-12">
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" role="button" tabIndex={0} onClick={() => dispatch({ type: ACTIONS.SET_SHOW_CONFIRM, payload: false })} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && dispatch({ type: ACTIONS.SET_SHOW_CONFIRM, payload: false })} aria-label="Close modal" />
                    <div className="relative bg-white rounded-2xl shadow-premium border border-slate-100 max-w-md w-full overflow-hidden">
                        <div className="p-10 text-center space-y-6">
                            <div className="size-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto text-indigo-600 shadow-inner">
                                <Send size={32} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-slate-900">Launch Outreach?</h3>
                                <p className="text-slate-500 font-medium italic">Ready to send emails to {stats.totalLeads} prospects?</p>
                            </div>
                            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-4 font-bold flex items-start gap-3">
                                <AlertTriangle size={16} className="flex-shrink-0" />
                                <span>Emails cannot be recalled once sent. Ensure your targeting and content are correct.</span>
                            </div>
                            <div className="flex gap-4 pt-2">
                                <Button variant="outline" className="flex-1 h-14" onClick={() => dispatch({ type: ACTIONS.SET_SHOW_CONFIRM, payload: false })} disabled={actionLoading}>Cancel</Button>
                                <Button variant="primary" className="flex-1 h-14 bg-indigo-600 shadow-lg shadow-indigo-100" onClick={handleLaunchCampaign} disabled={actionLoading}>
                                    {actionLoading ? <Loader2 size={18} className="animate-spin" /> : 'Confirm & Send'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-1">
                <div className="flex items-center gap-2 mb-4">
                    <Link to="/dashboard/campaigns" className="text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                        <ArrowLeft size={14} /> Back to list
                    </Link>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Badge variant={campaign.status === 'sent' ? 'primary' : 'default'} className="uppercase tracking-widest text-[10px] font-black">{campaign.status}</Badge>
                            <span className="text-xs text-slate-400 font-medium">Launched {new Date(campaign.createdAt).toLocaleDateString()}</span>
                        </div>
                        <TitleComponent type="h1" className="text-4xl font-bold bg-gradient-brand bg-clip-text text-transparent">{campaign.name}</TitleComponent>
                    </div>
                    <div className="flex gap-4">
                        {campaign.status === 'draft' ? (
                            <>
                                <Link to={`/dashboard/campaigns/${id}/edit`}><Button variant="outline" className="border-slate-200 text-slate-600 h-12 px-6"><Pencil size={14} className="mr-2" />Edit Outreach</Button></Link>
                                <Button variant="primary" className="bg-indigo-600 shadow-xl shadow-indigo-100 h-12 px-8" onClick={() => dispatch({ type: ACTIONS.SET_SHOW_CONFIRM, payload: true })} disabled={actionLoading || stats.totalLeads === 0}>Launch Now</Button>
                            </>
                        ) : campaign.status === 'sent' && (
                            <Button variant="outline" className="border-slate-200 text-indigo-600 h-12 px-6" onClick={handleSyncStats} disabled={actionLoading}>
                                {actionLoading ? <Loader2 size={14} className="animate-spin mr-2" /> : <RefreshCw size={14} className="mr-2" />} Sync Latest Stats
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {campaign.status === 'sent' ? <CampaignProgressCard stats={stats} /> : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Audience', value: stats.totalLeads, Icon: Users },
                        { label: 'Projected Reach', value: '100%', Icon: Target },
                        { label: 'Lead Sources', value: '1', Icon: Database },
                        { label: 'Status', value: 'Ready', Icon: Terminal },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-premium group hover:border-indigo-200 transition-all">
                            <div className="size-12 rounded-xl bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center mb-6 transition-colors"><stat.Icon size={20} className="text-slate-400 group-hover:text-indigo-600" /></div>
                            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mt-2">{stat.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {campaign.status === 'draft' && stats.totalLeads === 0 && (
                <div className="p-8 bg-amber-50 border border-amber-100 rounded-3xl flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="size-14 rounded-2xl bg-white border border-amber-100 flex items-center justify-center shadow-sm"><AlertTriangle size={24} className="text-amber-500" /></div>
                        <div>
                            <p className="text-lg font-bold text-amber-900">Incomplete Outreach</p>
                            <p className="text-sm text-amber-700 italic font-medium">You need to select an audience before you can launch this campaign.</p>
                        </div>
                    </div>
                    <Link to={`/dashboard/campaigns/${id}/edit`}><Button variant="outline" className="border-amber-200 text-amber-800 hover:bg-amber-100 font-bold px-8 h-12">Select Prospects</Button></Link>
                </div>
            )}

            {campaign.status === 'sent' && (
                <div className="bg-white rounded-3xl shadow-premium border border-slate-100 overflow-hidden">
                    <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-2 overflow-x-auto no-scrollbar">
                        {['sent', 'opened', 'replied', 'bounced', 'resend_logs'].map((tab) => (
                            <button key={tab} onClick={() => dispatch({ type: ACTIONS.SET_ACTIVE_TAB, payload: tab })} className={`px-6 py-3 whitespace-nowrap rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-900'}`}>
                                {tab.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                    <div className="p-4">
                        <DataTable columns={audienceColumns} data={filteredSends} customStyles={customStyles} pagination highlightOnHover persistTableHead expandableRows expandableRowsComponent={({ data }) => <ExpandedComponent data={data} activeTab={activeTab} projectLeadsMap={projectLeadsMap} />} />
                    </div>
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-premium border border-slate-100 p-12 space-y-10">
                <div className="border-b border-slate-100 pb-8"><TitleComponent type="h3" className="text-2xl font-bold text-slate-900">Outreach Identity</TitleComponent><p className="text-slate-500 font-medium italic mt-1 text-sm">Visual review of the content being delivered to prospects.</p></div>
                <div className="space-y-10">
                    <div className="space-y-4">
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase flex items-center gap-2 px-1"><FileText size={14} /> Subject Header</p>
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-lg font-bold text-slate-800 shadow-inner">{campaign.subjectLine || campaign.subject || 'Empty Subject'}</div>
                    </div>
                    <div className="space-y-4">
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase flex items-center gap-2 px-1"><Code size={14} /> Body Content</p>
                        <div className="p-12 bg-white rounded-3xl border border-slate-100 shadow-inner relative"><SanitizedHTML className="max-w-none" html={campaign.emailBodyHTML || campaign.emailContent || campaign.body || '<p class="text-slate-300">No content set.</p>'} /></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignDetailPage;
