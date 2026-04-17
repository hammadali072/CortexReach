import React from 'react';
import { Send, CheckCircle2, Mail, Reply, AlertCircle } from 'lucide-react';

const CampaignProgressCard = ({ stats = {} }) => {
    const { sent = 0, delivered = 0, opened = 0, replied = 0, bounced = 0 } = stats;

    const deliverPerc = sent > 0 ? ((delivered / sent) * 100) : 0;
    const openPerc = sent > 0 ? ((opened / sent) * 100) : 0;
    const replyPerc = sent > 0 ? ((replied / sent) * 100) : 0;
    const bouncePerc = sent > 0 ? ((bounced / sent) * 100) : 0;

    const metrics = [
        { label: 'Total Sent', value: sent, icon: Send, percentage: undefined },
        { label: 'Delivered', value: delivered, icon: CheckCircle2, percentage: deliverPerc },
        { label: 'Opened', value: opened, icon: Mail, percentage: openPerc },
        { label: 'Replied', value: replied, icon: Reply, percentage: replyPerc },
        { label: 'Bounced', value: bounced, icon: AlertCircle, percentage: bouncePerc },
    ];

    const funnelStages = [
        { label: 'Sent', count: sent, percentage: 100 },
        { label: 'Delivered', count: delivered, percentage: deliverPerc },
        { label: 'Opened', count: opened, percentage: openPerc },
        { label: 'Replied', count: replied, percentage: replyPerc },
    ];

    return (
        <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {metrics.map((m, i) => {
                    const Icon = m.icon;
                    return (
                        <div key={i} className="bg-surface rounded-xl border border-border shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-brand flex items-center justify-center">
                                    <Icon size={18} className="text-white" />
                                </div>
                                {m.percentage !== undefined && (
                                    <span className="text-xs font-medium text-muted">
                                        {m.percentage.toFixed(1)}%
                                    </span>
                                )}
                            </div>
                            <p className="text-2xl font-semibold text-dark">{m.value.toLocaleString()}</p>
                            <p className="text-xs font-medium tracking-wide text-muted uppercase mt-1">{m.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Funnel */}
            <div className="bg-surface rounded-xl border border-border shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-sm font-semibold text-dark">Conversion Funnel</h3>
                        <p className="text-xs text-subtle mt-0.5">From outreach to engagement</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {funnelStages.map((stage, idx) => (
                        <div key={idx}>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="font-medium text-dark">{stage.label}</span>
                                <span className="text-muted">{stage.count} ({stage.percentage.toFixed(1)}%)</span>
                            </div>
                            <div className="bg-white-tint h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-brand rounded-full transition-all duration-700"
                                    style={{ width: `${stage.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CampaignProgressCard;
