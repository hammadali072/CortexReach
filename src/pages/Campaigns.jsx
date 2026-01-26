import { Link } from 'react-router-dom'
import TitleComponent from '../components/titleComponent/titleComponent'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'

const Campaigns = () => {
    // Placeholder data - will be replaced with API calls
    const campaigns = [
        {
            id: 1,
            name: 'Q1 Outreach Campaign',
            status: 'Sent',
            subject: 'Exclusive Partnership Opportunity',
            recipients: 1234,
            sent: 1234,
            opened: 456,
            replied: 78,
            createdDate: '2026-01-15',
            lastActivity: '2026-01-24'
        },
        {
            id: 2,
            name: 'Product Launch Series',
            status: 'Sent',
            subject: 'Introducing Our New Feature',
            recipients: 892,
            sent: 892,
            opened: 301,
            replied: 45,
            createdDate: '2026-01-18',
            lastActivity: '2026-01-24'
        },
        {
            id: 3,
            name: 'Follow-up Sequence',
            status: 'Draft',
            subject: 'Following up on our conversation',
            recipients: 567,
            sent: 0,
            opened: 0,
            replied: 0,
            createdDate: '2026-01-22',
            lastActivity: '2026-01-22'
        },
        {
            id: 4,
            name: 'Cold Outreach Batch 5',
            status: 'Completed',
            subject: 'Quick question about your team',
            recipients: 2100,
            sent: 2100,
            opened: 834,
            replied: 102,
            createdDate: '2026-01-10',
            lastActivity: '2026-01-20'
        }
    ]

    const getStatusBadge = (status) => {
        const variants = {
            'Draft': 'default',
            'Sent': 'primary',
            'Completed': 'success'
        }
        return variants[status] || 'default'
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <TitleComponent type="h2" className="text-gray-800">
                        Campaigns
                    </TitleComponent>
                    <TitleComponent type="p" size="base" className="text-gray-600 mt-1">
                        Create and manage your email campaigns
                    </TitleComponent>
                </div>
                <Link to="/campaigns/create">
                    <Button variant="primary">
                        <i className="fas fa-plus mr-2"></i>
                        Create Campaign
                    </Button>
                </Link>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <TitleComponent type="p" size="small" className="text-gray-600">
                        Total Campaigns
                    </TitleComponent>
                    <TitleComponent type="h3" className="text-gray-900 mt-1">
                        {campaigns.length}
                    </TitleComponent>
                </Card>
                <Card>
                    <TitleComponent type="p" size="small" className="text-gray-600">
                        Active
                    </TitleComponent>
                    <TitleComponent type="h3" className="text-gray-900 mt-1">
                        {campaigns.filter(c => c.status === 'Sent').length}
                    </TitleComponent>
                </Card>
                <Card>
                    <TitleComponent type="p" size="small" className="text-gray-600">
                        Drafts
                    </TitleComponent>
                    <TitleComponent type="h3" className="text-gray-900 mt-1">
                        {campaigns.filter(c => c.status === 'Draft').length}
                    </TitleComponent>
                </Card>
                <Card>
                    <TitleComponent type="p" size="small" className="text-gray-600">
                        Completed
                    </TitleComponent>
                    <TitleComponent type="h3" className="text-gray-900 mt-1">
                        {campaigns.filter(c => c.status === 'Completed').length}
                    </TitleComponent>
                </Card>
            </div>

            {/* Campaigns List */}
            <div className="space-y-4">
                {campaigns.map((campaign) => (
                    <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            {/* Campaign Info */}
                            <div className="flex-1">
                                <div className="flex items-start gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TitleComponent type="h4" className="text-gray-900">
                                                {campaign.name}
                                            </TitleComponent>
                                            <Badge variant={getStatusBadge(campaign.status)}>
                                                {campaign.status}
                                            </Badge>
                                        </div>
                                        <TitleComponent type="p" size="small" className="text-gray-600">
                                            Subject: {campaign.subject}
                                        </TitleComponent>
                                        <TitleComponent type="p" size="small" className="text-gray-500 mt-1">
                                            Created: {campaign.createdDate} • Last activity: {campaign.lastActivity}
                                        </TitleComponent>
                                    </div>
                                </div>
                            </div>

                            {/* Campaign Stats */}
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <TitleComponent type="p" size="small" className="text-gray-600">
                                        Recipients
                                    </TitleComponent>
                                    <TitleComponent type="h5" className="text-gray-900">
                                        {campaign.recipients.toLocaleString()}
                                    </TitleComponent>
                                </div>
                                <div className="text-center">
                                    <TitleComponent type="p" size="small" className="text-gray-600">
                                        Sent
                                    </TitleComponent>
                                    <TitleComponent type="h5" className="text-gray-900">
                                        {campaign.sent.toLocaleString()}
                                    </TitleComponent>
                                </div>
                                <div className="text-center">
                                    <TitleComponent type="p" size="small" className="text-gray-600">
                                        Opened
                                    </TitleComponent>
                                    <TitleComponent type="h5" className="text-gray-900">
                                        {campaign.opened.toLocaleString()}
                                    </TitleComponent>
                                </div>
                                <div className="text-center">
                                    <TitleComponent type="p" size="small" className="text-gray-600">
                                        Replied
                                    </TitleComponent>
                                    <TitleComponent type="h5" className="text-green-600">
                                        {campaign.replied.toLocaleString()}
                                    </TitleComponent>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="small">
                                    <i className="fas fa-eye mr-2"></i>
                                    View
                                </Button>
                                <Button variant="outline" size="small">
                                    <i className="fas fa-edit mr-2"></i>
                                    Edit
                                </Button>
                                <button className="text-gray-600 hover:text-red-600">
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>

                        {/* Progress Bar (for sent campaigns) */}
                        {campaign.sent > 0 && (
                            <div className="mt-4">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Open Rate: {((campaign.opened / campaign.sent) * 100).toFixed(1)}%</span>
                                    <span>Reply Rate: {((campaign.replied / campaign.sent) * 100).toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${(campaign.opened / campaign.sent) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {/* Empty State (hidden when there are campaigns) */}
            {campaigns.length === 0 && (
                <Card className="text-center py-12">
                    <i className="fas fa-envelope text-gray-300 text-6xl mb-4"></i>
                    <TitleComponent type="h4" className="text-gray-900 mb-2">
                        No campaigns yet
                    </TitleComponent>
                    <TitleComponent type="p" size="base" className="text-gray-600 mb-4">
                        Create your first campaign to start reaching out to leads
                    </TitleComponent>
                    <Button variant="primary">
                        <i className="fas fa-plus mr-2"></i>
                        Create Your First Campaign
                    </Button>
                </Card>
            )}
        </div>
    )
}

export default Campaigns
