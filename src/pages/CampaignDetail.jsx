import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import TitleComponent from '../components/titleComponent/titleComponent';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ABTestResults from '../components/ui/ABTestResults';
import ScalingVisualization from '../components/ui/ScalingVisualization';

const CampaignDetail = () => {
    const { id } = useParams();

    // Mock campaign data
    const campaign = useMemo(() => {
        const campaigns = [
            { id: 1, name: 'Jan SME Outreach', status: 'Active', totalLeads: 1234, opened: 456, sentDate: '2026-01-15' },
            { id: 2, name: 'Growth Series B', status: 'Draft', totalLeads: 892, opened: 0, sentDate: '-' },
            { id: 3, name: 'Tech Stack Update', status: 'Completed', totalLeads: 2100, opened: 834, sentDate: '2026-01-10' }
        ];
        return campaigns.find(c => c.id.toString() === id.toString()) || campaigns[0];
    }, [id]);

    return (
        <div className="min-h-screen space-y-10 pb-12">
            {/* breadcrumbs & Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Link to="/dashboard/campaigns" className="text-slate-400 hover:text-slate-600 transition-colors">
                        <Badge variant="default">Campaigns</Badge>
                    </Link>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">{campaign.status}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <TitleComponent type="h1" className="text-slate-900 text-4xl font-black font-idGrotesk">
                            {campaign.name}
                        </TitleComponent>
                        <p className="text-slate-500 font-medium mt-1 italic">Launched on {campaign.sentDate}</p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="border-slate-200">
                            <i className="fas fa-pause mr-2"></i>
                            Pause Campaign
                        </Button>
                        <Button variant="primary" className="bg-indigo-600 shadow-xl shadow-indigo-100">
                            <i className="fas fa-edit mr-2"></i>
                            Edit Flow
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Audience', value: campaign.totalLeads, icon: 'fa-users', color: 'text-blue-500' },
                    { label: 'Opened', value: campaign.opened, icon: 'fa-envelope-open', color: 'text-emerald-500' },
                    { label: 'Reply Rate', value: '12.4%', icon: 'fa-reply', color: 'text-indigo-500' },
                    { label: 'Yield Rate', value: '24.1%', icon: 'fa-chart-line', color: 'text-purple-500' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${stat.color}`}>
                                <i className={`fas ${stat.icon}`}></i>
                            </div>
                            <Badge variant="default">24h</Badge>
                        </div>
                        <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Phase 4: A/B Testing Visualization */}
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-10">
                <ABTestResults />
            </div>

            {/* Phase 6: Scaling Visualization */}
            <ScalingVisualization />

            {/* Bottom Insights Callout */}
            <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[32px] flex items-start gap-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm shrink-0">
                    <i className="fas fa-lightbulb text-indigo-600"></i>
                </div>
                <div className="space-y-1">
                    <h4 className="text-lg font-bold text-indigo-900">AI Optimization Insight</h4>
                    <p className="text-sm text-indigo-700 leading-relaxed font-medium">
                        We've identified that <span className="font-bold">Template A</span> has a significantly higher retention rate among CTOs. Our scaling engine is now prioritizing the 1.7K remaining leads that fit this specific persona match to maximize your campaign yield.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CampaignDetail;
