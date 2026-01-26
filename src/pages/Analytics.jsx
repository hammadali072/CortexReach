import TitleComponent from '../components/titleComponent/titleComponent'
import Card from '../components/ui/Card'

const Analytics = () => {
    // Placeholder data - will be replaced with actual chart libraries
    const overviewStats = [
        { label: 'Total Opens', value: '12,456', change: '+15.3%', trend: 'up' },
        { label: 'Total Clicks', value: '3,284', change: '+8.7%', trend: 'up' },
        { label: 'Total Replies', value: '892', change: '+22.1%', trend: 'up' },
        { label: 'Bounce Rate', value: '2.4%', change: '-1.2%', trend: 'down' }
    ]

    const topCampaigns = [
        { name: 'Q1 Outreach', openRate: 48.2, replyRate: 12.3 },
        { name: 'Product Launch', openRate: 45.8, replyRate: 10.1 },
        { name: 'Follow-up Series', openRate: 38.9, replyRate: 8.5 },
        { name: 'Cold Outreach', openRate: 35.2, replyRate: 6.8 }
    ]

    const engagementByDay = [
        { day: 'Monday', opens: 234, clicks: 67 },
        { day: 'Tuesday', opens: 289, clicks: 82 },
        { day: 'Wednesday', opens: 256, clicks: 71 },
        { day: 'Thursday', opens: 312, clicks: 95 },
        { day: 'Friday', opens: 198, clicks: 54 }
    ]

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <TitleComponent type="h2" className="text-gray-800">
                        Analytics
                    </TitleComponent>
                    <TitleComponent type="p" size="base" className="text-gray-600 mt-1">
                        Track and analyze your campaign performance
                    </TitleComponent>
                </div>
                <div className="flex gap-2">
                    <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>Last 90 days</option>
                        <option>All time</option>
                    </select>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {overviewStats.map((stat, index) => (
                    <Card key={index}>
                        <TitleComponent type="p" size="small" className="text-gray-600">
                            {stat.label}
                        </TitleComponent>
                        <TitleComponent type="h3" className="text-gray-900 mt-1">
                            {stat.value}
                        </TitleComponent>
                        <div className="flex items-center gap-1 mt-2">
                            <i className={`fas fa-arrow-${stat.trend === 'up' ? 'up' : 'down'} text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                }`}></i>
                            <TitleComponent
                                type="p"
                                size="small"
                                className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}
                            >
                                {stat.change}
                            </TitleComponent>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Engagement Over Time - Placeholder Chart */}
                <Card>
                    <TitleComponent type="h4" className="text-gray-800 mb-4">
                        Engagement This Week
                    </TitleComponent>

                    {/* Simple Bar Chart Placeholder */}
                    <div className="space-y-3">
                        {engagementByDay.map((day, index) => (
                            <div key={index}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-700">{day.day}</span>
                                    <span className="text-gray-600">{day.opens} opens</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-blue-600 h-3 rounded-full"
                                        style={{ width: `${(day.opens / 312) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <TitleComponent type="p" size="small" className="text-gray-500 mt-4">
                        <i className="fas fa-info-circle mr-1"></i>
                        Chart library integration placeholder
                    </TitleComponent>
                </Card>

                {/* Top Performing Campaigns */}
                <Card>
                    <TitleComponent type="h4" className="text-gray-800 mb-4">
                        Top Performing Campaigns
                    </TitleComponent>

                    <div className="space-y-4">
                        {topCampaigns.map((campaign, index) => (
                            <div key={index} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                                <div className="flex justify-between items-start mb-2">
                                    <TitleComponent type="p" size="base-medium" className="text-gray-900">
                                        {campaign.name}
                                    </TitleComponent>
                                    <span className="text-xs text-gray-500">#{index + 1}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <TitleComponent type="p" size="small" className="text-gray-600">
                                            Open Rate
                                        </TitleComponent>
                                        <TitleComponent type="p" size="base-semibold" className="text-blue-600">
                                            {campaign.openRate}%
                                        </TitleComponent>
                                    </div>
                                    <div>
                                        <TitleComponent type="p" size="small" className="text-gray-600">
                                            Reply Rate
                                        </TitleComponent>
                                        <TitleComponent type="p" size="base-semibold" className="text-green-600">
                                            {campaign.replyRate}%
                                        </TitleComponent>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Detailed Metrics */}
            <Card>
                <TitleComponent type="h4" className="text-gray-800 mb-4">
                    Detailed Metrics
                </TitleComponent>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left py-3 px-4">
                                    <TitleComponent type="p" size="small-semibold" className="text-gray-600">
                                        Metric
                                    </TitleComponent>
                                </th>
                                <th className="text-left py-3 px-4">
                                    <TitleComponent type="p" size="small-semibold" className="text-gray-600">
                                        Count
                                    </TitleComponent>
                                </th>
                                <th className="text-left py-3 px-4">
                                    <TitleComponent type="p" size="small-semibold" className="text-gray-600">
                                        Rate
                                    </TitleComponent>
                                </th>
                                <th className="text-left py-3 px-4">
                                    <TitleComponent type="p" size="small-semibold" className="text-gray-600">
                                        Change
                                    </TitleComponent>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-100">
                                <td className="py-3 px-4">
                                    <TitleComponent type="p" size="base" className="text-gray-900">
                                        Emails Sent
                                    </TitleComponent>
                                </td>
                                <td className="py-3 px-4">
                                    <TitleComponent type="p" size="base" className="text-gray-700">
                                        48,362
                                    </TitleComponent>
                                </td>
                                <td className="py-3 px-4">
                                    <TitleComponent type="p" size="base" className="text-gray-700">
                                        -
                                    </TitleComponent>
                                </td>
                                <td className="py-3 px-4">
                                    <TitleComponent type="p" size="base" className="text-green-600">
                                        +8.2%
                                    </TitleComponent>
                                </td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-3 px-4">
                                    <TitleComponent type="p" size="base" className="text-gray-900">
                                        Emails Opened
                                    </TitleComponent>
                                </td>
                                <td className="py-3 px-4">
                                    <TitleComponent type="p" size="base" className="text-gray-700">
                                        12,456
                                    </TitleComponent>
                                </td>
                                <td className="py-3 px-4">
                                    <TitleComponent type="p" size="base" className="text-gray-700">
                                        25.8%
                                    </TitleComponent>
                                </td>
                                <td className="py-3 px-4">
                                    <TitleComponent type="p" size="base" className="text-green-600">
                                        +15.3%
                                    </TitleComponent>
                                </td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-3 px-4">
                                    <TitleComponent type="p" size="base" className="text-gray-900">
                                        Links Clicked
                                    </TitleComponent>
                                </td>
                                <td className="py-3 px-4">
                                    <TitleComponent type="p" size="base" className="text-gray-700">
                                        3,284
                                    </TitleComponent>
                                </td>
                                <td className="py-3 px-4">
                                    <TitleComponent type="p" size="base" className="text-gray-700">
                                        6.8%
                                    </TitleComponent>
                                </td>
                                <td className="py-3 px-4">
                                    <TitleComponent type="p" size="base" className="text-green-600">
                                        +8.7%
                                    </TitleComponent>
                                </td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-3 px-4">
                                    <TitleComponent type="p" size="base" className="text-gray-900">
                                        Replies Received
                                    </TitleComponent>
                                </td>
                                <td className="py-3 px-4">
                                    <TitleComponent type="p" size="base" className="text-gray-700">
                                        892
                                    </TitleComponent>
                                </td>
                                <td className="py-3 px-4">
                                    <TitleComponent type="p" size="base" className="text-gray-700">
                                        1.8%
                                    </TitleComponent>
                                </td>
                                <td className="py-3 px-4">
                                    <TitleComponent type="p" size="base" className="text-green-600">
                                        +22.1%
                                    </TitleComponent>
                                </td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4">
                                    <TitleComponent type="p" size="base" className="text-gray-900">
                                        Bounced
                                    </TitleComponent>
                                </td>
                                <td className="py-3 px-4">
                                    <TitleComponent type="p" size="base" className="text-gray-700">
                                        1,161
                                    </TitleComponent>
                                </td>
                                <td className="py-3 px-4">
                                    <TitleComponent type="p" size="base" className="text-gray-700">
                                        2.4%
                                    </TitleComponent>
                                </td>
                                <td className="py-3 px-4">
                                    <TitleComponent type="p" size="base" className="text-green-600">
                                        -1.2%
                                    </TitleComponent>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}

export default Analytics
