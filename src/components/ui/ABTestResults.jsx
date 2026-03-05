import React from 'react';
import Badge from './Badge';

const ABTestResults = () => {
    const testData = [
        {
            id: 1,
            name: "Template A (Executive)",
            openRate: 64,
            clickRate: 22,
            replyRate: 12,
            leadsTested: 150,
            isWinner: true
        },
        {
            id: 2,
            name: "Template B (Growth)",
            openRate: 42,
            clickRate: 15,
            replyRate: 5,
            leadsTested: 150,
            isWinner: false
        },
        {
            id: 3,
            name: "Template C (Direct)",
            openRate: 55,
            clickRate: 18,
            replyRate: 8,
            leadsTested: 150,
            isWinner: false
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Template Performance Testing</h3>
                    <p className="text-sm text-slate-500 font-medium">Real-time comparison of AI-generated outreach models.</p>
                </div>
                <Badge variant="success" className="animate-pulse">Live A/B Testing</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testData.map((test) => (
                    <div
                        key={test.id}
                        className={`p-6 rounded-[8px] border transition-all duration-500 relative overflow-hidden ${test.isWinner
                                ? 'bg-white border-indigo-200 shadow-2xl shadow-indigo-100 ring-1 ring-indigo-50'
                                : 'bg-slate-50 border-slate-100'
                            }`}
                    >
                        {test.isWinner && (
                            <div className="absolute top-4 right-4 animate-bounce">
                                <Badge variant="success" className="bg-emerald-500 text-white border-0 py-1 px-3 shadow-lg shadow-emerald-100 uppercase tracking-widest text-[10px]">Winning Model</Badge>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Variant Name</p>
                                <h4 className="font-bold text-slate-900">{test.name}</h4>
                                <p className="text-xs text-slate-500 mt-1 font-medium">{test.leadsTested} leads tested in initial batch</p>
                            </div>

                            {/* Stats Grid */}
                            <div className="space-y-4">
                                {/* Open Rate */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                        <span className="text-slate-400">Open Rate</span>
                                        <span className="text-indigo-600">{test.openRate}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-[8px] overflow-hidden">
                                        <div
                                            className={`h-full rounded-[8px] transition-all duration-1000 ease-out delay-300 ${test.isWinner ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                            style={{ width: `${test.openRate}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Click Rate */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                        <span className="text-slate-400">Click Rate</span>
                                        <span className="text-blue-500">{test.clickRate}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-[8px] overflow-hidden">
                                        <div
                                            className={`h-full rounded-[8px] transition-all duration-1000 ease-out delay-500 ${test.isWinner ? 'bg-blue-500' : 'bg-slate-300'}`}
                                            style={{ width: `${test.clickRate}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Reply Rate */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                        <span className="text-slate-400">Reply Rate</span>
                                        <span className="text-emerald-500">{test.replyRate}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-[8px] overflow-hidden">
                                        <div
                                            className={`h-full rounded-[8px] transition-all duration-1000 ease-out delay-700 ${test.isWinner ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                            style={{ width: `${test.replyRate}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <div className={`p-3 rounded-[8px] text-[10px] font-black text-center uppercase tracking-widest ${test.isWinner ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200/50 text-slate-400'
                                    }`}>
                                    {test.isWinner ? 'Validated for Scaling' : 'Low Relevance Detected'}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ABTestResults;
