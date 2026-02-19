import PropTypes from 'prop-types';

/**
 * EmailExtractionCell
 * Renders one of four visual states for the email extraction column:
 *
 *   'no-website' → "No Website" grey badge  (website is null)
 *   'idle'       → "Extract Email" button
 *   'loading'    → mini spinner + "Extracting…" label
 *   'done'       → email chip + green "Verified" badge
 */
const EmailExtractionCell = ({ placeId, website, extractionState, onExtract }) => {
    // ── No website ────────────────────────────────────────────────────────────
    if (!website) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-[11px] font-bold select-none">
                <i className="fas fa-ban text-[9px]" />
                No Website
            </span>
        );
    }

    const status = extractionState?.status ?? 'idle';

    // ── Loading ───────────────────────────────────────────────────────────────
    if (status === 'loading') {
        return (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 text-[11px] font-bold animate-in fade-in duration-200">
                <svg
                    className="w-3 h-3 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                </svg>
                Extracting…
            </span>
        );
    }

    // ── Done ─────────────────────────────────────────────────────────────────
    if (status === 'done') {
        return (
            <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="inline-flex items-center gap-1 text-[12px] font-bold text-slate-700">
                    <i className="fas fa-envelope text-[10px] text-indigo-400" />
                    {extractionState.email}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-black w-fit">
                    <i className="fas fa-shield-check text-[8px]" />
                    Verified
                </span>
            </div>
        );
    }

    // ── Idle (default) ────────────────────────────────────────────────────────
    return (
        <button
            onClick={() => onExtract(placeId)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-600 text-[11px] font-bold transition-all duration-150 border border-indigo-100 hover:border-indigo-200 hover:shadow-sm"
        >
            <i className="fas fa-at text-[10px]" />
            Extract Email
        </button>
    );
};

EmailExtractionCell.propTypes = {
    placeId: PropTypes.string.isRequired,
    website: PropTypes.string,
    extractionState: PropTypes.shape({
        status: PropTypes.oneOf(['idle', 'loading', 'done']),
        email: PropTypes.string,
    }),
    onExtract: PropTypes.func.isRequired,
};

export default EmailExtractionCell;
