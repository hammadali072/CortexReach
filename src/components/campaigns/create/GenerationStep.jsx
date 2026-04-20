import React from 'react';
import Button from '../../ui/Button';

const GenerationStep = ({ onGenerate }) => {
    return (
        <div className="flex flex-col items-center justify-center space-y-8 py-20 animate-in fade-in zoom-in-95">
            <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-white shadow-brand">
                <i className="fas fa-magic text-4xl" />
            </div>
            <div className="text-center">
                <h2 className="text-3xl font-idGrotesk font-black text-slate-900 uppercase">Ready to Personalize</h2>
                <p className="text-slate-500 mt-2 max-w-sm">We'll inject your project features and benefits into the selected template.</p>
            </div>
            <Button 
                variant="primary" 
                onClick={onGenerate} 
                className="px-16 py-6 h-auto text-xl font-bold rounded-2xl"
            >
                Generate Email Content
            </Button>
        </div>
    );
};

export default GenerationStep;
