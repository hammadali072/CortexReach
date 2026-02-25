/**
 * GoogleMapsImportModal.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Full B2B lead import pipeline:
 *   Step 1  →  Search Parameters (keyword, location, radius, pages, options)
 *   Step 2  →  Live progress (search → details → emails)
 *   Step 3  →  Results table with selection + DB save
 */

import { useState, useMemo, useCallback } from 'react';
import Modal from './Modal';
import Button from './Button';
import { generateLeads } from '../../services/googleMapsService';
import { bulkCreateLeads } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
const cls = (...parts) => parts.filter(Boolean).join(' ');

const Field = ({ label, children }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
        {children}
    </div>
);

const inputCls = 'w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300';
const selectCls = 'w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700 cursor-pointer';

// ─── Step indicator ───────────────────────────────────────────────────────────
const STEPS = ['Parameters', 'Scanning', 'Results'];

const StepIndicator = ({ step }) => (
    <div className="flex items-center gap-2 mb-6">
        {STEPS.map((label, i) => {
            const idx = i + 1;
            const active = step === idx;
            const done = step > idx;
            return (
                <div key={label} className="flex items-center gap-2">
                    <div className={cls(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300',
                        done ? 'bg-emerald-500 text-white' : active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-400'
                    )}>
                        {done ? <i className="fas fa-check text-[10px]" /> : idx}
                    </div>
                    <span className={cls('text-xs font-bold tracking-wide', active ? 'text-indigo-700' : done ? 'text-emerald-600' : 'text-slate-400')}>
                        {label}
                    </span>
                    {i < STEPS.length - 1 && (
                        <div className={cls('h-px w-8 transition-all duration-500', done ? 'bg-emerald-400' : 'bg-slate-200')} />
                    )}
                </div>
            );
        })}
    </div>
);

// ─── Progress stage row ───────────────────────────────────────────────────────
const ProgressRow = ({ icon, label, status, done, total }) => {
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <i className={cls(`fas ${icon}`, status === 'done' ? 'text-emerald-500' : status === 'active' ? 'text-indigo-500 fa-spin' : 'text-slate-300')} />
                    {label}
                </span>
                <span className="text-[10px] font-black text-slate-400">
                    {status === 'done' ? `${done} done` : status === 'active' ? `${done} / ${total}` : 'Waiting...'}
                </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={cls(
                        'h-full rounded-full transition-all duration-500',
                        status === 'done' ? 'bg-emerald-400' : status === 'active' ? 'bg-indigo-500' : 'bg-slate-200'
                    )}
                    style={{ width: `${status === 'done' ? 100 : pct}%` }}
                />
            </div>
        </div>
    );
};

