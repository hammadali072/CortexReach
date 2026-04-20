import React from 'react';

const CAMPAIGN_TYPES = [
    { id: 'brand_introduction', name: 'Brand Introduction', icon: 'fa-bullhorn', color: 'bg-blue-50 text-blue-600' },
    { id: 'product_pitch', name: 'Product Pitch', icon: 'fa-box-open', color: 'bg-emerald-50 text-emerald-600' },
    { id: 'problem_solution', name: 'Problem → Solution', icon: 'fa-lightbulb', color: 'bg-amber-50 text-amber-600' },
    { id: 'demo_request', name: 'Demo Request', icon: 'fa-calendar-check', color: 'bg-indigo-50 text-indigo-600' },
    { id: 'partnership', name: 'Partnership', icon: 'fa-handshake', color: 'bg-purple-50 text-purple-600' }
];

const TemplateStep = ({ campaignType }) => {
    const activeType = CAMPAIGN_TYPES.find(ct => ct.id === campaignType);
    
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 pt-4">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900">Confirm Outreach Template</h2>
                <p className="text-slate-500 mt-2">Personalizing the "{activeType?.name}" React Email layout.</p>
            </div>
            <div className="flex justify-center">
                {campaignType && (
                    <div className="p-10 rounded-[32px] border-2 border-primary bg-white-tint max-w-lg w-full text-center shadow-xl shadow-primary/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <i className={`fas ${activeType?.icon} text-6xl`} />
                        </div>
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm text-primary">
                            <i className="fas fa-magic text-2xl" />
                        </div>
                        <h4 className="font-black text-slate-900 text-xl uppercase tracking-tight">
                            {activeType?.name}
                        </h4>
                        <p className="text-sm text-slate-500 mt-3 leading-relaxed font-medium">
                            Our high-converting, responsive React layout including personalized company features, lead variables, and custom branding.
                        </p>
                        <div className="mt-8 pt-8 border-t border-primary/10 flex justify-center gap-4">
                            <span className="text-[10px] font-black uppercase text-primary/60 tracking-widest bg-white px-3 py-1 rounded-full shadow-sm">Variable Engine</span>
                            <span className="text-[10px] font-black uppercase text-primary/60 tracking-widest bg-white px-3 py-1 rounded-full shadow-sm">Auto-Branding</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TemplateStep;
