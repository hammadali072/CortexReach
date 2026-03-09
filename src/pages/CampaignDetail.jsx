import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import TitleComponent from '../components/titleComponent/titleComponent';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ABTestResults from '../components/ui/ABTestResults';
import ScalingVisualization from '../components/ui/ScalingVisualization';
import { getCampaign, getCampaignAudienceCount, getCampaignSends } from '../services/db';
import { useAuth } from '../context/AuthContext';

const CampaignDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [campaign, setCampaign] = useState(null);
    const [stats, setStats] = useState({
        totalLeads: 0,
        opened: 0,
        replied: 0,
        yieldRate: '0%'
    });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

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

            const yieldVal = audienceCount > 0 ? ((opened / audienceCount) * 100).toFixed(1) : '0';

            setCampaign(data);
            setStats({
                totalLeads: audienceCount || data.totalLeads || 0,
                opened,
                replied,
                yieldRate: `${yieldVal}%`
            });
        } catch (err) {
            console.error('[CampaignDetail] load error:', err);
        } finally {
            setLoading(false);
        }
    }, [id, currentUser]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // handleLaunch removed (deprecated SendGrid)

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

    const statusVariant = (status) => {
        const map = { draft: 'default', scheduled: 'info', sent: 'primary', completed: 'success' }
        return map[status] || 'default'
    }

    return (
        <div className="min-h-screen space-y-10 pb-12">
            {/* breadcrumbs & Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Link to="/dashboard/campaigns" className="text-slate-400 hover:text-slate-600 transition-colors">
                        <Badge variant="default">Campaigns</Badge>
                    </Link>
                    <span className="text-slate-300">/</span>
                    <Badge variant={statusVariant(campaign.status)} className="uppercase tracking-widest">{campaign.status}</Badge>
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
                    <div className="flex gap-4">
                        {campaign.status === 'draft' ? (
                            <>
                                <Link to={`/dashboard/campaigns/${id}/edit`}>
                                    <Button variant="outline" className="border-slate-200">
                                        <i className="fas fa-edit mr-2"></i>
                                        Edit Content
                                    </Button>
                                </Link>
                                <button
                                    className="px-6 h-12 bg-slate-100 text-slate-400 font-bold rounded-[8px] cursor-not-allowed"
                                    disabled
                                >
                                    Launch Disabled
                                </button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" className="border-slate-200">
                                    <i className="fas fa-pause mr-2"></i>
                                    Pause Campaign
                                </Button>
                                <Button variant="primary" className="bg-slate-900 text-white cursor-default">
                                    <i className="fas fa-check-circle mr-2"></i>
                                    Live
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Audience', value: stats.totalLeads, icon: 'fa-users', color: 'text-blue-500' },
                    { label: 'Opened', value: stats.opened, icon: 'fa-envelope-open', color: 'text-emerald-500' },
                    { label: 'Replied', value: stats.replied, icon: 'fa-reply', color: 'text-indigo-500' },
                    { label: 'Yield Rate', value: stats.yieldRate, icon: 'fa-chart-line', color: 'text-purple-500' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[8px] border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-10 h-10 rounded-[8px] bg-slate-50 flex items-center justify-center ${stat.color}`}>
                                <i className={`fas ${stat.icon}`}></i>
                            </div>
                            <Badge variant="default">All Time</Badge>
                        </div>
                        <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Campaign Content Preview */}
            <div className="bg-white rounded-[8px] shadow-sm border border-slate-100 p-10 space-y-4">
                <TitleComponent type="h3" className="text-slate-900 font-black text-xl">Content Preview</TitleComponent>
                <div className="space-y-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Subject Line</p>
                    <p className="p-4 bg-slate-50 rounded-[8px] font-bold text-slate-700">{campaign.subjectLine || campaign.subject || 'No subject set'}</p>
                </div>
                <div className="space-y-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Body</p>
                    <div className="p-8 bg-slate-50 rounded-[8px] text-slate-600 font-medium leading-relaxed prose prose-slate max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: campaign.emailBodyHTML || campaign.emailContent || campaign.body || 'No content set.' }} />
                    </div>
                </div>
            </div>

            {/* Phase 4: A/B Testing Visualization */}
            <div className="bg-white rounded-[8px] shadow-sm border border-slate-100 p-10">
                <ABTestResults />
            </div>

            {/* Phase 6: Scaling Visualization */}
            <ScalingVisualization />

            {/* Bottom Insights Callout */}
            <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[8px] flex items-start gap-6">
                <div className="w-12 h-12 bg-white rounded-[8px] flex items-center justify-center border border-indigo-100 shadow-sm shrink-0">
                    <i className="fas fa-lightbulb text-indigo-600"></i>
                </div>
                <div className="space-y-1">
                    <h4 className="text-lg font-bold text-indigo-900">AI Optimization Insight</h4>
                    <p className="text-sm text-indigo-700 leading-relaxed font-medium">
                        Based on the current <span className="font-bold">Yield Rate of {stats.yieldRate}</span>, our AI recommends continuing the current template strategy. Engagement is within the top 10% of industry benchmarks for your industry.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CampaignDetail;
