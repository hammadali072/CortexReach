import React, { useState } from 'react';
import Button from './Button';
import Badge from './Badge';
import PersonaCard from './PersonaCard';
import TitleComponent from '../titleComponent/titleComponent';

const AIAnalysisCard = () => {
    const [status, setStatus] = useState('idle'); // idle, analyzing, completed

    const mockPersonas = [
        {
            title: "The Visionary CTO",
            role: "Technical Decision Maker",
            industry: "Enterprise SaaS",
            relevance: "High",
            painPoints: ["Scaling legacy infrastructure", "High developer churn", "Cost optimization"]
        },
        {
            title: "The Growth VP",
            role: "Strategic Executive",
            industry: "FinTech / E-commerce",
            relevance: "Medium",
            painPoints: ["Slowing customer acquisition", "Market fragmentation", "Retention strategies"]
        },
        {
            title: "The Product Lead",
            role: "Operational Manager",
            industry: "Product-Led Growth",
            relevance: "High",
            painPoints: ["Feature prioritization", "User onboarding friction", "Data-driven insights"]
        }
    ];

    const suggestedSegments = [
        "SaaS Founders", "Digital Transformation Leads", "Enterprise Architects",
        "Innovators", "Series B Startups", "Tech Evangelists", "Cloud Strategists"
    ];

    const handleRunAnalysis = () => {
        setStatus('analyzing');
        setTimeout(() => {
            setStatus('completed');
        }, 2500);
    };

    return (
        <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
                            <i className="fas fa-sparkles text-[10px] text-white"></i>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">AI Product Intelligence</h3>
                    </div>
                    <p className="text-sm text-slate-500 font-medium ml-7">Deep analysis of product-market fit based on your project scope.</p>
                </div>

                {status === 'idle' && (
                    <Button variant="primary" onClick={handleRunAnalysis} className="bg-indigo-600 hover:bg-indigo-700">
                        <i className="fas fa-microchip mr-2"></i>
                        Run AI Analysis
                    </Button>
                )}
            </div>

            {status === 'analyzing' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-slate-50 h-64 rounded-[8px] border border-slate-100 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                        </div>
                    ))}
                </div>
            )}

            {status === 'completed' && (
                <>
                    <div className="space-y-4">
                        <TitleComponent type="p" size="small" className="text-slate-400 font-black uppercase tracking-widest px-1">
                            Generated Target Personas
                        </TitleComponent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {mockPersonas.map((persona, index) => (
                                <PersonaCard key={index} {...persona} />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <TitleComponent type="p" size="small" className="text-slate-400 font-black uppercase tracking-widest px-1">
                            Suggested Audience Segments
                        </TitleComponent>
                        <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar">
                            {suggestedSegments.map((segment, index) => (
                                <div key={index} className="flex-shrink-0 bg-indigo-50/50 border border-indigo-100 px-4 py-2 rounded-[8px] text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-default whitespace-nowrap">
                                    {segment}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AIAnalysisCard;
