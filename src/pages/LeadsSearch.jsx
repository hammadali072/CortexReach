/**
 * LeadsSearch.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * /dashboard/leads/search  
 *
 * Dedicated B2B Lead Generation page using the Google Maps Places API.
 * Equivalent to a REST endpoint: GET /api/leads/google-maps
 *
 * Features:
 *  - Keyword + location inputs
 *  - Radius selector (Google Places API uses textSearch — radius is cosmetic here)
 *  - Pagination: 1–3 pages (~20 results each)
 *  - Options: fetch details, extract emails
 *  - Live progress scanner UI
 *  - Results table with full fields: name, website, phone, address, category, place_id
 *  - Select leads → save to project (or skip project → global leads)
 *  - Duplicate skip, source='google_maps'
 *  - Rate limiting & error handling
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import TitleComponent from '../components/titleComponent/titleComponent';
import { useAuth } from '../context/AuthContext';
import { generateLeads } from '../services/googleMapsService';
import { bulkCreateLeads, getUserProjects } from '../services/db';

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
const cls = (...p) => p.filter(Boolean).join(' ');

const inputCls = 'w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300 shadow-sm';
const selectCls = 'w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700 shadow-sm cursor-pointer';

// ─── Progress stage badge ─────────────────────────────────────────────────────
const StageBadge = ({ label, icon, status, done, total }) => {
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const isActive = status === 'active';
    const isDone = status === 'done';

    return (
        <div className={cls(
            'flex-1 p-4 rounded-2xl border transition-all duration-500',
            isDone ? 'bg-emerald-50 border-emerald-200' : isActive ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'
        )}>
            <div className="flex items-center justify-between mb-2">
                <span className={cls('text-xs font-black flex items-center gap-2',
                    isDone ? 'text-emerald-700' : isActive ? 'text-indigo-700' : 'text-slate-400'
                )}>
                    <i className={cls(`fas ${icon}`, isActive && 'fa-spin')} />
                    {label}
                </span>
                <span className={cls('text-[10px] font-black', isDone ? 'text-emerald-600' : isActive ? 'text-indigo-500' : 'text-slate-300')}>
                    {isDone ? `✓ ${done}` : isActive ? `${done}/${total}` : '—'}
                </span>
            </div>
            <div className="h-1.5 bg-white rounded-full border border-slate-100 overflow-hidden">
                <div
                    className={cls('h-full rounded-full transition-all duration-700', isDone ? 'bg-emerald-400' : isActive ? 'bg-indigo-500' : 'bg-slate-200')}
                    style={{ width: `${isDone ? 100 : pct}%` }}
                />
            </div>
        </div>
    );
};

// ─── Result row ───────────────────────────────────────────────────────────────
const LeadRow = ({ lead, selected, onToggle }) => (
    <tr
        onClick={onToggle}
        className={cls('cursor-pointer transition-colors border-b border-slate-50', selected ? 'bg-indigo-50/70' : 'hover:bg-slate-50')}
    >
        <td className="px-4 py-3 w-10">
            <input
                type="checkbox"
                className="w-4 h-4 rounded accent-indigo-600"
                checked={selected}
                onChange={onToggle}
                onClick={(e) => e.stopPropagation()}
            />
        </td>
        <td className="px-4 py-3">
            <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">{lead.name}</p>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{lead.formatted_address || '—'}</p>
        </td>
        <td className="px-4 py-3">
            {lead.website ? (
                <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-indigo-600 font-medium hover:underline block truncate max-w-[160px]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {lead.website.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
            ) : <span className="text-[11px] text-slate-300">—</span>}
        </td>
        <td className="px-4 py-3">
            <span className="text-[11px] text-slate-600 font-medium">{lead.phone || '—'}</span>
        </td>
        <td className="px-4 py-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold">
                {lead.category || 'Business'}
            </span>
        </td>
        <td className="px-4 py-3">
            {lead.email ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                    <i className="fas fa-envelope text-[9px]" />{lead.email}
                </span>
            ) : <span className="text-[11px] text-slate-300 italic">Not found</span>}
        </td>
        <td className="px-4 py-3">
            <span className="text-[10px] text-slate-400 font-mono">{lead.place_id?.slice(0, 12)}…</span>
        </td>
    </tr>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const LeadsSearch = () => {
    const { currentUser } = useAuth();
    const [searchParams] = useSearchParams();
    const projectIdFromUrl = searchParams.get('projectId');

    // User's projects for the "save to project" dropdown
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');

    useEffect(() => {
        if (!currentUser) return;
        getUserProjects(currentUser.uid).then((ps) => {
            setProjects(ps);
            if (projectIdFromUrl && ps.some(p => p.id === projectIdFromUrl)) {
                setSelectedProjectId(projectIdFromUrl);
            } else if (ps.length > 0) {
                setSelectedProjectId(ps[0].id);
            }
        });
    }, [currentUser, projectIdFromUrl]);

    // ── Form state ────────────────────────────────────────────────────────────
    const [keyword, setKeyword] = useState('');
    const [location, setLocation] = useState('');

    // Suggest keyword if project selected
    useEffect(() => {
        const proj = projects.find(p => p.id === selectedProjectId);
        if (proj && !keyword) {
            // Use project name or first audience segment as a starting point
            const suggestion = proj.targetAudience?.split(',')[0]?.trim() || proj.name;
            setKeyword(suggestion);
        }
    }, [selectedProjectId, projects, keyword]);

    const [radius, setRadius] = useState('10km');
    const [maxPages, setMaxPages] = useState('1');
    const [fetchDetails, setFetchDetails] = useState(true);
    const [extractEmails, setExtractEmails] = useState(false);

    // ── Pipeline state ────────────────────────────────────────────────────────
    const [phase, setPhase] = useState('idle'); // idle | scanning | results | saving | saved | error
    const [progress, setProgress] = useState({ stage: null, done: 0, total: 0 });
    const [error, setError] = useState(null);

    // ── Results state ─────────────────────────────────────────────────────────
    const [leads, setLeads] = useState([]);
    const [stats, setStats] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    // ── Save state ────────────────────────────────────────────────────────────
    const [saveResult, setSaveResult] = useState(null);

    const canSearch = keyword.trim().length > 0 && location.trim().length > 0;

    // ── Progress callback ─────────────────────────────────────────────────────
    const handleProgress = useCallback(({ stage, done, total }) => {
        setProgress({ stage, done, total });
    }, []);

    // ── Search handler ────────────────────────────────────────────────────────
    const handleSearch = async () => {
        if (!canSearch) return;
        setPhase('scanning');
        setError(null);
        setLeads([]);
        setStats(null);
        setSelectedIds([]);
        setSaveResult(null);
        setProgress({ stage: 'search', done: 0, total: parseInt(maxPages, 10) });

        try {
            const { leads: found, stats: s } = await generateLeads({
                keyword: keyword.trim(),
                location: location.trim(),
                maxPages: parseInt(maxPages, 10),
                fetchDetails,
                extractEmails,
                onProgress: handleProgress,
            });

            setLeads(found);
            setStats(s);
            setSelectedIds(found.map((l) => l.place_id)); // select all by default
            setPhase('results');
        } catch (err) {
            console.error('[LeadsSearch] error:', err);
            setError(err.message);
            setPhase('error');
        }
    };

    // ── Selection ─────────────────────────────────────────────────────────────
    const toggleOne = (id) =>
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

    const toggleAll = () =>
        setSelectedIds((prev) => prev.length === leads.length ? [] : leads.map((l) => l.place_id));

    // ── Save to Firebase ──────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!currentUser || !selectedProjectId || selectedIds.length === 0) return;
        setPhase('saving');

        try {
            const toSave = leads.filter((l) => selectedIds.includes(l.place_id));
            const result = await bulkCreateLeads(currentUser.uid, selectedProjectId, toSave);
            setSaveResult(result);
            setPhase('saved');
        } catch (err) {
            console.error('[LeadsSearch] save error:', err);
            setError(err.message);
            setPhase('error');
        }
    };

    // ── Stage helpers ─────────────────────────────────────────────────────────
    const stageFor = (name) => {
        if (!progress.stage) return 'waiting';
        const order = ['search', 'details', 'emails'];
        const cur = order.indexOf(progress.stage);
        const tgt = order.indexOf(name);
        if (cur === tgt) return 'active';
        if (cur > tgt) return 'done';
        return 'waiting';
    };

    const selectedLeads = useMemo(
        () => leads.filter((l) => selectedIds.includes(l.place_id)),
        [leads, selectedIds]
    );

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen space-y-8 pb-16">

            {/* ── Page Header ── */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-10 shadow-xl border border-slate-800">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <Link to="/dashboard/leads" className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-1.5">
                                <i className="fas fa-arrow-left text-xs" /> All Leads
                            </Link>
                            <span className="text-slate-600 text-xs">/</span>
                            <span className="text-indigo-400 text-sm font-bold">Google Maps Search</span>
                        </div>
                        <TitleComponent type="h1" className="text-white text-4xl font-bold mb-2">
                            Google Maps Lead Generator
                        </TitleComponent>
                        <TitleComponent type="p" size="lg" className="text-slate-400">
                            Find B2B leads by keyword, location & industry. Extract website, phone, email and save to your database.
                        </TitleComponent>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="flex items-center gap-2 px-5 py-3 bg-emerald-600/20 border border-emerald-600/30 rounded-2xl">
                            <i className="fab fa-google text-emerald-400" />
                            <span className="text-emerald-300 text-sm font-bold">Places API</span>
                        </div>
                        <div className="flex items-center gap-2 px-5 py-3 bg-indigo-600/20 border border-indigo-600/30 rounded-2xl">
                            <i className="fas fa-database text-indigo-400" />
                            <span className="text-indigo-300 text-sm font-bold">Firebase DB</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-8 items-start">

                {/* ── LEFT: Search Form ── */}
                <div className="space-y-6 sticky top-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
                        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <i className="fas fa-search-location text-indigo-500" />
                            Search Parameters
                        </h2>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Business Keyword *</label>
                                <input
                                    type="text"
                                    id="ls-keyword"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && canSearch && handleSearch()}
                                    placeholder="Software company, Digital agency..."
                                    className={inputCls}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location / City *</label>
                                <input
                                    type="text"
                                    id="ls-location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && canSearch && handleSearch()}
                                    placeholder="New York, London, Dubai..."
                                    className={inputCls}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Search Radius</label>
                                <select id="ls-radius" value={radius} onChange={(e) => setRadius(e.target.value)} className={selectCls}>
                                    <option value="1km">1 km</option>
                                    <option value="5km">5 km</option>
                                    <option value="10km">10 km</option>
                                    <option value="20km">20 km</option>
                                    <option value="50km">50 km</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pages to Fetch</label>
                                <select id="ls-pages" value={maxPages} onChange={(e) => setMaxPages(e.target.value)} className={selectCls}>
                                    <option value="1">1 page — up to 20 results</option>
                                    <option value="2">2 pages — up to 40 results</option>
                                    <option value="3">3 pages — up to 60 results</option>
                                </select>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Options</p>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded accent-indigo-600 mt-0.5"
                                        checked={fetchDetails}
                                        onChange={(e) => setFetchDetails(e.target.checked)}
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">Fetch Contact Details</p>
                                        <p className="text-xs text-slate-400">Gets website, phone number, address for each business from Place Details API.</p>
                                    </div>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded accent-indigo-600 mt-0.5"
                                        checked={extractEmails}
                                        onChange={(e) => setExtractEmails(e.target.checked)}
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">Extract Emails <span className="text-amber-500 text-[10px] font-black">(SLOW)</span></p>
                                        <p className="text-xs text-slate-400">Crawls each business website to find public contact emails (info@, sales@, etc).</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <button
                            id="ls-search-btn"
                            onClick={handleSearch}
                            disabled={!canSearch || phase === 'scanning' || phase === 'saving'}
                            className={cls(
                                'w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2',
                                canSearch && phase !== 'scanning'
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-100 hover:shadow-xl hover:-translate-y-0.5'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            )}
                        >
                            {phase === 'scanning' ? (
                                <><i className="fas fa-spinner fa-spin" /> Scanning...</>
                            ) : (
                                <><i className="fab fa-google" /> Search Google Maps</>
                            )}
                        </button>
                    </div>

                    {/* ── Save to Project card ── */}
                    {(phase === 'results' || phase === 'saved') && leads.length > 0 && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                                <i className="fas fa-database text-indigo-500" /> Save to Project
                            </h3>

                            {projects.length === 0 ? (
                                <p className="text-xs text-slate-400">
                                    No projects yet. <Link to="/dashboard/projects/create" className="text-indigo-600 font-bold hover:underline">Create one →</Link>
                                </p>
                            ) : (
                                <>
                                    <select
                                        value={selectedProjectId}
                                        onChange={(e) => setSelectedProjectId(e.target.value)}
                                        className={selectCls}
                                        style={{ padding: '12px 20px' }}
                                    >
                                        {projects.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>

                                    {/* Save result */}
                                    {saveResult && (
                                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                            <p className="text-sm font-black text-emerald-800">
                                                <i className="fas fa-check-circle mr-1" /> {saveResult.inserted} leads saved!
                                            </p>
                                            {saveResult.skipped > 0 && (
                                                <p className="text-xs text-emerald-600 mt-0.5">{saveResult.skipped} duplicates skipped.</p>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleSave}
                                        disabled={selectedIds.length === 0 || phase === 'saving' || phase === 'saved'}
                                        className={cls(
                                            'w-full py-3 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2',
                                            selectedIds.length > 0 && phase !== 'saved'
                                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        )}
                                    >
                                        {phase === 'saving' ? (
                                            <><i className="fas fa-spinner fa-spin" /> Saving...</>
                                        ) : phase === 'saved' ? (
                                            <><i className="fas fa-check" /> Saved to Database</>
                                        ) : (
                                            <><i className="fas fa-database" /> Save {selectedIds.length} Lead{selectedIds.length !== 1 ? 's' : ''}</>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* ── RIGHT: Output area ── */}
                <div className="space-y-6">

                    {/* Idle state */}
                    {phase === 'idle' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-16 text-center">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-50 rounded-3xl flex items-center justify-center">
                                <i className="fab fa-google text-slate-300 text-4xl" />
                            </div>
                            <p className="text-xl font-black text-slate-700 mb-2">Ready to Find Leads</p>
                            <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                                Enter a business keyword and city on the left, then click <strong>Search Google Maps</strong> to find B2B prospects.
                            </p>

                            {/* Quick example chips */}
                            <div className="mt-8 flex flex-wrap justify-center gap-2">
                                {[
                                    ['Digital Marketing Agency', 'New York'],
                                    ['Software Company', 'London'],
                                    ['SaaS Startup', 'San Francisco'],
                                    ['Web Design Studio', 'Dubai'],
                                ].map(([kw, loc]) => (
                                    <button
                                        key={kw}
                                        onClick={() => { setKeyword(kw); setLocation(loc); }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 text-slate-600 text-xs font-bold rounded-xl transition-all"
                                    >
                                        <i className="fas fa-magic text-[9px]" />{kw} · {loc}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Scanning state */}
                    {phase === 'scanning' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 space-y-8 animate-in fade-in duration-300">
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-100 animate-bounce">
                                    <i className="fab fa-google text-white text-3xl" />
                                </div>
                                <p className="text-xl font-black text-slate-800">Scanning Google Maps...</p>
                                <p className="text-sm text-slate-400 mt-2">
                                    <span className="font-bold text-slate-600">"{keyword}"</span> in <span className="font-bold text-slate-600">{location}</span>
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <StageBadge
                                    icon="fa-spinner"
                                    label="Searching businesses"
                                    status={stageFor('search')}
                                    done={progress.stage === 'search' ? progress.done : (stageFor('search') === 'done' ? parseInt(maxPages) : 0)}
                                    total={parseInt(maxPages)}
                                />
                                {fetchDetails && (
                                    <StageBadge
                                        icon="fa-info-circle"
                                        label="Fetching details"
                                        status={stageFor('details')}
                                        done={progress.stage === 'details' ? progress.done : (stageFor('details') === 'done' ? progress.total : 0)}
                                        total={progress.stage === 'details' ? progress.total : leads.length || '?'}
                                    />
                                )}
                                {extractEmails && (
                                    <StageBadge
                                        icon="fa-envelope"
                                        label="Extracting emails"
                                        status={stageFor('emails')}
                                        done={progress.stage === 'emails' ? progress.done : 0}
                                        total={progress.stage === 'emails' ? progress.total : leads.filter(l => l.website).length || '?'}
                                    />
                                )}
                            </div>

                            <p className="text-center text-xs text-slate-400 italic">
                                This may take 10–60 seconds depending on result count and options selected.
                            </p>
                        </div>
                    )}

                    {/* Error state */}
                    {phase === 'error' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 space-y-5">
                            <div className="p-5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4">
                                <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <i className="fas fa-exclamation-triangle text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-black text-red-900 mb-1">
                                        {error === 'quota_exceeded' ? 'API Quota Exceeded' :
                                            error === 'api_key_invalid' ? 'API Key Not Activated' :
                                                'Search Failed'}
                                    </p>
                                    <p className="text-sm text-red-700 leading-relaxed">
                                        {error === 'quota_exceeded'
                                            ? 'Your Google Places API quota has been reached. It resets at midnight Pacific Time.'
                                            : error === 'api_key_invalid'
                                                ? 'Enable the Maps JavaScript API and Places API in Google Cloud Console for your project.'
                                                : `Error: ${error}. Check your API key and internet connection.`}
                                    </p>
                                    <button
                                        onClick={() => setPhase('idle')}
                                        className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-black rounded-xl transition-all"
                                    >
                                        <i className="fas fa-arrow-left mr-1" /> Try Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    {(phase === 'results' || phase === 'saved' || phase === 'saving') && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">

                            {/* Results header */}
                            <div className="p-6 border-b border-slate-100">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-xl">
                                            <i className="fas fa-search text-[9px] text-slate-400" />{keyword}
                                        </span>
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-xl">
                                            <i className="fas fa-map-marker-alt text-[9px] text-emerald-500" />{location}
                                        </span>
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-xl border border-emerald-100">
                                            <i className="fas fa-building text-[9px]" />{leads.length} businesses
                                        </span>
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-xl border border-indigo-100">
                                            <i className="fas fa-check-square text-[9px]" />{selectedIds.length} selected
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleSearch}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors"
                                    >
                                        <i className="fas fa-redo text-[9px]" /> Re-search
                                    </button>
                                </div>

                                {/* Stats */}
                                {stats && (
                                    <div className="grid grid-cols-4 gap-3 mt-4">
                                        {[
                                            { label: 'Total Leads', value: stats.total, color: 'bg-slate-50 text-slate-700' },
                                            { label: 'Have Website', value: stats.withWebsite, color: 'bg-indigo-50 text-indigo-700' },
                                            { label: 'Have Phone', value: stats.withPhone, color: 'bg-teal-50 text-teal-700' },
                                            { label: 'Have Email', value: stats.withEmail, color: 'bg-emerald-50 text-emerald-700' },
                                        ].map((s) => (
                                            <div key={s.label} className={cls('rounded-xl p-3 text-center', s.color)}>
                                                <p className="text-2xl font-black">{s.value}</p>
                                                <p className="text-[10px] font-bold uppercase tracking-wide opacity-60 mt-0.5">{s.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Table */}
                            {leads.length === 0 ? (
                                <div className="py-20 text-center">
                                    <i className="fas fa-map-marker-alt text-slate-200 text-5xl mb-4 block" />
                                    <p className="text-slate-400 font-medium">No businesses found. Try a broader keyword.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[900px]">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-100">
                                                <th className="px-4 py-3 text-left w-10">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded accent-indigo-600"
                                                        checked={selectedIds.length === leads.length && leads.length > 0}
                                                        onChange={toggleAll}
                                                    />
                                                </th>
                                                {['Business / Address', 'Website', 'Phone', 'Category', 'Email', 'Place ID'].map((h) => (
                                                    <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leads.map((lead) => (
                                                <LeadRow
                                                    key={lead.place_id}
                                                    lead={lead}
                                                    selected={selectedIds.includes(lead.place_id)}
                                                    onToggle={() => toggleOne(lead.place_id)}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Footer note */}
                            {leads.length > 0 && (
                                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-[11px] text-slate-400">
                                        All data stored with <code className="bg-slate-200 px-1 rounded text-[10px]">source="google_maps"</code> in Firebase
                                    </span>
                                    <Link to="/dashboard/leads" className="text-xs text-indigo-600 font-bold hover:underline">
                                        View All Leads →
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default LeadsSearch;