// ─── Error Banner ─────────────────────────────────────────────────────────────
const ErrorBanner = ({ error, onRetry }) => {
    const isQuota = error === 'quota_exceeded';
    const isKey = error === 'api_key_invalid';
    return (
        <div className={cls('p-5 rounded-2xl border flex items-start gap-4', isQuota ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200')}>
            <div className={cls('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', isQuota ? 'bg-amber-500' : 'bg-red-500')}>
                <i className={cls('fas text-white text-sm', isQuota ? 'fa-tachometer-alt' : isKey ? 'fa-key' : 'fa-wifi')} />
            </div>
            <div className="flex-1">
                <p className={cls('text-sm font-black mb-1', isQuota ? 'text-amber-900' : 'text-red-900')}>
                    {isQuota ? 'API Quota Exceeded' : isKey ? 'API Key Invalid / Not Activated' : 'Search Failed'}
                </p>
                <p className={cls('text-xs font-medium leading-relaxed', isQuota ? 'text-amber-700' : 'text-red-700')}>
                    {isQuota
                        ? 'Your Google Places API daily quota has been reached. This typically resets at midnight (Pacific Time).'
                        : isKey
                            ? 'Your API key is not activated for the Maps JavaScript API or Places API. Enable them in Google Cloud Console → APIs & Services.'
                            : 'Could not reach the Google Maps API. Check your internet connection or try again.'}
                </p>
                <button
                    onClick={onRetry}
                    className={cls('mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all',
                        isQuota ? 'bg-amber-100 hover:bg-amber-200 text-amber-800' : 'bg-red-100 hover:bg-red-200 text-red-800')}
                >
                    <i className="fas fa-redo text-[9px]" /> Try Again
                </button>
            </div>
        </div>
    );
};

// ─── Results Table ────────────────────────────────────────────────────────────
const ResultsTable = ({ leads, selectedIds, onToggle, onToggleAll }) => {
    const allSelected = leads.length > 0 && selectedIds.length === leads.length;

    return (
        <div className="border border-slate-100 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[auto_2fr_1.5fr_1fr_1fr] gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
                <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-indigo-600"
                    checked={allSelected}
                    onChange={onToggleAll}
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Business</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</span>
            </div>

            {/* Rows */}
            <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-50">
                {leads.map((lead) => {
                    const selected = selectedIds.includes(lead.place_id);
                    return (
                        <div
                            key={lead.place_id}
                            onClick={() => onToggle(lead.place_id)}
                            className={cls(
                                'grid grid-cols-[auto_2fr_1.5fr_1fr_1fr] gap-3 px-4 py-3 cursor-pointer transition-colors',
                                selected ? 'bg-indigo-50/70' : 'hover:bg-slate-50'
                            )}
                        >
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded accent-indigo-600 mt-0.5"
                                checked={selected}
                                onChange={() => onToggle(lead.place_id)}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate">{lead.name}</p>
                                <p className="text-[11px] text-slate-400 truncate mt-0.5">{lead.formatted_address || '—'}</p>
                            </div>
                            <div className="min-w-0">
                                {lead.website ? (
                                    <a
                                        href={lead.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[11px] text-indigo-600 font-medium truncate block hover:underline"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {lead.website.replace(/^https?:\/\/(www\.)?/, '')}
                                    </a>
                                ) : (
                                    <span className="text-[11px] text-slate-300">No website</span>
                                )}
                                {lead.phone && (
                                    <p className="text-[11px] text-slate-500 mt-0.5">{lead.phone}</p>
                                )}
                            </div>
                            <div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold">
                                    {lead.category || 'Business'}
                                </span>
                            </div>
                            <div>
                                {lead.email ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                                        <i className="fas fa-envelope text-[9px]" />
                                        {lead.email}
                                    </span>
                                ) : (
                                    <span className="text-[11px] text-slate-300 italic">Not found</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ─── Save Result Toast ────────────────────────────────────────────────────────
const SaveResultBanner = ({ result, onClose }) => (
    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="fas fa-check text-white" />
        </div>
        <div className="flex-1">
            <p className="text-sm font-black text-emerald-900">Leads Saved!</p>
            <p className="text-xs text-emerald-700 mt-0.5">
                <span className="font-bold">{result.inserted}</span> new leads added.
                {result.skipped > 0 && <span className="ml-1 text-emerald-600">{result.skipped} duplicates skipped.</span>}
            </p>
        </div>
        <button onClick={onClose} className="text-emerald-400 hover:text-emerald-600 transition-colors">
            <i className="fas fa-times" />
        </button>
    </div>
);

// ─── Main Modal ───────────────────────────────────────────────────────────────
const GoogleMapsImportModal = ({ isOpen, onClose, projectId, onLeadsImported }) => {
    const { currentUser } = useAuth();

    // Navigation
    const [step, setStep] = useState(1); // 1=form, 2=scanning, 3=results

    // Form fields
    const [keyword, setKeyword] = useState('');
    const [location, setLocation] = useState('');
    const [maxPages, setMaxPages] = useState('1');
    const [fetchDetails, setFetchDetails] = useState(true);
    const [extractEmails, setExtractEmails] = useState(false);

    // Scanning progress
    const [progress, setProgress] = useState({ stage: null, done: 0, total: 0 });
    const [searchError, setSearchError] = useState(null);

    // Results
    const [leads, setLeads] = useState([]);
    const [stats, setStats] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    // Save state
    const [isSaving, setIsSaving] = useState(false);
    const [saveResult, setSaveResult] = useState(null);

    const canSearch = keyword.trim().length > 0 && location.trim().length > 0;

    // ── Progress handler ─────────────────────────────────────────────────────
    const handleProgress = useCallback(({ stage, done, total }) => {
        setProgress({ stage, done, total });
    }, []);

    // ── Search ───────────────────────────────────────────────────────────────
    const handleSearch = async () => {
        if (!canSearch) return;
        setStep(2);
        setSearchError(null);
        setLeads([]);
        setStats(null);
        setSelectedIds([]);
        setSaveResult(null);
        setProgress({ stage: 'search', done: 0, total: parseInt(maxPages, 10) });

        try {
            const result = await generateLeads({
                keyword: keyword.trim(),
                location: location.trim(),
                maxPages: parseInt(maxPages, 10),
                fetchDetails,
                extractEmails,
                onProgress: handleProgress,
            });

            setLeads(result.leads);
            setStats(result.stats);
            setSelectedIds(result.leads.map((l) => l.place_id)); // select all by default
            setStep(3);
        } catch (err) {
            console.error('[GoogleMaps] Search failed:', err);
            const code = err.message;
            setSearchError(code === 'quota_exceeded' || code === 'api_key_invalid' ? code : 'api_error');
            setStep(1);
        }
    };

    // ── Selection ────────────────────────────────────────────────────────────
    const toggleSelect = (placeId) => {
        setSelectedIds((prev) =>
            prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId]
        );
    };

    const toggleAll = () => {
        setSelectedIds((prev) => (prev.length === leads.length ? [] : leads.map((l) => l.place_id)));
    };

    // ── Save to DB ───────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!currentUser || !projectId || selectedIds.length === 0) return;

        setIsSaving(true);
        try {
            const toSave = leads.filter((l) => selectedIds.includes(l.place_id));
            const result = await bulkCreateLeads(currentUser.uid, projectId, toSave);
            setSaveResult(result);
            if (onLeadsImported) onLeadsImported(result);
        } catch (err) {
            console.error('[GoogleMaps] Save error:', err);
            setSearchError('api_error');
        } finally {
            setIsSaving(false);
        }
    };

    // ── Reset & Close ────────────────────────────────────────────────────────
    const handleClose = () => {
        setStep(1);
        setKeyword('');
        setLocation('');
        setMaxPages('1');
        setFetchDetails(true);
        setExtractEmails(false);
        setProgress({ stage: null, done: 0, total: 0 });
        setSearchError(null);
        setLeads([]);
        setStats(null);
        setSelectedIds([]);
        setIsSaving(false);
        setSaveResult(null);
        onClose();
    };

    // ── Stage display helpers ─────────────────────────────────────────────────
    const stageFor = (name) => {
        if (!progress.stage) return 'waiting';
        if (progress.stage === name) return 'active';
        const order = ['search', 'details', 'emails'];
        return order.indexOf(progress.stage) > order.indexOf(name) ? 'done' : 'waiting';
    };

    const selectedLeads = useMemo(
        () => leads.filter((l) => selectedIds.includes(l.place_id)),
        [leads, selectedIds]
    );

    // ── Footer ────────────────────────────────────────────────────────────────
    const footer = (
        <div className="flex gap-3 justify-between w-full">
            {step === 1 && (
                <>
                    <Button variant="outline" onClick={handleClose} className="border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl">
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSearch}
                        disabled={!canSearch}
                        className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100 rounded-xl px-8"
                    >
                        <span className="flex items-center gap-2">
                            <i className="fas fa-search" /> Search Google Maps
                        </span>
                    </Button>
                </>
            )}
            {step === 2 && (
                <p className="text-xs text-slate-400 font-medium italic">Please wait while we scan Google Maps...</p>
            )}
            {step === 3 && (
                <>
                    <Button
                        variant="outline"
                        onClick={() => { setStep(1); setLeads([]); setSaveResult(null); }}
                        className="border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl"
                    >
                        <i className="fas fa-arrow-left mr-2" /> New Search
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={selectedIds.length === 0 || isSaving || !!saveResult}
                        className={cls(
                            'rounded-xl px-8',
                            selectedIds.length > 0 && !saveResult
                                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        )}
                    >
                        {isSaving ? (
                            <span className="flex items-center gap-2"><i className="fas fa-spinner fa-spin" /> Saving...</span>
                        ) : saveResult ? (
                            <span className="flex items-center gap-2"><i className="fas fa-check" /> Saved!</span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <i className="fas fa-database" />
                                Save {selectedIds.length} Lead{selectedIds.length !== 1 ? 's' : ''} to Project
                            </span>
                        )}
                    </Button>
                </>
            )}
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Import Leads from Google Maps"
            size="xl"
            footer={footer}
        >
            <div className="space-y-6 py-1">
                <StepIndicator step={step} />

                {/* ── STEP 1: Parameters ── */}
                {step === 1 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">

                        {/* Error banner from previous attempt */}
                        {searchError && (
                            <ErrorBanner error={searchError} onRetry={() => { setSearchError(null); handleSearch(); }} />
                        )}

                        {/* Info badge */}
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-4">
                            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-200">
                                <i className="fab fa-google text-white text-sm" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-emerald-900">Google Maps B2B Lead Generation</p>
                                <p className="text-xs text-emerald-700 leading-relaxed mt-1">
                                    Search for businesses by keyword and location. Extracts name, website, phone, address, category and email — saved directly to your leads database.
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="space-y-4">
                            <Field label="Business Keyword *">
                                <input
                                    id="gmaps-keyword"
                                    type="text"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && canSearch && handleSearch()}
                                    placeholder="e.g. Digital Marketing Agency, SaaS Company..."
                                    className={inputCls}
                                />
                            </Field>

                            <Field label="Location / City *">
                                <input
                                    id="gmaps-location"
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && canSearch && handleSearch()}
                                    placeholder="e.g. New York, London, Dubai..."
                                    className={inputCls}
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Pages to Fetch">
                                    <select id="gmaps-pages" value={maxPages} onChange={(e) => setMaxPages(e.target.value)} className={selectCls}>
                                        <option value="1">1 page (~20 results)</option>
                                        <option value="2">2 pages (~40 results)</option>
                                        <option value="3">3 pages (~60 results)</option>
                                    </select>
                                </Field>
                                <Field label="Options">
                                    <div className="flex flex-col gap-2 pt-2">
                                        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 font-medium">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded accent-indigo-600"
                                                checked={fetchDetails}
                                                onChange={(e) => setFetchDetails(e.target.checked)}
                                            />
                                            Fetch website & phone
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 font-medium">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded accent-indigo-600"
                                                checked={extractEmails}
                                                onChange={(e) => setExtractEmails(e.target.checked)}
                                            />
                                            Extract emails
                                            <span className="text-[10px] text-amber-600 font-bold">(slow)</span>
                                        </label>
                                    </div>
                                </Field>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── STEP 2: Scanning Progress ── */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="text-center py-4">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-100">
                                <i className="fab fa-google text-white text-2xl" />
                            </div>
                            <p className="font-black text-slate-800 text-lg">Scanning Google Maps</p>
                            <p className="text-sm text-slate-400 mt-1">
                                Searching for <span className="font-bold text-slate-600">"{keyword}"</span> in <span className="font-bold text-slate-600">{location}</span>
                            </p>
                        </div>

                        <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                            <ProgressRow
                                icon="fa-spinner"
                                label="Searching businesses"
                                status={stageFor('search')}
                                done={stageFor('search') === 'active' ? progress.done : (stageFor('search') === 'done' ? progress.total : 0)}
                                total={parseInt(maxPages, 10)}
                            />
                            {fetchDetails && (
                                <ProgressRow
                                    icon="fa-info-circle"
                                    label="Fetching contact details"
                                    status={stageFor('details')}
                                    done={stageFor('details') === 'active' ? progress.done : (stageFor('details') === 'done' ? progress.total : 0)}
                                    total={stageFor('details') === 'active' ? progress.total : leads.length || '?'}
                                />
                            )}
                            {extractEmails && (
                                <ProgressRow
                                    icon="fa-envelope"
                                    label="Extracting emails from websites"
                                    status={stageFor('emails')}
                                    done={stageFor('emails') === 'active' ? progress.done : (stageFor('emails') === 'done' ? progress.total : 0)}
                                    total={stageFor('emails') === 'active' ? progress.total : leads.filter(l => l.website).length || '?'}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* ── STEP 3: Results ── */}
                {step === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">

                        {/* Save result banner */}
                        {saveResult && (
                            <SaveResultBanner result={saveResult} onClose={() => setSaveResult(null)} />
                        )}

                        {/* Stats bar */}
                        {stats && (
                            <div className="grid grid-cols-4 gap-3">
                                {[
                                    { label: 'Found', value: stats.total, icon: 'fa-building', color: 'text-slate-700 bg-slate-100' },
                                    { label: 'With Website', value: stats.withWebsite, icon: 'fa-globe', color: 'text-indigo-700 bg-indigo-50' },
                                    { label: 'With Phone', value: stats.withPhone, icon: 'fa-phone', color: 'text-teal-700 bg-teal-50' },
                                    { label: 'With Email', value: stats.withEmail, icon: 'fa-envelope', color: 'text-emerald-700 bg-emerald-50' },
                                ].map((s) => (
                                    <div key={s.label} className={cls('rounded-xl p-3 text-center', s.color)}>
                                        <p className="text-lg font-black">{s.value}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-wide opacity-70">
                                            <i className={cls('fas mr-1', s.icon)} />{s.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Search chips */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-xl">
                                <i className="fas fa-search text-[9px] text-slate-400" />{keyword}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-xl">
                                <i className="fas fa-map-marker-alt text-[9px] text-emerald-500" />{location}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[11px] font-bold rounded-xl">
                                <i className="fas fa-check-square text-[9px]" />{selectedIds.length} selected
                            </span>
                        </div>

                        {/* Results or empty */}
                        {leads.length === 0 ? (
                            <div className="py-12 text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                                    <i className="fas fa-map-marker-alt text-slate-300 text-2xl" />
                                </div>
                                <p className="font-black text-slate-700 text-lg">No Businesses Found</p>
                                <p className="text-sm text-slate-400">Try a broader keyword or different city.</p>
                            </div>
                        ) : (
                            <ResultsTable
                                leads={leads}
                                selectedIds={selectedIds}
                                onToggle={toggleSelect}
                                onToggleAll={toggleAll}
                            />
                        )}

                        {/* Place ID note */}
                        {leads.length > 0 && (
                            <p className="text-[10px] text-slate-400 text-center italic">
                                All {leads.length} results include Google Place ID, address, category & source=google_maps stored in your leads database.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default GoogleMapsImportModal;
