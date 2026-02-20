import { useState, useMemo } from 'react';
import Modal from './Modal';
import Button from './Button';
import GooglePlacesResultsTable from './GooglePlacesResultsTable';
import { searchPlaces, extractEmailFromWebsite } from '../../services/googleMapsService';

// ─── Phase 5: Error simulation probabilities ─────────────────────────────────
const QUOTA_ERROR_CHANCE = 0.10;  // 10 % → quota exceeded
const API_ERROR_CHANCE = 0.20;  // next 10% → generic API error
const EMPTY_RESULT_CHANCE = 0.25;  // next 5% → empty result set

// ─── Mock email generator ────────────────────────────────────────────────────
const generateMockEmail = (businessName) => {
    const slug = businessName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .join('');
    return `info@${slug}.com`;
};

// ─── Shimmer skeleton row ────────────────────────────────────────────────────
const ShimmerRow = () => (
    <div className="flex items-center gap-4 py-4 border-b border-slate-50 animate-pulse">
        <div className="h-3 w-3 rounded bg-slate-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-200 rounded-full w-3/5" />
            <div className="h-2 bg-slate-100 rounded-full w-4/5" />
        </div>
        <div className="h-3 bg-slate-100 rounded-full w-12" />
        <div className="h-3 bg-slate-100 rounded-full w-24" />
        <div className="h-6 bg-slate-100 rounded-xl w-20" />
    </div>
);

