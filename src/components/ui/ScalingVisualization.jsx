import React from 'react';
import Badge from './Badge';

const ScalingVisualization = () => {
    return (
        <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

            <div className="relative z-10 space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 bg-indigo-500 rounded flex items-center justify-center">
                                <i className="fas fa-rocket text-[10px] text-white"></i>
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Scaling Strategy</p>
                        </div>
                        <h3 className="text-3xl font-black font-idGrotesk">Full Audience Deployment</h3>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-indigo-500/20 border border-indigo-500/30 px-6 py-4 rounded-[24px] text-center min-w-[140px]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-1">Estimated ROI</p>
                            <p className="text-2xl font-black text-white">$14.4K</p>
                        </div>
                        <div className="bg-emerald-500/20 border border-emerald-500/30 px-6 py-4 rounded-[24px] text-center min-w-[140px]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-1">Confidence</p>
                            <p className="text-2xl font-black text-white">92%</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-12 max-w-2xl">
                    {/* Step 1 */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <span className="w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center text-[10px] text-emerald-400 border border-emerald-500/30">
                                        <i className="fas fa-check"></i>
                                    </span>
                                    Phase 1: A/B Testing
                                </p>
                                <p className="text-sm font-bold text-slate-300 ml-7 mt-1">Validated on 450 initial leads</p>
                            </div>
                            <span className="text-xs font-black text-emerald-400">COMPLETE</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                                    <span className="w-5 h-5 bg-indigo-500/20 rounded-full flex items-center justify-center text-[10px] text-indigo-400 border border-indigo-500/50 animate-pulse">
                                        <i className="fas fa-satellite-dish"></i>
                                    </span>
                                    Phase 2: Scale Deployment
                                </p>
                                <p className="text-sm font-bold text-slate-300 ml-7 mt-1">Deploying "Template A" to remaining 1,750 leads</p>
                            </div>
                            <span className="text-xs font-black text-indigo-400 animate-pulse">EXECUTING (64%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: '64%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center gap-6">
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-10 h-10 rounded-xl border-2 border-slate-900 overflow-hidden">
                                <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Target" className="w-full h-full object-cover grayscale opacity-50" />
                            </div>
                        ))}
                        <div className="w-10 h-10 rounded-xl border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                            +1.7K
                        </div>
                    </div>
                    <p className="text-xs font-medium text-slate-400">
                        Our AI has prioritized high-relevance leads from your sourcing batch for immediate scaling based on the winning engagement signals.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ScalingVisualization;
