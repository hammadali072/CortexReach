import React from 'react';
import Input from '../../ui/Input';

const CAMPAIGN_TYPES = [
    { id: 'brand_introduction', name: 'Brand Introduction', icon: 'fa-bullhorn', color: 'bg-blue-50 text-blue-600' },
    { id: 'product_pitch', name: 'Product Pitch', icon: 'fa-box-open', color: 'bg-emerald-50 text-emerald-600' },
    { id: 'problem_solution', name: 'Problem → Solution', icon: 'fa-lightbulb', color: 'bg-amber-50 text-amber-600' },
    { id: 'demo_request', name: 'Demo Request', icon: 'fa-calendar-check', color: 'bg-indigo-50 text-indigo-600' },
    { id: 'partnership', name: 'Partnership', icon: 'fa-handshake', color: 'bg-purple-50 text-purple-600' }
];

const CampaignTypeStep = ({ 
    campaignName, 
    campaignType, 
    onUpdate 
}) => {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 pt-4">
            <div className="max-w-xl mx-auto space-y-10">
                <Input 
                    id="campaign-name-input"
                    label="Campaign Name" 
                    placeholder="e.g. March Expansion Outreach" 
                    value={campaignName} 
                    onChange={e => onUpdate({ name: e.target.value })} 
                    required 
                />
                <div className="space-y-4">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                        Campaign Category
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {CAMPAIGN_TYPES.map(type => (
                            <button
                                key={`type-btn-${type.id}`}
                                onClick={() => onUpdate({ campaignType: type.id })}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                                    campaignType === type.id 
                                        ? 'border-primary bg-white-tint' 
                                        : 'border-slate-50 bg-white hover:border-slate-100'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type.color}`}>
                                    <i className={`fas ${type.icon}`} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tighter text-center">
                                    {type.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignTypeStep;
