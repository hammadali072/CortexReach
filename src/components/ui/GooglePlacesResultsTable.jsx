import PropTypes from 'prop-types';
import EmailExtractionCell from './EmailExtractionCell';

// ─── Star rating display ─────────────────────────────────────────────────────
const StarRating = ({ rating }) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
        <div className="flex items-center gap-1">
            <div className="flex">
                {[...Array(full)].map((_, i) => (
                    <i key={`f${i}`} className="fas fa-star text-amber-400 text-[11px]" />
                ))}
                {half && <i className="fas fa-star-half-alt text-amber-400 text-[11px]" />}
                {[...Array(empty)].map((_, i) => (
                    <i key={`e${i}`} className="far fa-star text-slate-200 text-[11px]" />
                ))}
            </div>
            <span className="text-[11px] font-bold text-slate-500 ml-1">{rating.toFixed(1)}</span>
        </div>
    );
};

// ─── Select-all checkbox header ──────────────────────────────────────────────
const SelectAllHeader = ({ allSelected, someSelected, onToggle }) => (
    <input
        type="checkbox"
        checked={allSelected}
        ref={(el) => {
            if (el) el.indeterminate = someSelected && !allSelected;
        }}
        onChange={onToggle}
        className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
        title={allSelected ? 'Deselect all' : 'Select all'}
    />
);

// ─── Main component ──────────────────────────────────────────────────────────
const GooglePlacesResultsTable = ({
    results,
    selectedIds,
    onSelectionChange,
    onExtractEmail,
    emailStates,
}) => {
    const allSelected = results.length > 0 && selectedIds.length === results.length;
    const someSelected = selectedIds.length > 0 && selectedIds.length < results.length;

    const handleToggleAll = () => {
        if (allSelected) {
            onSelectionChange([]);
        } else {
            onSelectionChange(results.map((r) => r.id));
        }
    };

    const handleToggleRow = (id) => {
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter((sid) => sid !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };

    const truncate = (str, max = 38) =>
        str && str.length > max ? str.slice(0, max) + '…' : str;

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-100">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    {/* Head */}
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-4 py-3 text-left w-10">
                                <SelectAllHeader
                                    allSelected={allSelected}
                                    someSelected={someSelected}
                                    onToggle={handleToggleAll}
                                />
                            </th>
                            <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">
                                Business Name
                            </th>
                            <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">
                                Address
                            </th>
                            <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">
                                Rating
                            </th>
                            <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">
                                Website
                            </th>
                            <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">
                                Email
                            </th>
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody className="divide-y divide-slate-50">
                        {results.map((row) => {
                            const isSelected = selectedIds.includes(row.id);
                            return (
                                <tr
                                    key={row.id}
                                    onClick={() => handleToggleRow(row.id)}
                                    className={`transition-colors duration-100 cursor-pointer ${isSelected
                                            ? 'bg-indigo-50/60'
                                            : 'bg-white hover:bg-slate-50/70'
                                        }`}
                                >
                                    {/* Checkbox */}
                                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleToggleRow(row.id)}
                                            className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                                        />
                                    </td>

                                    {/* Name + phone */}
                                    <td className="px-4 py-3.5">
                                        <div className="font-bold text-slate-900 text-sm leading-snug">
                                            {row.name}
                                        </div>
                                        {row.phone && (
                                            <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
                                                {row.phone}
                                            </div>
                                        )}
                                    </td>

                                    {/* Address */}
                                    <td className="px-4 py-3.5">
                                        <span
                                            className="text-[12px] text-slate-500 font-medium"
                                            title={row.address}
                                        >
                                            {truncate(row.address)}
                                        </span>
                                    </td>

                                    {/* Rating */}
                                    <td className="px-4 py-3.5 whitespace-nowrap">
                                        <StarRating rating={row.rating} />
                                    </td>

                                    {/* Website — stop row click so link works */}
                                    <td
                                        className="px-4 py-3.5"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {row.website ? (
                                            <a
                                                href={row.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-[12px] font-bold hover:underline underline-offset-2 transition-colors"
                                            >
                                                <i className="fas fa-external-link-alt text-[9px]" />
                                                {row.website
                                                    .replace(/^https?:\/\//, '')
                                                    .replace(/\/$/, '')}
                                            </a>
                                        ) : (
                                            <span className="text-[11px] text-slate-300 font-medium italic">
                                                —
                                            </span>
                                        )}
                                    </td>

                                    {/* Email extraction — stop row click so button works */}
                                    <td
                                        className="px-4 py-3.5"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <EmailExtractionCell
                                            placeId={row.id}
                                            website={row.website}
                                            extractionState={emailStates[row.id]}
                                            onExtract={onExtractEmail}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

GooglePlacesResultsTable.propTypes = {
    results: PropTypes.array.isRequired,
    selectedIds: PropTypes.array.isRequired,
    onSelectionChange: PropTypes.func.isRequired,
    onExtractEmail: PropTypes.func.isRequired,
    emailStates: PropTypes.object.isRequired,
};

export default GooglePlacesResultsTable;
