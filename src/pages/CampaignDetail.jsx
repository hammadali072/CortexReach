import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import TitleComponent from '../components/titleComponent/titleComponent';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ABTestResults from '../components/ui/ABTestResults';
import ScalingVisualization from '../components/ui/ScalingVisualization';
import { launchCampaign } from '../services/emailService';
import {
    getCampaign,
    getCampaignAudienceCount,
    getCampaignSends,
} from '../services/db';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CampaignDetail = () => {
    const { id } = useParams();
    const { currentUser } = useAuth();

    const [campaign, setCampaign] = useState(null);
    const [stats, setStats] = useState({
        totalLeads: 0,
        opened: 0,
        replied: 0,
        yieldRate: '0%',
    });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // ── Confirmation modal state ───────────────────────────────────────────────
    const [showConfirm, setShowConfirm] = useState(false);

    // ── Load campaign data + live stats from Firebase ──────────────────────────
    const loadData = useCallback(async () => {
        if (!currentUser || !id) return;
        try {
            setLoading(true);
            const data = await getCampaign(id);
            if (!data) return;

            const audienceCount = await getCampaignAudienceCount(id);
            const sends = await getCampaignSends(id);
            const opened = sends.filter(s => s.opened).length;
            const replied = sends.filter(s => s.replied).length;
            const yieldVal = audienceCount > 0
                ? ((opened / audienceCount) * 100).toFixed(1)
                : '0';

            setCampaign(data);
            setStats({
                totalLeads: audienceCount || data.totalLeads || 0,
                opened,
                replied,
                yieldRate: `${yieldVal}%`,
            });
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

    // ── Launch campaign — calls Vercel /api/send-campaign → Resend ────────────
    const handleLaunchCampaign = async () => {
        setShowConfirm(false);
        setActionLoading(true);
        try {
            const result = await launchCampaign(id);
            toast.success(`🚀 Campaign sent to ${result.totalSent} leads!`);
            await loadData(); // refresh status + stats after send
        } catch (err) {
            console.error('[CampaignDetail] launch error:', err);
            toast.error(err.message || 'Failed to launch campaign. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    // ── Status → badge variant mapping ───────────────────────────────────────
    const statusVariant = (status) => {
        const map = {
            draft: 'default',
            scheduled: 'info',
            sent: 'primary',
            completed: 'success',
        };
        return map[status] || 'default';
    };

    // ── Loading skeleton ───────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-[8px] animate-spin" />
                <p className="text-slate-400 text-sm font-medium">Loading campaign analysis...</p>
            </div>
        );
    }

    // ── Not found ──────────────────────────────────────────────────────────────
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
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowConfirm(false)}
                                disabled={actionLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1 bg-indigo-600"
                                onClick={handleLaunchCampaign}
                                disabled={actionLoading}
                            >
                                {actionLoading
                                    ? <><i className="fas fa-spinner fa-spin mr-2" />Sending...</>
                                    : <><i className="fas fa-paper-plane mr-2" />Confirm & Send</>
                                }
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Breadcrumbs + Header ──────────────────────────────────────── */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Link to="/dashboard/campaigns" className="text-slate-400 hover:text-slate-600 transition-colors">
                        <Badge variant="default">Campaigns</Badge>
                    </Link>
                    <span className="text-slate-300">/</span>
                    <Badge
                        variant={statusVariant(campaign.status)}
                        className="uppercase tracking-widest"
                    >
                        {campaign.status}
                    </Badge>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <TitleComponent type="h1" className="text-slate-900 text-4xl font-black font-idGrotesk">
                            {campaign.name}
                        </TitleComponent>
                        <p className="text-slate-500 font-medium mt-1 italic">
                            {campaign.status === 'draft' ? 'Draft created on ' : 'Launched on '}
                            {new Date(campaign.createdAt).toLocaleDateString()}
                        </p>
                    </div>

                    {/* ── Action Buttons ──────────────────────────────────── */}
                    <div className="flex gap-4">
                        {campaign.status === 'draft' ? (
                            <>
                                <Link to={`/dashboard/campaigns/${id}/edit`}>
                                    <Button variant="outline" className="border-slate-200">
                                        <i className="fas fa-edit mr-2" />
                                        Edit Content
                                    </Button>
                                </Link>
                                <Button
                                    variant="primary"
                                    className="px-8 h-12 bg-indigo-600 font-bold border-none"
                                    onClick={() => setShowConfirm(true)}
                                    disabled={actionLoading || stats.totalLeads === 0}
                                >
                                    {actionLoading
                                        ? <><i className="fas fa-spinner fa-spin mr-2" />Launching...</>
                                        : <><i className="fas fa-paper-plane mr-2" />Launch Campaign</>
                                    }
                                </Button>
                            </>
                        ) : campaign.status === 'sent' ? (
                            <>
                                <Button variant="outline" className="border-slate-200 cursor-default" disabled>
                                    <i className="fas fa-check-circle mr-2 text-emerald-500" />
                                    Sent
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-slate-200"
                                    onClick={loadData}
                                >
                                    <i className="fas fa-sync-alt mr-2" />
                                    Refresh Stats
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" className="border-slate-200">
                                    <i className="fas fa-pause mr-2" />
                                    Pause Campaign
                                </Button>
                                <Button variant="primary" className="bg-slate-900 text-white cursor-default">
                                    <i className="fas fa-check-circle mr-2" />
                                    Live
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Stats Overview ────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Audience', value: stats.totalLeads, icon: 'fa-users', color: 'text-blue-500' },
                    { label: 'Opened', value: stats.opened, icon: 'fa-envelope-open', color: 'text-emerald-500' },
                    { label: 'Replied', value: stats.replied, icon: 'fa-reply', color: 'text-indigo-500' },
                    { label: 'Yield Rate', value: stats.yieldRate, icon: 'fa-chart-line', color: 'text-purple-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[8px] border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-10 h-10 rounded-[8px] bg-slate-50 flex items-center justify-center ${stat.color}`}>
                                <i className={`fas ${stat.icon}`} />
                            </div>
                            <Badge variant="default">All Time</Badge>
                        </div>
                        <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* ── No Audience Warning ───────────────────────────────────────── */}
            {campaign.status === 'draft' && stats.totalLeads === 0 && (
                <div className="p-5 bg-amber-50 border border-amber-100 rounded-[8px] flex items-center gap-4">
                    <i className="fas fa-exclamation-triangle text-amber-500 text-xl" />
                    <div>
                        <p className="font-bold text-amber-900 text-sm">No leads assigned to this campaign.</p>
                        <p className="text-amber-700 text-xs mt-0.5">
                            Edit the campaign to assign an audience before launching.
                        </p>
                    </div>
                    <Link to={`/dashboard/campaigns/${id}/edit`} className="ml-auto">
                        <Button variant="outline" className="border-amber-200 text-amber-700 text-xs">
                            Add Audience
                        </Button>
                    </Link>
                </div>
            )}

            {/* ── Campaign Content Preview ──────────────────────────────────── */}
            <div className="bg-white rounded-[8px] shadow-sm border border-slate-100 p-10 space-y-4">
                <TitleComponent type="h3" className="text-slate-900 font-black text-xl">
                    Content Preview
                </TitleComponent>
                <div className="space-y-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Subject Line</p>
                    <p className="p-4 bg-slate-50 rounded-[8px] font-bold text-slate-700">
                        {campaign.subjectLine || campaign.subject || 'No subject set'}
                    </p>
                </div>
                <div className="space-y-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Body</p>
                    <div className="p-8 bg-slate-50 rounded-[8px] text-slate-600 font-medium leading-relaxed prose prose-slate max-w-none">
                        <div
                            dangerouslySetInnerHTML={{
                                __html: campaign.emailBodyHTML || campaign.emailContent || campaign.body || 'No content set.',
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* ── A/B Testing Visualization ─────────────────────────────────── */}
            <div className="bg-white rounded-[8px] shadow-sm border border-slate-100 p-10">
                <ABTestResults />
            </div>

            {/* ── Scaling Visualization ─────────────────────────────────────── */}
            <ScalingVisualization />

            {/* ── AI Optimization Insight ───────────────────────────────────── */}
            <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[8px] flex items-start gap-6">
                <div className="w-12 h-12 bg-white rounded-[8px] flex items-center justify-center border border-indigo-100 shadow-sm shrink-0">
                    <i className="fas fa-lightbulb text-indigo-600" />
                </div>
                <div className="space-y-1">
                    <h4 className="text-lg font-bold text-indigo-900">AI Optimization Insight</h4>
                    <p className="text-sm text-indigo-700 leading-relaxed font-medium">
                        Based on the current{' '}
                        <span className="font-bold">Yield Rate of {stats.yieldRate}</span>,
                        our AI recommends continuing the current template strategy.
                        Engagement is within the top 10% of industry benchmarks for your industry.
                    </p>
                </div>
            </div>

        </div>
    );
};

export default CampaignDetail;
