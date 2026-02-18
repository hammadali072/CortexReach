import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';

const LeadSourcingModal = ({ isOpen, onClose, onGenerate }) => {
    const [persona, setPersona] = useState('');
    const [industry, setIndustry] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const personas = [
        "The Visionary CTO",
        "The Growth VP",
        "The Product Lead",
        "IT Infrastructure Manager",
        "Chief Revenue Officer"
    ];

    const industries = [
        "Enterprise SaaS",
        "FinTech",
        "E-commerce",
        "Healthcare Tech",
        "Artificial Intelligence",
        "Cybersecurity"
    ];

    const handleGenerate = () => {
        if (!persona || !industry) return;

        setIsGenerating(true);
        // Simulate generation delay
        setTimeout(() => {
            setIsGenerating(false);
            onGenerate({ persona, industry });
            onClose();
        }, 3000);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="AI Lead Sourcing"
            size="md"
            footer={
                <div className="flex gap-3 justify-end w-full">
                    <Button variant="outline" onClick={onClose} disabled={isGenerating}>Cancel</Button>
                    <Button
                        variant="primary"
                        onClick={handleGenerate}
                        disabled={isGenerating || !persona || !industry}
                        className="bg-indigo-600"
                    >
                        {isGenerating ? (
                            <span className="flex items-center gap-2">
                                <i className="fas fa-spinner fa-spin"></i>
                                Analyzing...
                            </span>
                        ) : (
                            'Generate Leads'
                        )}
                    </Button>
                </div>
            }
        >
            <div className="space-y-6 py-4">
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-4">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200">
                        <i className="fas fa-radar text-white"></i>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-indigo-900">AI Sourcing Engine</p>
                        <p className="text-xs text-indigo-700 leading-relaxed mt-1">Select your target parameters. Our AI will scan global signals to find leads matching your project's ideal profile.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Priority Persona</label>
                        <select
                            value={persona}
                            onChange={(e) => setPersona(e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700"
                        >
                            <option value="">Choose a Persona...</option>
                            {personas.map((p, i) => (
                                <option key={i} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Industry</label>
                        <select
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700"
                        >
                            <option value="">Select Industry...</option>
                            {industries.map((ind, i) => (
                                <option key={i} value={ind}>{ind}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {isGenerating && (
                    <div className="pt-4 space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                            <span>Hunting qualified leads...</span>
                            <span>74%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full animate-[shimmer_2s_infinite]" style={{ width: '74%' }}></div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default LeadSourcingModal;
