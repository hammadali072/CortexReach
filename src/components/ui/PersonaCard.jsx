import React from 'react';
import Badge from './Badge';

const PersonaCard = ({ title, role, industry, painPoints, relevance }) => {
    return (
        <div className="bg-white rounded-[8px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-[8px][100px] -mr-10 -mt-10 group-hover:bg-indigo-100 transition-colors"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h4 className="text-lg font-bold text-slate-900 leading-tight mb-1">{title}</h4>
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{role}</p>
                    </div>
                    <Badge variant={relevance === 'High' ? 'success' : 'primary'}>
                        {relevance} Match
                    </Badge>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-[8px] bg-slate-50 flex items-center justify-center">
                        <i className="fas fa-building text-[10px] text-slate-400"></i>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{industry}</span>
                </div>

                <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pain Points</p>
                    <ul className="space-y-2">
                        {painPoints.map((point, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <div className="mt-1.5 w-1 h-1 rounded-[8px] bg-indigo-400 flex-shrink-0"></div>
                                <span className="text-xs text-slate-600 font-medium leading-relaxed">{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PersonaCard;
