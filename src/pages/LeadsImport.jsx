import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import TitleComponent from '../components/titleComponent/titleComponent';
import { useAuth } from '../context/AuthContext';
import { bulkCreateLeads, getUserProjects } from '../services/db';

const cls = (...p) => p.filter(Boolean).join(' ');

const selectCls = 'w-full px-5 py-4 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700 shadow-sm cursor-pointer';

const slugify = (text) => {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_')           // Replace spaces with underscores
        .replace(/[^\w-]+/g, '')         // Remove all non-word chars
        .replace(/__+/g, '_')            // Replace multiple underscores with single
        .replace(/^_/, '')               // Trim underscore from start
        .replace(/_$/, '');              // Trim underscore from end
};

// ─── Result row ───────────────────────────────────────────────────────────────
const LeadRow = ({ lead, selected, onToggle }) => {
    const findField = (options) => {
        const lowerOptions = options.map(o => o.toLowerCase());
        const keys = Object.keys(lead);

        for (const opt of options) {
            if (lead[opt] !== undefined && lead[opt] !== null && lead[opt] !== '') return lead[opt];
        }

        const exactSlugKey = keys.find(k => lowerOptions.includes(k.toLowerCase().replace(/[\s_]/g, '')));
        if (exactSlugKey) return lead[exactSlugKey];

        const isNameLookup = lowerOptions.some(o => o.includes('name') || o.includes('company') || o.includes('business') || o.includes('person'));

        if (isNameLookup) {
            const nameKey = keys.find(k => {
                const lk = k.toLowerCase();
                return lowerOptions.some(opt => lk.includes(opt)) && (lk.includes('name') || lk.includes('title'));
            });
            if (nameKey) return lead[nameKey];
        }

        const key = keys.find(k => {
            const lk = k.toLowerCase();
            if (isNameLookup) {
                const noise = ['city', 'state', 'address', 'zip', 'postal', 'street', 'lat', 'lng', 'location'];
                if (noise.some(n => lk.includes(n)) && !lowerOptions.some(o => lk === o)) return false;
            }
            return lowerOptions.some(opt => lk.includes(opt));
        });
        return key ? lead[key] : null;
    };

    const getFullName = () => {
        const first = findField(['first_name', 'firstName', 'fname']);
        const last = findField(['last_name', 'lastName', 'lname']);
        if (first || last) return `${first || ''} ${last || ''}`.trim();
        return findField(['name', 'full_name', 'contact_name', 'person', 'contact']);
    };

    const name = getFullName();
    const company = findField(['company', 'business', 'org', 'firm', 'organization']);
    const email = findField(['email', 'mail', 'contact']);

    return (
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
                <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">{name || 'Unknown'}</p>
            </td>
            <td className="px-4 py-3">
                <p className="text-[11px] text-slate-800 font-bold truncate max-w-[150px]">{company || '—'}</p>
            </td>
            <td className="px-4 py-3">
                {email ? (
                    <span className="flex items-center gap-1 text-[11px] text-indigo-600 font-medium">
                        <i className="fas fa-envelope text-[9px]" />{email}
                    </span>
                ) : <span className="text-[11px] text-slate-300">—</span>}
            </td>
            <td className="px-4 py-3">
                <span className="text-[11px] text-slate-600 font-medium">{findField(['phone', 'mobile', 'tel']) || '—'}</span>
            </td>
            <td className="px-4 py-3">
                {findField(['website', 'url', 'site']) ? (
                    <span className="text-[11px] text-slate-500 truncate max-w-[160px]">{findField(['website', 'url', 'site'])}</span>
                ) : <span className="text-[11px] text-slate-300">—</span>}
            </td>
            <td className="px-4 py-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold">
                    {findField(['category', 'industry', 'type']) || 'Imported'}
                </span>
            </td>
        </tr>
    );
};

