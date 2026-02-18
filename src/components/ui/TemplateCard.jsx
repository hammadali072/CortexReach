import React from 'react';
import Badge from './Badge';

const TemplateCard = ({ template, isSelected, onSelect }) => {
    const { title, subject, body, tone, cta, prediction } = template;

    return (
        <div
            onClick={onSelect}
            className={`relative p-6 rounded-[32px] border-2 transition-all duration-300 cursor-pointer group hover:scale-[1.02] ${isSelected
                    ? 'border-indigo-600 bg-white shadow-2xl shadow-indigo-100 ring-4 ring-indigo-50'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-200'
                }`}
        >
            {/* Selection Indicator */}
            {isSelected && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg animate-in zoom-in duration-300">
                    <i className="fas fa-check text-xs"></i>
                </div>
            )}

            <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{title}</h4>
                        <div className="flex gap-2">
                            <Badge variant="info" className="text-[10px]">{tone}</Badge>
                            <Badge variant="default" className="text-[10px]">{cta}</Badge>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Prediction</p>
                        <Badge variant="success" className="bg-emerald-500 text-white border-0">{prediction}% Yield</Badge>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject Line</p>
                    <p className="text-sm font-bold text-slate-800 line-clamp-1 italic">"{subject}"</p>
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preview Body</p>
                    <div className="p-4 bg-white/50 rounded-2xl border border-slate-100/50">
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                            {body}
                        </p>
                    </div>
                </div>

                <button
                    className={`w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200/50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                        }`}
                >
                    {isSelected ? 'TEMPLATE SELECTED' : 'CHOOSE THIS MODEL'}
                </button>
            </div>
        </div>
    );
};

export default TemplateCard;