// ─── Step indicator ──────────────────────────────────────────────────────────
const StepIndicator = ({ step }) => (
    <div className="flex items-center gap-2 mb-8">
        {['Search Parameters', 'Results'].map((label, i) => {
            const idx = i + 1;
            const active = step === idx;
            const done = step > idx;
            return (
                <div key={label} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${done ? 'bg-emerald-500 text-white'
                        : active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                        {done ? <i className="fas fa-check text-[10px]" /> : idx}
                    </div>
                    <span className={`text-xs font-bold tracking-wide ${active ? 'text-indigo-700' : done ? 'text-emerald-600' : 'text-slate-400'
                        }`}>{label}</span>
                    {i < 1 && (
                        <div className={`h-px w-8 transition-all duration-500 ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                    )}
                </div>
            );
        })}
    </div>
);

// ─── Field wrapper ───────────────────────────────────────────────────────────
const Field = ({ label, children }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
        {children}
    </div>
);

const inputClass = 'w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300';
const selectClass = 'w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700 cursor-pointer';

// ─── Phase 5: Search error banner ────────────────────────────────────────────
const SearchErrorBanner = ({ type, onRetry }) => {
    const isQuota = type === 'quota_exceeded';
    return (
        <div className={`p-5 rounded-2xl border flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-300 ${isQuota
            ? 'bg-amber-50 border-amber-200'
            : 'bg-red-50 border-red-200'
            }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isQuota ? 'bg-amber-500' : 'bg-red-500'
                }`}>
                <i className={`fas ${isQuota ? 'fa-tachometer-alt' : 'fa-wifi'} text-white text-sm`} />
            </div>
            <div className="flex-1">
                <p className={`text-sm font-black mb-1 ${isQuota ? 'text-amber-900' : 'text-red-900'}`}>
                    {isQuota ? 'API Quota Exceeded' : 'Search Request Failed'}
                </p>
                <p className={`text-xs leading-relaxed font-medium ${isQuota ? 'text-amber-700' : 'text-red-700'}`}>
                    {isQuota
                        ? 'Your Google Places API daily quota has been reached. This typically resets at midnight (Pacific Time). Try again later or upgrade your plan.'
                        : 'Unable to reach the Google Maps API. Please check your internet connection and try again. If the issue persists, the service may be temporarily unavailable.'}
                </p>
                <button
                    onClick={onRetry}
                    className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${isQuota
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                        : 'bg-red-100 hover:bg-red-200 text-red-800'
                        }`}
                >
                    <i className="fas fa-redo text-[9px]" />
                    Try Again
                </button>
            </div>
        </div>
    );
};

// ─── Phase 5: Empty results state ────────────────────────────────────────────
const EmptyResultsState = ({ keyword, location, onBack }) => (
    <div className="py-10 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
            <i className="fas fa-map-marker-alt text-slate-300 text-2xl" />
        </div>
        <div>
            <p className="font-black text-slate-700 text-lg">No Businesses Found</p>
            <p className="text-sm text-slate-400 font-medium mt-1 max-w-xs mx-auto leading-relaxed">
                No results for <span className="font-bold text-slate-600">"{keyword}"</span> in{' '}
                <span className="font-bold text-slate-600">{location}</span>. Try a broader keyword or different location.
            </p>
        </div>
        <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all"
        >
            <i className="fas fa-arrow-left text-[10px]" />
            Modify Search
        </button>
    </div>
);

// ─── Import Summary Bar ──────────────────────────────────────────────────────
const ImportSummaryBar = ({ total, selected, emailsDone, limit }) => (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl">
        <div className="flex items-center gap-3 text-xs font-bold text-slate-500 flex-wrap">
            <span className="inline-flex items-center gap-1.5">
                <i className="fas fa-building text-slate-400" />
                {total} of {limit} results shown
            </span>
            <span className="text-slate-300">|</span>
            <span className={`inline-flex items-center gap-1.5 transition-colors ${selected > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                <i className="fas fa-check-square" />
                {selected} selected
            </span>
            {emailsDone > 0 && (
                <>
                    <span className="text-slate-300">|</span>
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 animate-in fade-in duration-300">
                        <i className="fas fa-envelope-open-text" />
                        {emailsDone} email{emailsDone !== 1 ? 's' : ''} extracted
                    </span>
                </>
            )}
        </div>
        {selected > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 text-[11px] font-black rounded-xl animate-in fade-in duration-200">
                <i className="fas fa-arrow-right text-[9px]" />
                Ready to add
            </span>
        )}
    </div>
);

// ─── Main Modal ──────────────────────────────────────────────────────────────
const GoogleMapsImportModal = ({ isOpen, onClose, onAddLeads }) => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [searchError, setSearchError] = useState(null); // null | 'api_error' | 'quota_exceeded'

    // Form
    const [keyword, setKeyword] = useState('');
    const [location, setLocation] = useState('');
    const [radius, setRadius] = useState('5km');
    const [resultLimit, setResultLimit] = useState('20');

    // Results
    const [results, setResults] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);

    // Email extraction map
    const [emailStates, setEmailStates] = useState({});

    const canSearch = keyword.trim().length > 0 && location.trim().length > 0;

    // Slice to the chosen limit
    const visibleResults = useMemo(
        () => results.slice(0, parseInt(resultLimit, 10)),
        [results, resultLimit]
    );

    const emailsDone = useMemo(
        () => Object.values(emailStates).filter((s) => s.status === 'done').length,
        [emailStates]
    );

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleSearch = async () => {
        if (!canSearch) return;
        setIsLoading(true);
        setSearchError(null);
        setSelectedIds([]);
        setEmailStates({});

        try {
            const data = await searchPlaces(keyword, location);
            setResults(data);
            setStep(2);
        } catch (error) {
            console.error('Search error:', error);
            if (error.message.includes('quota')) {
                setSearchError('quota_exceeded');
            } else {
                setSearchError('api_error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleExtractEmail = async (placeId) => {
        if (emailStates[placeId]?.status === 'loading' || emailStates[placeId]?.status === 'done') return;

        setEmailStates((prev) => ({ ...prev, [placeId]: { status: 'loading', email: null } }));

        try {
            // 1. Fetch deep details to get the website
            const { fetchPlaceDetails } = await import('../../services/googleMapsService');
            const details = await fetchPlaceDetails(placeId);

            if (!details || !details.website) {
                setEmailStates((prev) => ({ ...prev, [placeId]: { status: 'done', email: null } }));
                return;
            }

            // 2. Update results UI with phone/website info
            setResults(prev => prev.map(r => r.id === placeId ? {
                ...r,
                website: details.website,
                phone: details.formatted_phone_number
            } : r));

            // 3. Extract email
            const email = await extractEmailFromWebsite(details.website);
            setEmailStates((prev) => ({ ...prev, [placeId]: { status: 'done', email: email } }));
        } catch (error) {
            console.error('Extraction error:', error);
            setEmailStates((prev) => ({ ...prev, [placeId]: { status: 'failed', email: null } }));
        }
    };

    const handleAddToProject = () => {
        const leads = selectedIds.map((id) => {
            const business = visibleResults.find((r) => r.id === id);
            const emailEntry = emailStates[id];
            return {
                id: `gmaps-${id}-${Date.now()}`,
                name: business.name,
                email: emailEntry?.status === 'done' ? emailEntry.email : null,
                phone: business.phone || null,
                website: business.website || null,
                company: business.name,
                source: 'Google Maps',
                relevanceScore: Math.floor(Math.random() * 36) + 60,
                relevance: 'Medium',
                status: 'New',
            };
        });

        if (onAddLeads) onAddLeads(leads);
        handleClose();
    };

    const handleClose = () => {
        setStep(1);
        setIsLoading(false);
        setSearchError(null);
        setKeyword('');
        setLocation('');
        setRadius('5km');
        setResultLimit('20');
        setResults([]);
        setSelectedIds([]);
        setEmailStates({});
        onClose();
    };

    // ── Footer per step ────────────────────────────────────────────────────────
    const footer = step === 1 ? (
        <div className="flex gap-3 justify-between w-full">
            <Button
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl"
            >
                Cancel
            </Button>
            <Button
                variant="primary"
                onClick={handleSearch}
                disabled={!canSearch || isLoading}
                className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-100 rounded-xl px-8"
            >
                {isLoading ? (
                    <span className="flex items-center gap-2"><i className="fas fa-spinner fa-spin" />Searching...</span>
                ) : (
                    <span className="flex items-center gap-2"><i className="fas fa-search" />Search Google Maps</span>
                )}
            </Button>
        </div>
    ) : (
        <div className="flex gap-3 justify-between w-full">
            <Button
                variant="outline"
                onClick={() => { setStep(1); setSelectedIds([]); }}
                className="border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl"
            >
                <i className="fas fa-arrow-left mr-2" />New Search
            </Button>
            <Button
                variant="primary"
                onClick={handleAddToProject}
                disabled={selectedIds.length === 0}
                className={`rounded-xl px-8 transition-all ${selectedIds.length > 0
                    ? 'bg-indigo-600 shadow-lg shadow-indigo-100'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-70'
                    }`}
            >
                <span className="flex items-center gap-2">
                    <i className="fas fa-plus-circle" />
                    Add {selectedIds.length > 0 ? `${selectedIds.length} ` : ''}Lead{selectedIds.length !== 1 ? 's' : ''} to Project
                </span>
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Import from Google Maps"
            size="xl"
            footer={footer}
        >
            <div className="space-y-6 py-2">
                <StepIndicator step={step} />

                {/* ── STEP 1: Search Form ── */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">

                        {/* Phase 5: Error banner */}
                        {searchError && (
                            <SearchErrorBanner
                                type={searchError}
                                onRetry={() => { setSearchError(null); handleSearch(); }}
                            />
                        )}

                        {/* Info banner */}
                        <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-start gap-4">
                            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-200">
                                <i className="fab fa-google text-white text-sm" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-green-900">Google Maps Business Search</p>
                                <p className="text-xs text-green-700 leading-relaxed mt-1">
                                    Search local businesses by keyword and location. We'll extract contact details
                                    and emails to accelerate your lead pipeline.
                                </p>
                            </div>
                        </div>

                        {/* Form fields */}
                        <div className="grid grid-cols-1 gap-5">
                            <Field label="Business Keyword">
                                <input
                                    id="gmaps-keyword"
                                    type="text"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    placeholder="e.g.  Digital Marketing Agency, SaaS Company..."
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Location / City">
                                <input
                                    id="gmaps-location"
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g.  New York, San Francisco, London..."
                                    className={inputClass}
                                />
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Search Radius">
                                    <select id="gmaps-radius" value={radius} onChange={(e) => setRadius(e.target.value)} className={selectClass}>
                                        <option value="1km">1 km</option>
                                        <option value="5km">5 km</option>
                                        <option value="10km">10 km</option>
                                        <option value="20km">20 km</option>
                                    </select>
                                </Field>
                                <Field label="Max Results">
                                    <select id="gmaps-limit" value={resultLimit} onChange={(e) => setResultLimit(e.target.value)} className={selectClass}>
                                        <option value="10">10 results</option>
                                        <option value="20">20 results</option>
                                        <option value="50">50 results</option>
                                    </select>
                                </Field>
                            </div>
                        </div>

                        {/* Loading shimmer */}
                        {isLoading && (
                            <div className="pt-4 space-y-1 animate-in fade-in duration-300">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Scanning Google Maps...</span>
                                    <span className="text-[10px] font-black text-green-600">
                                        <i className="fas fa-spinner fa-spin mr-1" />Please wait
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                                        style={{ animation: 'shimmerProgress 2s ease-in-out infinite' }}
                                    />
                                </div>
                                <div className="mt-4 border border-slate-100 rounded-2xl px-4 overflow-hidden">
                                    {[...Array(4)].map((_, i) => <ShimmerRow key={i} />)}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── STEP 2: Results ── */}
                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">

                        {/* Search summary chips */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-xl">
                                <i className="fas fa-search text-[9px] text-slate-400" />{keyword}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-xl">
                                <i className="fas fa-map-marker-alt text-[9px] text-green-500" />{location}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-xl">
                                <i className="fas fa-bullseye text-[9px] text-indigo-500" />{radius}
                            </span>
                        </div>

                        {/* Phase 5: Empty results */}
                        {visibleResults.length === 0 ? (
                            <EmptyResultsState
                                keyword={keyword}
                                location={location}
                                onBack={() => setStep(1)}
                            />
                        ) : (
                            <>
                                {/* Summary bar */}
                                <ImportSummaryBar
                                    total={visibleResults.length}
                                    selected={selectedIds.length}
                                    emailsDone={emailsDone}
                                    limit={resultLimit}
                                />

                                {/* First-use hint */}
                                {emailsDone === 0 && (
                                    <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-100 rounded-xl animate-in fade-in duration-300">
                                        <i className="fas fa-lightbulb text-amber-500 text-sm flex-shrink-0" />
                                        <p className="text-[11px] text-amber-700 font-medium">
                                            Click <span className="font-black">Extract Email</span> on any row to simulate scraping that business's website for a contact email.
                                        </p>
                                    </div>
                                )}

                                {/* Results table */}
                                <GooglePlacesResultsTable
                                    results={visibleResults}
                                    selectedIds={selectedIds}
                                    onSelectionChange={setSelectedIds}
                                    onExtractEmail={handleExtractEmail}
                                    emailStates={emailStates}
                                />
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Shimmer keyframe */}
            <style>{`
                @keyframes shimmerProgress {
                    0%   { width: 20%; }
                    50%  { width: 80%; }
                    100% { width: 20%; }
                }
            `}</style>
        </Modal>
    );
};

export default GoogleMapsImportModal;