const LeadsImport = () => {
    const { currentUser } = useAuth();
    const [searchParams] = useSearchParams();
    const projectIdFromUrl = searchParams.get('projectId');

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

    // ── Pipeline state ────────────────────────────────────────────────────────
    const [phase, setPhase] = useState('idle'); // idle | parsing | results | saving | saved | error
    const [error, setError] = useState(null);
    const [leads, setLeads] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [saveResult, setSaveResult] = useState(null);

    // ── File Handling ─────────────────────────────────────────────────────────
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setPhase('parsing');
        setError(null);

        const fileName = file.name.toLowerCase();
        if (fileName.endsWith('.csv')) {
            parseCSV(file);
        } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
            parseXLSX(file);
        } else {
            setError('Please upload a .csv, .xlsx, or .xls file.');
            setPhase('error');
        }
    };

    const parseCSV = (file) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                processRawData(results.data);
            },
            error: (err) => {
                setError(`Failed to parse CSV: ${err.message}`);
                setPhase('error');
            }
        });
    };

    const parseXLSX = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.SheetNames[0];
                const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
                processRawData(jsonData);
            } catch (err) {
                setError(`Failed to parse Excel file: ${err.message}`);
                setPhase('error');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const processRawData = (data) => {
        if (!data || data.length === 0) {
            setError('The file appears to be empty.');
            setPhase('error');
            return;
        }

        // Simple mapping heuristic
        const formatted = data.map((item) => {
            // Slugify all original keys and store their values
            const record = {};
            Object.keys(item).forEach(key => {
                const cleanKey = slugify(key);
                if (cleanKey) {
                    record[cleanKey] = item[key];
                }
            });

            return {
                ...record,
                projectId: selectedProjectId,
            };
        });

        // Filter valid leads (must have something that looks like a name or email in slugified keys)
        const validLeads = formatted.filter(l => {
            const keys = Object.keys(l);
            const hasName = keys.some(k => ['name', 'full_name', 'contact', 'person', 'business'].some(opt => k.includes(opt)));
            const hasEmail = keys.some(k => ['email', 'mail'].some(opt => k.includes(opt)));
            return hasName || hasEmail;
        });
        if (validLeads.length === 0) {
            setError('No valid leads found (missing Name or Email).');
            setPhase('error');
            return;
        }

        setLeads(validLeads);
        setSelectedIds(validLeads.map(l => l.place_id));
        setPhase('results');
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
            console.error('[LeadsImport] save error:', err);
            setError(err.message);
            setPhase('error');
        }
    };

    const selectedLeadsCount = selectedIds.length;

    return (
        <div className="min-h-screen space-y-8 pb-16">

            {/* ── Page Header ── */}
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-10 shadow-xl border border-slate-800">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-600/10 rounded-lg blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-600/10 rounded-lg blur-3xl" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <Link to="/dashboard/leads" className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-1.5">
                                <i className="fas fa-arrow-left text-xs" /> All Leads
                            </Link>
                            <span className="text-slate-600 text-xs">/</span>
                            <span className="text-indigo-400 text-sm font-bold">Import Data</span>
                        </div>
                        <TitleComponent type="h1" className="text-white text-4xl font-bold mb-2">
                            CSV / XLSX Lead Importer
                        </TitleComponent>
                        <TitleComponent type="p" size="lg" className="text-slate-400">
                            Upload your existing lead lists. We'll automatically map columns for names, emails, and contact details.
                        </TitleComponent>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-8 items-start">

                {/* ── LEFT: Upload area ── */}
                <div className="space-y-6 sticky top-6">
                    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-8 space-y-6">
                        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <i className="fas fa-cloud-upload-alt text-indigo-500" />
                            Upload File
                        </h2>

                        <div className="space-y-4">
                            <div className="relative group">
                                <input
                                    type="file"
                                    accept=".csv, .xlsx, .xls"
                                    onChange={handleFileSelect}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="border-2 border-dashed border-slate-200 group-hover:border-indigo-400 group-hover:bg-indigo-50/30 rounded-lg p-10 text-center transition-all">
                                    <div className="w-16 h-16 bg-slate-50 group-hover:bg-white rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 transition-all">
                                        <i className="fas fa-file-excel text-2xl text-slate-300 group-hover:text-indigo-500" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 mb-1">Select CSV or Excel</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Max 10MB file size</p>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Instructions</p>
                                <ul className="text-xs text-slate-500 space-y-2">
                                    <li className="flex gap-2">
                                        <i className="fas fa-check text-emerald-500 mt-0.5" />
                                        <span>Ensure columns like <b>Name</b> and <b>Email</b> exist.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <i className="fas fa-check text-emerald-500 mt-0.5" />
                                        <span>We'll handle .csv, .xls, and .xlsx formats.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <i className="fas fa-check text-emerald-500 mt-0.5" />
                                        <span>Duplicates are skipped automatically on save.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* ── Save to Project card ── */}
                    {(phase === 'results' || phase === 'saved') && leads.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                                <i className="fas fa-database text-indigo-500" /> Target Project
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

                                    {saveResult && (
                                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
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
                                        disabled={selectedLeadsCount === 0 || phase === 'saving' || phase === 'saved'}
                                        className={cls(
                                            'w-full py-3 rounded-lg font-black text-sm transition-all flex items-center justify-center gap-2',
                                            selectedLeadsCount > 0 && phase !== 'saved'
                                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        )}
                                    >
                                        {phase === 'saving' ? (
                                            <><i className="fas fa-spinner fa-spin" /> Saving...</>
                                        ) : phase === 'saved' ? (
                                            <><i className="fas fa-check" /> Successfully Imported</>
                                        ) : (
                                            <><i className="fas fa-plus-circle" /> Add {selectedLeadsCount} Lead{selectedLeadsCount !== 1 ? 's' : ''}</>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* ── RIGHT: Results Table ── */}
                <div className="space-y-6">

                    {phase === 'idle' && (
                        <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-16 text-center">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg flex items-center justify-center">
                                <i className="fas fa-file-import text-slate-300 text-4xl" />
                            </div>
                            <p className="text-xl font-black text-slate-700 mb-2">Waiting for Data</p>
                            <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                                Upload a spreadsheet on the left to begin. You'll be able to review and filter leads before they hit your database.
                            </p>
                        </div>
                    )}

                    {phase === 'parsing' && (
                        <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-20 text-center animate-pulse">
                            <i className="fas fa-spinner fa-spin text-4xl text-indigo-500 mb-4" />
                            <p className="text-lg font-black text-slate-800">Reading File...</p>
                            <p className="text-sm text-slate-400 mt-1">Extracting lead data and mapping columns.</p>
                        </div>
                    )}

                    {phase === 'error' && (
                        <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-10 space-y-5">
                            <div className="p-5 bg-red-50 border border-red-100 rounded-lg flex items-start gap-4">
                                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <i className="fas fa-exclamation-triangle text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-black text-red-900 mb-1">Import Failed</p>
                                    <p className="text-sm text-red-700 leading-relaxed">{error}</p>
                                    <button
                                        onClick={() => setPhase('idle')}
                                        className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-black rounded-lg transition-all"
                                    >
                                        Try Another File
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {(phase === 'results' || phase === 'saved' || phase === 'saving') && (
                        <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">

                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-100">
                                        <i className="fas fa-check text-[9px]" />{leads.length} leads found
                                    </span>
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-lg border border-indigo-100">
                                        <i className="fas fa-check-square text-[9px]" />{selectedLeadsCount} to import
                                    </span>
                                </div>
                                <button
                                    onClick={() => setPhase('idle')}
                                    className="text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
                                >
                                    <i className="fas fa-redo text-[9px]" /> Change File
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px]">
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
                                            {['Name', 'Company', 'Email', 'Phone', 'Website', 'Category'].map((h) => (
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

                            <div className="p-4 bg-slate-50 border-t border-slate-100">
                                <p className="text-[10px] text-slate-400 italic">
                                    Column mapping is automatic. If data looks incorrect, please ensure your header names are clear (e.g., "Full Name", "Email Address").
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default LeadsImport;
