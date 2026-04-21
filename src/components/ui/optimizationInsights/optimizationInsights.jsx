import React from 'react';
import Badge from '../badge/badge';

const OptimizationInsights = () => {
    const insights = [
        {
            id: 1,
            icon: 'fa-heading',
            title: 'Improve Subject Clarity',
            recommendation: 'Your "Jan SME Outreach" campaign has a 14% lower open rate than the industry average. Shortening subject lines to 4-6 words could lift engagement by ~22%.',
            confidence: 'High',
            variant: 'indigo'
        },
        {
            id: 2,
            icon: 'fa-mouse-pointer',
            title: 'Move CTA Above Fold',
            recommendation: 'Heatmap analysis suggests 65% of leads stop scrolling before reaching your meeting link. Reposition your CTA within the first two paragraphs.',
            confidence: 'Critical',
            variant: 'red'
        },
        {
            id: 3,
            icon: 'fa-align-left',
            title: 'Reduce Body Length',
            recommendation: 'Templates with >150 words are seeing a 30% drop in reply yield. Aim for a "concise executive" style (75-100 words) for higher retention.',
            confidence: 'Moderate',
            variant: 'blue'
        },
        {
            id: 4,
            icon: 'fa-clock',
            title: 'Optimal Sending Window',
            recommendation: 'Your leads are most active between 9:00 AM and 11:00 AM EST. Adjusting your delivery schedule could improve immediate signal pickup.',
            confidence: 'High',
            variant: 'emerald'
        }
    ];

    const getConfidenceBadge = (level) => {
        switch (level) {
            case 'Critical': return <Badge variant="danger">{level}</Badge>;
            case 'High': return <Badge variant="success">{level}</Badge>;
            case 'Moderate': return <Badge variant="primary">{level}</Badge>;
            default: return <Badge variant="default">{level}</Badge>;
        }
    };

    const getIconColor = (variant) => {
        const colors = {
            indigo: 'text-indigo-600 bg-indigo-50',
            red: 'text-red-600 bg-red-50',
            blue: 'text-blue-600 bg-blue-50',
            emerald: 'text-emerald-600 bg-emerald-50'
        };
        return colors[variant] || colors.indigo;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="size-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
                    <i className="fas fa-wand-magic-sparkles text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900">AI Optimization Suggestions</h3>
                    <p className="text-sm text-slate-500 font-medium">Data-driven insights to maximize your outreach yield.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {insights.map((insight) => (
                    <div key={insight.id} className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`size-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${getIconColor(insight.variant)}`}>
                                <i className={`fas ${insight.icon} text-lg`} />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Confidence</p>
                                {getConfidenceBadge(insight.confidence)}
                            </div>
                        </div>

                        <h4 className="text-lg font-bold text-slate-900 mb-2">{insight.title}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                            {insight.recommendation}
                        </p>

                        <div className="mt-6 pt-4 border-t border-slate-50 flex justify-end">
                            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 flex items-center gap-2">
                                Apply Optimization
                                <i className="fas fa-arrow-right" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OptimizationInsights;


