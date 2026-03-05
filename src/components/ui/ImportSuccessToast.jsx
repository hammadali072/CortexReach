import PropTypes from 'prop-types';

/**
 * ImportSuccessToast
 * A fixed bottom-right toast that appears after leads are added to a project.
 * Auto-dismisses via a parent-managed timer; shows count + Google Maps branding.
 */
const ImportSuccessToast = ({ count, onClose }) => (
    <div
        className="fixed bottom-6 right-6 z-[9999] flex items-start gap-4 px-5 py-4 bg-white rounded-[8px] shadow-2xl shadow-slate-900/10 border border-slate-100 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500"
        role="status"
        aria-live="polite"
    >
        {/* Icon */}
        <div className="w-10 h-10 bg-emerald-500 rounded-[8px] flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-200">
            <i className="fas fa-check text-white text-sm" />
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-slate-900">
                {count} Lead{count !== 1 ? 's' : ''} Added!
            </p>
            <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                Successfully imported from{' '}
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                    <i className="fab fa-google text-[10px]" />
                    Google Maps
                </span>{' '}
                and added to this project.
            </p>

            {/* Progress bar — visual auto-dismiss indicator */}
            <div className="mt-3 h-1 w-full bg-slate-100 rounded-[8px] overflow-hidden">
                <div
                    className="h-full bg-emerald-400 rounded-[8px]"
                    style={{ animation: 'toastProgress 4s linear forwards' }}
                />
            </div>
        </div>

        {/* Close */}
        <button
            onClick={onClose}
            aria-label="Dismiss notification"
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-[8px] text-slate-300 hover:text-slate-500 hover:bg-slate-50 transition-all"
        >
            <i className="fas fa-times text-[10px]" />
        </button>

        {/* Keyframe scoped inside the component */}
        <style>{`
            @keyframes toastProgress {
                from { width: 100%; }
                to   { width: 0%; }
            }
        `}</style>
    </div>
);

ImportSuccessToast.propTypes = {
    count: PropTypes.number.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ImportSuccessToast;
