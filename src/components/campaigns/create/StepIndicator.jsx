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
        <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-4 lg:p-6 overflow-x-auto">
            <div className="flex justify-between gap-4 min-w-[500px]">
                {steps.map((st, i) => (
                    <div key={`step-${st.number}`} className="flex flex-col items-center flex-1 relative">
                        <div 
                            className={`z-10 size-9 lg:size-10 rounded-xl flex items-center justify-center font-bold transition-all duration-300 ${
                                currentStep === st.number 
                                    ? 'bg-gradient-brand text-white scale-110 shadow-brand ring-4 ring-primary/10' 
                                    : currentStep > st.number 
                                        ? 'bg-emerald-500 text-white shadow-sm' 
                                        : 'bg-slate-50 text-slate-400 border border-slate-100'
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



