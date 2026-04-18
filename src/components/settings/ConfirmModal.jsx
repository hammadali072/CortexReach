import React, { useState, useEffect } from 'react';
import { TriangleAlert, X } from 'lucide-react';

const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    description, 
    confirmLabel = 'Confirm', 
    variant = 'danger',
    requireTyping = null, 
    requirePassword = false 
}) => {
    const [inputValue, setInputValue] = useState('');
    const [passwordValue, setPasswordValue] = useState('');

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            setInputValue('');
            setPasswordValue('');
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const isConfirmDisabled = (requireTyping && inputValue !== requireTyping) || (requirePassword && !passwordValue);

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="relative bg-white w-full max-w-md rounded-[20px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 sm:p-8">
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-all"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 animate-in slide-in-from-top-4 ${
                            variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                            <TriangleAlert size={32} />
                        </div>
                        
                        <h2 className="text-2xl font-black text-slate-900 mb-2 leading-tight">
                            {title}
                        </h2>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            {description}
                        </p>
                    </div>

                    <div className="mt-8 space-y-4">
                        {requireTyping && (
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                                    Type <span className="text-red-600 font-bold">{requireTyping}</span> to confirm
                                </label>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={requireTyping}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[12px] text-center font-bold text-slate-900 outline-none focus:ring-2 focus:ring-red-500 transition-all"
                                />
                            </div>
                        )}

                        {requirePassword && (
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Confirm with your Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordValue}
                                    onChange={(e) => setPasswordValue(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[12px] font-medium text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                        )}
                    </div>

                    <div className="mt-10 flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-[12px] font-black text-sm transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onConfirm(requirePassword ? passwordValue : null)}
                            disabled={isConfirmDisabled}
                            className={`flex-1 px-6 py-4 rounded-[12px] font-black text-sm transition-all shadow-lg ${
                                variant === 'danger'
                                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-100 disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 disabled:opacity-50'
                            }`}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
