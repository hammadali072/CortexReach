import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import DataTable from 'react-data-table-component'
import TitleComponent from '../components/titleComponent/titleComponent'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'

const Campaigns = () => {
    /**
     * Product Rule: 
     * Stopped = Recipients who did NOT open initial email.
     * Yield = Opened / Total.
     */
    const campaigns = [
        {
            id: 1,
            name: 'Jan SME Outreach',
            status: 'Active',
            totalLeads: 1234,
            opened: 456,
            stopped: 778,
            sentDate: '2026-01-15'
        },
        {
            id: 2,
            name: 'Growth Series B',
            status: 'Draft',
            totalLeads: 892,
            opened: 0,
            stopped: 0,
            sentDate: '-'
        },
        {
            id: 3,
            name: 'Tech Stack Update',
            status: 'Completed',
            totalLeads: 2100,
            opened: 834,
            stopped: 1266,
            sentDate: '2026-01-10'
        }
    ]

    const getStatusBadge = (status) => {
        const variants = {
            'Draft': 'default',
            'Active': 'primary',
            'Completed': 'success'
        }
        return variants[status] || 'default'
    }

    const columns = useMemo(() => [
        {
            name: 'Campaign Name',
            selector: row => row.name,
            sortable: true,
            cell: row => (
                <Link to={`/campaigns/${row.id}`} className="font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                    {row.name}
                </Link>
            ),
            grow: 2,
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            cell: row => (
                <Badge variant={getStatusBadge(row.status)}>
                    {row.status}
                </Badge>
            )
        },
        {
            name: 'Total Leads',
            selector: row => row.totalLeads,
            sortable: true,
            center: true,
            cell: row => <span className="text-slate-700 font-medium">{row.totalLeads.toLocaleString()}</span>
        },
        {
            name: 'Opened',
            selector: row => row.opened,
            sortable: true,
            center: true,
            cell: row => <span className="text-emerald-600 font-bold">{row.opened.toLocaleString()}</span>
        },
        {
            name: 'Stopped',
            selector: row => row.stopped,
            sortable: true,
            center: true,
            cell: row => <span className="text-slate-400 font-medium">{row.stopped.toLocaleString()}</span>
        },
        {
            name: 'First Sent',
            selector: row => row.sentDate,
            sortable: true,
            cell: row => <span className="text-slate-500 text-sm">{row.sentDate}</span>
        },
        {
            name: 'Yield',
            selector: row => row.totalLeads > 0 ? (row.opened / row.totalLeads) : 0,
            sortable: true,
            right: true,
            cell: row => (
                <span className="font-bold text-slate-900">
                    {row.totalLeads > 0 && row.opened > 0
                        ? `${((row.opened / row.totalLeads) * 100).toFixed(1)}%`
                        : '0%'}
                </span>
            )
        }
    ], [])

    const customStyles = {
        table: {
            style: {
                backgroundColor: 'transparent',
            },
        },
        headRow: {
            style: {
                backgroundColor: '#f8fafc',
                borderBottomWidth: '1px',
                borderBottomColor: '#f1f5f9',
                minHeight: '64px',
            },
        },
        headCells: {
            style: {
                color: '#64748b',
                fontSize: '0.75rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
            },
        },
        rows: {
            style: {
                minHeight: '72px',
                '&:not(:last-child)': {
                    borderBottomWidth: '1px',
                    borderBottomColor: '#f8fafc',
                },
                '&:hover': {
                    backgroundColor: '#f8fafc',
                    transitionDuration: '0.15s',
                    transitionProperty: 'background-color',
                },
            },
        },
        cells: {
            style: {
                paddingLeft: '1.5rem',
                paddingRight: '1.5rem',
            },
        },
    }

    return (
        <div className="min-h-screen space-y-8 pb-12">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <TitleComponent type="h1" className="text-slate-900 text-3xl font-bold">
                        Campaigns
                    </TitleComponent>
                    <TitleComponent type="p" size="base" className="text-slate-500 mt-1">
                        Comparative overview of outreach performance and yield.
                    </TitleComponent>
                </div>
                <Link to="/campaigns/create">
                    <Button variant="primary">
                        <i className="fas fa-plus mr-2"></i>
                        New Outreach
                    </Button>
                </Link>
            </div>

            {/* Campaign Comparison Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={campaigns}
                    customStyles={customStyles}
                    highlightOnHover
                    pointerOnHover
                    responsive
                />
            </div>

            {campaigns.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <i className="fas fa-paper-plane text-slate-200 text-6xl mb-4"></i>
                    <h3 className="text-xl font-bold text-slate-900">No campaigns started</h3>
                    <p className="text-slate-500 mb-6">Launch your first engagement-only outreach.</p>
                    <Link to="/campaigns/create">
                        <Button variant="primary">Create Campaign</Button>
                    </Link>
                </div>
            )}
        </div>
    )
}

export default Campaigns


