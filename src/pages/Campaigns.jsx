// src/pages/Campaigns.jsx — Phase 4: Reads campaigns from Firebase Realtime DB
import { useMemo, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import DataTable from 'react-data-table-component'
import TitleComponent from '../components/titleComponent/titleComponent'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { getUserCampaigns } from '../services/db'

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
            setCampaigns(data.sort((a, b) => b.createdAt - a.createdAt))
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
        const map = { draft: 'default', active: 'primary', completed: 'success', paused: 'info' }
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
                <Link to={`/dashboard/campaigns/${row.id}`} className="font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                    {row.name}
                </Link>
            ),
        },
        {
            name: 'Type',
            selector: row => row.type,
            sortable: true,
            cell: row => <Badge variant={row.type === 'initial' ? 'primary' : 'info'}>{row.type}</Badge>
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            cell: row => <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
        },
        {
            name: 'Created',
            selector: row => row.createdAt,
            sortable: true,
            cell: row => <span className="text-slate-500 text-sm">{new Date(row.createdAt).toLocaleDateString()}</span>
        },
    ], [])

    const customStyles = {
        table: { style: { backgroundColor: 'transparent' } },
        headRow: { style: { backgroundColor: '#f8fafc', borderBottomWidth: '1px', borderBottomColor: '#f1f5f9', minHeight: '64px' } },
        headCells: { style: { color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' } },
        rows: { style: { minHeight: '72px', '&:not(:last-child)': { borderBottomWidth: '1px', borderBottomColor: '#f8fafc' }, '&:hover': { backgroundColor: '#f8fafc' } } },
        cells: { style: { paddingLeft: '1.5rem', paddingRight: '1.5rem' } },
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
        </div>
    )
}

export default Campaigns
