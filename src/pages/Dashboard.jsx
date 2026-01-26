import { useState } from 'react'
import TitleComponent from '../components/titleComponent/titleComponent'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

const Dashboard = () => {
    const [hoveredCard, setHoveredCard] = useState(null)

    // Placeholder data - will be replaced with API calls
    const stats = [
        {
            id: 1,
            label: 'Total Leads',
            value: '2,345',
            change: '+12.5%',
            changeType: 'increase',
            icon: 'fa-users',
            gradient: 'from-blue-500 to-cyan-500',
            lightBg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
            percentage: 75
        },
        {
            id: 2,
            label: 'Emails Sent',
            value: '48,362',
            change: '+8.2%',
            changeType: 'increase',
            icon: 'fa-envelope',
            gradient: 'from-emerald-500 to-teal-500',
            lightBg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
            percentage: 92
        },
        {
            id: 3,
            label: 'Open Rate',
            value: '42.8%',
            change: '-2.1%',
            changeType: 'decrease',
            icon: 'fa-envelope-open',
            gradient: 'from-amber-500 to-orange-500',
            lightBg: 'bg-gradient-to-br from-amber-50 to-orange-50',
            percentage: 43
        },
        {
            id: 4,
            label: 'Active Campaigns',
            value: '12',
            change: '+3',
            changeType: 'increase',
            icon: 'fa-chart-line',
            gradient: 'from-purple-500 to-pink-500',
            lightBg: 'bg-gradient-to-br from-purple-50 to-pink-50',
            percentage: 60
        }
    ]

    const recentCampaigns = [
        { id: 1, name: 'Q1 Outreach Campaign', status: 'Active', sent: 1234, opened: 456, replied: 78, openRate: 37 },
        { id: 2, name: 'Product Launch Series', status: 'Active', sent: 892, opened: 301, replied: 45, openRate: 34 },
        { id: 3, name: 'Follow-up Sequence', status: 'Paused', sent: 567, opened: 198, replied: 23, openRate: 35 },
        { id: 4, name: 'Cold Outreach Batch 5', status: 'Completed', sent: 2100, opened: 834, replied: 102, openRate: 40 }
    ]

    const quickActions = [
        {
            id: 1,
            title: 'Create Campaign',
            description: 'Start a new outreach',
            icon: 'fa-plus',
            gradient: 'from-blue-500 to-indigo-600',
            iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600'
        },
        {
            id: 2,
            title: 'Import Leads',
            description: 'Add new contacts',
            icon: 'fa-user-plus',
            gradient: 'from-emerald-500 to-green-600',
            iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600'
        },
        {
            id: 3,
            title: 'View Analytics',
            description: 'Check performance',
            icon: 'fa-chart-bar',
            gradient: 'from-purple-500 to-fuchsia-600',
            iconBg: 'bg-gradient-to-br from-purple-500 to-fuchsia-600'
        }
    ]

    return (
        <div className="min-h-screen space-y-8">
            {/* Page Header with Gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 shadow-xl">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -ml-32 -mb-32"></div>

                <div className="relative z-10">
                    <TitleComponent type="h1" className="text-white text-4xl font-bold mb-2">
                        Dashboard
                    </TitleComponent>
                    <TitleComponent type="p" size="lg" className="text-white/90">
                        Welcome back! Here's what's happening with your campaigns today.
                    </TitleComponent>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-4 right-4 flex space-x-2">
                    <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse delay-150"></div>
                </div>
            </div>

            {/* Stats Grid with Modern Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div
                        key={stat.id}
                        className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                        onMouseEnter={() => setHoveredCard(stat.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        {/* Gradient Background Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                        {/* Card Content */}
                        <div className="relative p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <TitleComponent type="p" size="small" className="text-gray-500 uppercase tracking-wide font-semibold mb-2">
                                        {stat.label}
                                    </TitleComponent>
                                    <TitleComponent type="h2" className="text-gray-900 text-3xl font-bold">
                                        {stat.value}
                                    </TitleComponent>
                                </div>

                                {/* Icon with Gradient */}
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                                    <i className={`fas ${stat.icon} text-white text-xl`}></i>
                                </div>
                            </div>

                            {/* Change Indicator with Arrow */}
                            <div className="flex items-center space-x-2 mb-3">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${stat.changeType === 'increase'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}>
                                    <i className={`fas fa-arrow-${stat.changeType === 'increase' ? 'up' : 'down'} mr-1`}></i>
                                    {stat.change}
                                </span>
                                <span className="text-xs text-gray-500">vs last month</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`absolute top-0 left-0 h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-1000 ease-out`}
                                    style={{ width: hoveredCard === stat.id ? `${stat.percentage}%` : '0%' }}
                                ></div>
                            </div>
                        </div>

                        {/* Bottom Accent Line */}
                        <div className={`h-1 bg-gradient-to-r ${stat.gradient}`}></div>
                    </div>
                ))}
            </div>

            {/* Recent Campaigns with Glassmorphism */}
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl">
                {/* Header with Gradient Accent */}
                <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <TitleComponent type="h3" className="text-gray-900 text-2xl font-bold mb-1">
                                Recent Campaigns
                            </TitleComponent>
                            <TitleComponent type="p" size="small" className="text-gray-500">
                                Track your campaign performance in real-time
                            </TitleComponent>
                        </div>
                        <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold text-sm">
                            View All
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left py-4 px-6">
                                    <TitleComponent type="p" size="small-semibold" className="text-gray-600 uppercase tracking-wider">
                                        Campaign Name
                                    </TitleComponent>
                                </th>
                                <th className="text-left py-4 px-6">
                                    <TitleComponent type="p" size="small-semibold" className="text-gray-600 uppercase tracking-wider">
                                        Status
                                    </TitleComponent>
                                </th>
                                <th className="text-left py-4 px-6">
                                    <TitleComponent type="p" size="small-semibold" className="text-gray-600 uppercase tracking-wider">
                                        Sent
                                    </TitleComponent>
                                </th>
                                <th className="text-left py-4 px-6">
                                    <TitleComponent type="p" size="small-semibold" className="text-gray-600 uppercase tracking-wider">
                                        Opened
                                    </TitleComponent>
                                </th>
                                <th className="text-left py-4 px-6">
                                    <TitleComponent type="p" size="small-semibold" className="text-gray-600 uppercase tracking-wider">
                                        Replied
                                    </TitleComponent>
                                </th>
                                <th className="text-left py-4 px-6">
                                    <TitleComponent type="p" size="small-semibold" className="text-gray-600 uppercase tracking-wider">
                                        Open Rate
                                    </TitleComponent>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentCampaigns.map((campaign, index) => (
                                <tr
                                    key={campaign.id}
                                    className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50/30 hover:to-purple-50/30 transition-all duration-200 group"
                                >
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center font-bold text-indigo-600">
                                                {campaign.name.charAt(0)}
                                            </div>
                                            <TitleComponent type="p" size="base" className="text-gray-900 font-semibold group-hover:text-indigo-600 transition-colors">
                                                {campaign.name}
                                            </TitleComponent>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <Badge
                                            variant={
                                                campaign.status === 'Active' ? 'success' :
                                                    campaign.status === 'Paused' ? 'warning' : 'default'
                                            }
                                        >
                                            <i className={`fas fa-circle text-xs mr-1.5 ${campaign.status === 'Active' ? 'animate-pulse' : ''
                                                }`}></i>
                                            {campaign.status}
                                        </Badge>
                                    </td>
                                    <td className="py-4 px-6">
                                        <TitleComponent type="p" size="base" className="text-gray-700 font-medium">
                                            {campaign.sent.toLocaleString()}
                                        </TitleComponent>
                                    </td>
                                    <td className="py-4 px-6">
                                        <TitleComponent type="p" size="base" className="text-gray-700 font-medium">
                                            {campaign.opened.toLocaleString()}
                                        </TitleComponent>
                                    </td>
                                    <td className="py-4 px-6">
                                        <TitleComponent type="p" size="base" className="text-gray-700 font-medium">
                                            {campaign.replied.toLocaleString()}
                                        </TitleComponent>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-2">
                                            <div className="flex-1 w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                                                    style={{ width: `${campaign.openRate}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700 w-12">{campaign.openRate}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Actions with Enhanced Design */}
            <div>
                <TitleComponent type="h3" className="text-gray-900 text-2xl font-bold mb-6">
                    Quick Actions
                </TitleComponent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {quickActions.map((action) => (
                        <div
                            key={action.id}
                            className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
                        >
                            {/* Gradient Background on Hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                            {/* Content */}
                            <div className="relative p-6">
                                <div className="flex items-center space-x-4">
                                    {/* Icon */}
                                    <div className={`w-16 h-16 rounded-xl ${action.iconBg} flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                                        <i className={`fas ${action.icon} text-white text-2xl`}></i>
                                    </div>

                                    {/* Text */}
                                    <div className="flex-1">
                                        <TitleComponent type="h4" className="text-gray-900 group-hover:text-white font-bold mb-1 transition-colors">
                                            {action.title}
                                        </TitleComponent>
                                        <TitleComponent type="p" size="small" className="text-gray-600 group-hover:text-white/90 transition-colors">
                                            {action.description}
                                        </TitleComponent>
                                    </div>

                                    {/* Arrow Icon */}
                                    <div className="text-gray-400 group-hover:text-white transform group-hover:translate-x-1 transition-all duration-300">
                                        <i className="fas fa-arrow-right text-lg"></i>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Accent */}
                            <div className={`h-1.5 bg-gradient-to-r ${action.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
