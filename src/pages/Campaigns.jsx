// src/pages/Campaigns.jsx — Phase 4: Reads campaigns from Firebase Realtime DB
import { useMemo, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import DataTable from 'react-data-table-component'
import TitleComponent from '../components/titleComponent/titleComponent'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { getUserCampaigns, getCampaignAudienceCount, getCampaignSends, deleteCampaign } from '../services/db'
import Modal from '../components/ui/Modal'

const Campaigns = () => {
    const { currentUser } = useAuth()

    // ── DB state ────────────────────────────────────────────────────────────
    const [campaigns, setCampaigns] = useState([])
    const [dbLoading, setDbLoading] = useState(true)
    const [dbError, setDbError] = useState('')

    const load = useCallback(async () => {
        if (!currentUser) return
        try {
            setDbLoading(true)
            setDbError('')
            const data = await getUserCampaigns(currentUser.uid)

            // For each campaign, fetch dynamic stats: audience count and open count
            const expandedData = await Promise.all(data.map(async (c) => {
                const audienceCount = await getCampaignAudienceCount(c.id)
                const sends = await getCampaignSends(c.id)
                const openCount = sends.filter(s => s.opened).length

                // Compute yield: opened / totalLeads (using audienceCount or c.totalLeads)
                const yieldPct = audienceCount > 0 ? (openCount / audienceCount) * 100 : 0

                return {
                    ...c,
                    totalLeads: audienceCount,
                    openCount,
                    yieldPct
                }
            }))

            setCampaigns(expandedData.sort((a, b) => b.createdAt - a.createdAt))
        } catch (err) {
            console.error('[Campaigns] load error:', err)
            setDbError('Failed to load campaigns.')
        } finally {
            setDbLoading(false)
        }
    }, [currentUser])

    useEffect(() => { load() }, [load])

    // ── Status badge mapping ────────────────────────────────────────────────
    const statusVariant = (status) => {
        const map = { draft: 'default', scheduled: 'info', sent: 'primary', completed: 'success' }
        return map[status] || 'default'
    }

    // ── Columns ─────────────────────────────────────────────────────────────
    const columns = useMemo(() => [
        {
            name: 'Campaign Name',
            selector: row => row.name,
            sortable: true,
            grow: 2,
            cell: row => (
                <div className="py-2">
                    <Link to={`/dashboard/campaigns/${row.id}`} className="font-bold text-slate-900 hover:text-indigo-600 transition-colors block">
                        {row.name}
                    </Link>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {row.id.slice(-6)}</span>
                </div>
            ),
        },
        {
            name: 'Audience',
            selector: row => row.totalLeads,
            sortable: true,
            center: true,
            cell: row => <span className="font-bold text-slate-700">{row.totalLeads}</span>
        },
        {
            name: 'Opened',
            selector: row => row.openCount,
            sortable: true,
            center: true,
            cell: row => <span className="font-bold text-emerald-600">{row.openCount}</span>
        },
        {
            name: 'Yield',
            selector: row => row.yieldPct,
            sortable: true,
            center: true,
            cell: row => (
                <div className="flex flex-col items-center">
                    <span className="font-black text-indigo-600">{row.yieldPct.toFixed(1)}%</span>
                    <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${row.yieldPct}%` }} />
                    </div>
                </div>
            )
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            cell: row => <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
        },
        {
            name: 'Actions',
            center: true,
            cell: row => (
                <div className="flex items-center gap-2">
                    <Link to={`/dashboard/campaigns/${row.id}`}>
                        <button className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                            <i className="fas fa-eye text-xs" />
                        </button>
                    </Link>
                    <Link to={`/dashboard/campaigns/${row.id}/edit`}>
                        <button className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                            <i className="fas fa-edit text-xs" />
                        </button>
                    </Link>
                    <button
                        onClick={() => setConfirmDelete(row)}
                        className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                        <i className="fas fa-trash text-xs" />
                    </button>
                </div>
            )
        }
    ], [])

    const customStyles = {
        table: { style: { backgroundColor: 'transparent' } },
        headRow: { style: { backgroundColor: '#f8fafc', borderBottomWidth: '1px', borderBottomColor: '#f1f5f9', minHeight: '64px' } },
        headCells: { style: { color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' } },
        rows: { style: { minHeight: '80px', '&:not(:last-child)': { borderBottomWidth: '1px', borderBottomColor: '#f8fafc' }, '&:hover': { backgroundColor: '#f8fafc' } } },
        cells: { style: { paddingLeft: '1.5rem', paddingRight: '1.5rem' } },
    }

    // ── Deletion logic ──────────────────────────────────────────────────────
    const [confirmDelete, setConfirmDelete] = useState(null) // campaign object
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!confirmDelete) return
        setIsDeleting(true)
        try {
            await deleteCampaign(currentUser.uid, confirmDelete.projectId, confirmDelete.id)
            setConfirmDelete(null)
            load() // refresh
        } catch (err) {
            console.error('[Campaigns] delete error:', err)
            alert(err.message || 'Failed to delete campaign.')
        } finally {
            setIsDeleting(false)
        }
    }

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <TitleComponent type="h1" className="text-slate-900 text-3xl font-bold">
                        Campaigns
                    </TitleComponent>
                    <TitleComponent type="p" size="base" className="text-slate-500 mt-1">
                        Comparative overview of outreach performance and yield.
                    </TitleComponent>
                </div>
                <Link to="/dashboard/campaigns/create">
                    <Button variant="primary">
                        <i className="fas fa-plus mr-2" />
                        New Outreach
                    </Button>
                </Link>
            </div>

            {/* Error */}
            {dbError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium flex items-center gap-3">
                    <i className="fas fa-exclamation-circle" />
                    {dbError}
                    <button onClick={load} className="ml-auto text-xs font-bold underline">Retry</button>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                {dbLoading ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                        <p className="text-slate-400 text-sm font-medium">Loading campaigns...</p>
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={campaigns}
                        customStyles={customStyles}
                        highlightOnHover
                        pointerOnHover
                        responsive
                        noDataComponent={
                            <div className="py-16 text-center">
                                <i className="fas fa-paper-plane text-slate-200 text-5xl mb-4 block" />
                                <h3 className="text-lg font-bold text-slate-700">No campaigns yet</h3>
                                <p className="text-slate-400 text-sm mb-4">Launch your first engagement-only outreach.</p>
                                <Link to="/dashboard/campaigns/create">
                                    <Button variant="primary">Create Campaign</Button>
                                </Link>
                            </div>
                        }
                    />
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                title="Delete Campaign"
                size="sm"
                footer={
                    <>
                        <Button variant="outline" onClick={() => setConfirmDelete(null)} disabled={isDeleting}>Cancel</Button>
                        <Button variant="primary" className="bg-red-600 border-red-600" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-slate-600 font-medium">Are you sure you want to delete <span className="text-slate-900 font-bold">"{confirmDelete?.name}"</span>?</p>
                    <p className="text-xs text-red-500 font-bold uppercase tracking-widest">This action is permanent and will remove all associated mapping data.</p>
                </div>
            </Modal>
        </div>
    )
}

export default Campaigns
