import { useMemo } from 'react'
import DataTable from 'react-data-table-component'
import TitleComponent from '../components/titleComponent/titleComponent'
import Badge from '../components/ui/Badge'
import OptimizationInsights from '../components/ui/OptimizationInsights'

const Analytics = () => {
    /**
     * Product Rule Context:
     * We track outreach funnel efficiency.
     * Primary Funnel: Sent -> Opened (Eligible) -> Follow-up -> Reply.
     * Secondary Signal: Not Opened (Stopped).
     */
    const campaignActionStats = [
        { name: 'Jan SME Outreach', sent: 1234, eligible: 456, stopped: 778, followUpSent: 210, replies: 28 },
        { name: 'Tech Conf Batch', sent: 2100, eligible: 834, stopped: 1266, followUpSent: 402, replies: 64 },
        { name: 'Venture Leads Q1', sent: 892, eligible: 301, stopped: 591, followUpSent: 156, replies: 12 },
    ]

    const overviewSummary = [
        { label: 'Avg. Open Signal', value: '19.4%', description: 'Initial engagement rate' },
        { label: 'Auto-Stop Efficiency', value: '80.6%', description: 'Leads saved from spamming' },
        { label: 'Follow-up Yield', value: '7.2%', description: 'Engagement to reply ratio' },
    ]

    const columns = useMemo(() => [
        {
            name: 'Campaign',
            selector: row => row.name,
            sortable: true,
            grow: 2,
            cell: row => <span className="font-bold text-slate-900">{row.name}</span>
        },
        {
            name: 'Initial Sent',
            selector: row => row.sent,
            sortable: true,
            center: true,
            cell: row => <span className="text-slate-600">{row.sent.toLocaleString()}</span>
        },
        {
            name: 'Engaged (Eligible)',
            selector: row => row.eligible,
            sortable: true,
            center: true,
            cell: row => (
                <div className="text-center">
                    <span className="text-emerald-600 font-bold block">{row.eligible.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 font-medium">({((row.eligible / row.sent) * 100).toFixed(1)}% Open)</span>
                </div>
            )
        },
        {
            name: 'Ignored (Stopped)',
            selector: row => row.stopped,
            sortable: true,
            center: true,
            cell: row => (
                <div className="text-center">
                    <span className="text-slate-400 font-medium block">{row.stopped.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400">({((row.stopped / row.sent) * 100).toFixed(1)}% Halted)</span>
                </div>
            )
        },
        {
            name: 'Follow-up',
            selector: row => row.followUpSent,
            sortable: true,
            center: true,
            cell: row => (
                <div className="text-center">
                    <span className="text-indigo-600 font-bold block">{row.followUpSent.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 font-medium">({((row.followUpSent / row.eligible) * 100).toFixed(1)}% Retained)</span>
                </div>
            )
        },
        {
            name: 'Final Reply Yield',
            selector: row => (row.replies / row.sent),
            sortable: true,
            right: true,
            cell: row => (
                <span className="font-black text-slate-900 pr-4">
                    {((row.replies / row.sent) * 100).toFixed(1)}%
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
                minHeight: '80px',
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
    }

    return (
        <div className="min-h-screen space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <TitleComponent type="h1" className="text-slate-900 text-3xl font-bold">
                        Yield Analytics
                    </TitleComponent>
                    <TitleComponent type="p" size="base" className="text-slate-500 mt-1">
                        Actionable signals and engagement-based funnel performance.
                    </TitleComponent>
                </div>
            </div>

            {/* Signal Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {overviewSummary.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</h2>
                        <p className="text-sm text-slate-400">{stat.description}</p>
                    </div>
                ))}
            </div>

            {/* Funnel Performance Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-xl text-slate-900">Campaign engagement Analysis</h3>
                </div>
                <DataTable
                    columns={columns}
                    data={campaignActionStats}
                    customStyles={customStyles}
                    highlightOnHover
                    pointerOnHover
                    responsive
                />
            </div>

            {/* AI Optimization Insights */}
            <OptimizationInsights />

            {/* System Decisions Insight */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900 p-8 rounded-3xl text-white">
                    <h4 className="text-lg font-bold mb-4">Auto-Stop Decision Log</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                            <span className="text-slate-400 text-sm font-medium">Domain Health Saved</span>
                            <Badge variant="success">High</Badge>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                            <span className="text-slate-400 text-sm font-medium">Unnecessary Follow-ups Blocked</span>
                            <span className="font-bold">2,635</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                            <span className="text-slate-400 text-sm font-medium">Lead Sentiment Protected</span>
                            <span className="font-bold underline">Monitoring</span>
                        </div>
                    </div>
                    <p className="mt-6 text-xs text-slate-500 leading-relaxed italic">
                        Values above indicate how the engagement-first rule protects your sender reputation by preventing automated follow-ups to non-responsive leads.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200">
                    <h4 className="text-lg font-bold text-slate-900 mb-6 font-idGrotesk">Yield Trend (Last 30 Days)</h4>
                    {/* Simplified Visual Indicator */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                <span>Signal Pickup</span>
                                <span>78%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[78%]" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                <span>Conversion Velocity</span>
                                <span>42%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[42%]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Analytics


