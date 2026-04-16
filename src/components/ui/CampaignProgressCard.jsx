import React from 'react';
import Badge from './Badge';

const CampaignProgressCard = ({ stats = {} }) => {
    const { sent = 0, delivered = 0, opened = 0, replied = 0, bounced = 0 } = stats;

    const deliverPerc = sent > 0 ? ((delivered / sent) * 100) : 0;
    const openPerc = sent > 0 ? ((opened / sent) * 100) : 0;
    const replyPerc = opened > 0 ? ((replied / opened) * 100) : 0; // Reply rate usually based on opens

    const metrics = [
        { label: 'Total Sent', value: sent, icon: 'fa-paper-plane', color: 'text-slate-500', bg: 'bg-slate-500/5' },
        { label: 'Delivered', value: delivered, percentage: deliverPerc, icon: 'fa-check-circle', color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
        { label: 'Total Opens', value: opened, percentage: openPerc, icon: 'fa-envelope-open', color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
        { label: 'Replies', value: replied, percentage: replyPerc, icon: 'fa-reply', color: 'text-purple-500', bg: 'bg-purple-500/5', subLabel: 'from opens' },
        { label: 'Bounced', value: bounced, icon: 'fa-exclamation-triangle', color: 'text-rose-500', bg: 'bg-rose-500/5' }
    ];

    const funnelStages = [
        { label: 'Sent', count: sent, percentage: 100, color: 'from-slate-400 to-slate-500 shadow-slate-100' },
        { label: 'Opened', count: opened, percentage: openPerc, color: 'from-emerald-400 to-emerald-500 shadow-emerald-100' },
        { label: 'Replied', count: replied, percentage: (replied / sent * 100) || 0, color: 'from-purple-500 to-indigo-600 shadow-indigo-100' }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* ── Main Metrics Grid ─────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {metrics.map((m, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        {/* Subtle Background Icon */}
                        <i className={`fas ${m.icon} absolute -right-2 -bottom-2 text-6xl opacity-[0.03] group-hover:scale-110 transition-transform duration-500 ${m.color}`} />
                        
                        <div className="flex flex-col h-full justify-between relative z-10">
                            <div>
                                <div className={`w-10 h-10 ${m.bg} ${m.color} rounded-xl flex items-center justify-center mb-4 ring-1 ring-inset ring-black/5`}>
                                    <i className={`fas ${m.icon}`} />
                                </div>
                                <p className="text-3xl font-black text-slate-900 tracking-tight">{m.value.toLocaleString()}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{m.label}</p>
                            </div>
                            
                            {m.percentage !== undefined && (
                                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <span className={`text-[11px] font-bold ${m.color}`}>
                                        {m.percentage.toFixed(1)}% <span className="text-slate-400 font-medium ml-1">{m.subLabel || 'rate'}</span>
                                    </span>
                                    <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${m.color.replace('text', 'bg')} rounded-full`} style={{ width: `${m.percentage}%` }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Visual Funnel ─────────────────────────────────────── */}
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Growth Funnel</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">Measuring the journey from outreach to engagement.</p>
                    </div>
                    <Badge variant="default" className="bg-slate-50 text-slate-400 border-slate-200">Real-time Data</Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
                    {funnelStages.map((stage, i) => (
                        <div key={i} className="flex flex-col items-center relative gap-6">
                            {/* Connector Line */}
                            {i < funnelStages.length - 1 && (
                                <div className="hidden lg:block absolute top-[60px] -right-[50%] w-full h-[2px] bg-slate-100 z-0">
                                    <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-200" />
                                </div>
                            )}

                            {/* Circle Stage */}
                            <div className="relative z-10">
                                <div className={`w-32 h-32 rounded-full bg-slate-50 flex items-center justify-center p-3 border border-slate-100 shadow-inner group cursor-default transition-all duration-500 hover:scale-105`}>
                                    <div className={`w-full h-full rounded-full bg-gradient-to-br ${stage.color} flex flex-col items-center justify-center text-white shadow-xl ${stage.color.split(' ')[2]}`}>
                                        <span className="text-2xl font-black">{stage.count}</span>
                                        <span className="text-[9px] font-black uppercase tracking-tighter opacity-80">{stage.label}</span>
                                    </div>
                                    
                                    {/* Hover Ring */}
                                    <div className="absolute inset-[-4px] rounded-full border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>

                            {/* Label & Percentage */}
                            <div className="text-center space-y-1">
                                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{stage.label}</p>
                                <p className="text-[10px] font-bold text-slate-400 italic">
                                    {stage.percentage.toFixed(1)}% of audience
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CampaignProgressCard;
