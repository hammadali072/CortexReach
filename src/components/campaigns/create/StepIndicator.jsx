import React from 'react';

const steps = [
    { number: 1, title: 'Project', icon: 'fa-folder' },
    { number: 2, title: 'Type', icon: 'fa-tags' },
    { number: 3, title: 'Template', icon: 'fa-file-alt' },
    { number: 4, title: 'Generate', icon: 'fa-magic' },
    { number: 5, title: 'Edit', icon: 'fa-edit' },
    { number: 6, title: 'Audience', icon: 'fa-users' },
    { number: 7, title: 'Review', icon: 'fa-save' }
];

const StepIndicator = ({ currentStep }) => {
    return (
        <div className="bg-white rounded-[16px] shadow-sm border border-slate-100 p-6 overflow-x-auto">
            <div className="flex justify-between gap-4 min-w-[600px]">
                {steps.map((st, i) => (
                    <div key={`step-${st.number}`} className="flex flex-col items-center flex-1 relative">
                        <div 
                            className={`z-10 w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${
                                currentStep === st.number 
                                    ? 'bg-primary text-white scale-110 shadow-brand' 
                                    : currentStep > st.number 
                                        ? 'bg-emerald-500 text-white' 
                                        : 'bg-slate-100 text-slate-400'
                            }`}
                        >
                            {currentStep > st.number ? <i className="fas fa-check text-xs" /> : st.number}
                        </div>
                        <span 
                            className={`mt-2 text-[10px] font-black uppercase tracking-tighter text-center ${
                                currentStep === st.number ? 'text-primary' : 'text-slate-400'
                            }`}
                        >
                            {st.title}
                        </span>
                        {i < steps.length - 1 && (
                            <div className="absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-[2px] bg-slate-50" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StepIndicator;
