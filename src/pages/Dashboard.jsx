import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TitleComponent from '../components/titleComponent/titleComponent'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

const Dashboard = () => {
    const [hoveredCard, setHoveredCard] = useState(null)
    const navigate = useNavigate()

    /**
     * Product Rule: Outreach is engagement-based.
     * 1. Initial email sent once.
     * 2. If opened -> Lead becomes "Eligible" for follow-up.
     * 3. If NOT opened -> Outreach STOPS automatically.
     */
    const stats = [
        {
            id: 1,
            label: 'Eligible for Follow-up',
            value: '456',
            description: 'Recipients who opened and await next step',
            icon: 'fa-user-check',
            gradient: 'from-blue-500 to-indigo-500',
            percentage: 35
        },
        {
            id: 2,
            label: 'Outreach Stopped',
            value: '1,889',
            description: 'Automatically halted (No initial open)',
            icon: 'fa-hand-paper',
            gradient: 'from-orange-500 to-red-500',
            percentage: 80
        },
        {
            id: 3,
            label: 'Initial Open Ratio',
            value: '19.4%',
            description: 'Primary conversion signal',
            icon: 'fa-envelope-open-text',
            gradient: 'from-emerald-500 to-teal-500',
            percentage: 20
        },
        {
            id: 4,
            label: 'Pending Initial',
            value: '124',
            description: 'Scheduled for first-time outreach',
            icon: 'fa-clock',
            gradient: 'from-purple-500 to-pink-500',
            percentage: 45
        }
    ]

    const recentCampaigns = [
        { id: 1, name: 'Jan Sales Outreach', status: 'Active', sent: 1234, opened: 456, stopped: 778, eligible: 456 },
        { id: 2, name: 'Product Update Q1', status: 'Active', sent: 892, opened: 301, stopped: 591, eligible: 301 },
        { id: 3, name: 'Re-engagement Batch', status: 'Paused', sent: 567, opened: 198, stopped: 369, eligible: 198 },
        { id: 4, name: 'Tech Conf Follow-up', status: 'Completed', sent: 2100, opened: 834, stopped: 1266, eligible: 834 }
    ]

    const quickActions = [
        {
            id: 1,
            title: 'View Eligible Leads',
            description: 'Manage leads who engaged with your first email',
            icon: 'fa-users',
            gradient: 'from-indigo-500 to-purple-600',
            iconBg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
            path: '/dashboard/leads?filter=eligible'
        },
        {
            id: 2,
            title: 'Start New Outreach',
            description: 'Send initial emails to new prospects',
            icon: 'fa-paper-plane',
            gradient: 'from-emerald-500 to-teal-600',
            iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
            path: '/dashboard/campaigns/create'
        }
    ]

    return (
        <div className="min-h-screen space-y-8">
            {/* Page Header with Gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 shadow-xl">
                <div className="absolute inset-0 bg-blue-500 opacity-5" />

                <div className="relative z-10">
                    <TitleComponent type="h1" className="text-white text-4xl font-bold mb-2">
                        Outreach Signals
                    </TitleComponent>
                    <TitleComponent type="p" size="lg" className="text-slate-300">
                        Monitor engagement-based outreach status and identified opportunities.
                    </TitleComponent>
                </div>
            </div>

            {/* Stats Grid - Focused on Decision Signals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div
                        key={stat.id}
                        className="group relative overflow-hidden rounded-2xl bg-white shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300"
                        onMouseEnter={() => setHoveredCard(stat.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <TitleComponent type="p" size="small" className="text-slate-500 uppercase tracking-wide font-semibold mb-1">
                                        {stat.label}
                                    </TitleComponent>
                                    <TitleComponent type="h2" className="text-slate-900 text-3xl font-bold">
                                        {stat.value}
                                    </TitleComponent>
                                </div>
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm`}>
                                    <i className={`fas ${stat.icon} text-white text-xl`} />
                                </div>
                            </div>
                            <TitleComponent type="p" size="small" className="text-slate-500 mb-4">
                                {stat.description}
                            </TitleComponent>
                            <div className="relative w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`absolute top-0 left-0 h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-1000 ease-out`}
                                    style={{ width: hoveredCard === stat.id ? `${stat.percentage}%` : '50%' }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Campaign Comparison Table */}
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg border border-slate-100">
                <div className="border-b border-slate-100 bg-slate-50/50 p-6">
                    <TitleComponent type="h3" className="text-slate-900 text-xl font-bold">
                        Outreach Performance
                    </TitleComponent>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr className="border-b border-slate-200 text-left">
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase">Campaign</th>
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase">Sent</th>
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase">Opened (Eligible)</th>
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase">Not Opened (Stopped)</th>
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase text-right">Yield</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentCampaigns.map((campaign) => (
                                <tr key={campaign.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-4 px-6 font-medium text-slate-900">{campaign.name}</td>
                                    <td className="py-4 px-6 text-slate-600">{campaign.sent}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-emerald-600 font-semibold">{campaign.opened}</span>
                                            <Badge variant="success">Eligible</Badge>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-slate-500">{campaign.stopped}</span>
                                            <Badge variant="default">Stopped</Badge>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right font-bold text-slate-700">
                                        {Math.round((campaign.opened / campaign.sent) * 100)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Action Signals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                {quickActions.map((action) => (
                    <div
                        key={action.id}
                        onClick={() => navigate(action.path)}
                        className="group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-lg border border-slate-200 transition-all duration-300 cursor-pointer p-8"
                    >
                        <div className="flex items-center space-x-6">
                            <div className={`w-16 h-16 rounded-2xl ${action.iconBg} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform`}>
                                <i className={`fas ${action.icon} text-white text-2xl`} />
                            </div>
                            <div className="flex-1">
                                <TitleComponent type="h3" className="text-slate-900 font-bold text-xl mb-1">
                                    {action.title}
                                </TitleComponent>
                                <TitleComponent type="p" size="base" className="text-slate-500">
                                    {action.description}
                                </TitleComponent>
                            </div>
                            <i className="fas fa-chevron-right text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Dashboard
