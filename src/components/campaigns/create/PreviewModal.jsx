import React from 'react';
import DOMPurify from 'dompurify';
import Button from '../../ui/button/button';

const PreviewModal = ({ isOpen, onClose, formData }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                role="button"
                tabIndex={0}
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') onClose();
                }}
                aria-label="Close preview modal backdrop"
            />
            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
                    <div>
                        <h3 className="text-lg font-black text-slate-900">Email Preview</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{formData.subject || 'No subject set'}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all font-bold"
                    >
                        <i className="fas fa-times" />
                    </button>
                </div>
                {/* iFrame preview */}
                <div className="p-4 bg-slate-50">
                    <iframe
                        srcDoc={DOMPurify.sanitize(formData.emailContent)}
                        title="Email campaign preview"
                        className="w-full rounded-xl border border-slate-200 bg-white shadow-inner"
                        style={{ height: '60vh', minHeight: 400 }}
                        sandbox="allow-same-origin"
                    />
                </div>
                {/* Footer */}
                <div className="px-8 py-4 border-t border-slate-100 flex justify-end">
                    <Button
                        variant="outline"
                        className="h-9 px-6 text-sm font-bold border-slate-200"
                        onClick={onClose}
                    >
                        Close Preview
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PreviewModal;



