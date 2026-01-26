import { useState } from 'react'
import TitleComponent from '../components/titleComponent/titleComponent'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile')

    // Form states - will be managed by form library in actual implementation
    const [profileData, setProfileData] = useState({
        fullName: 'John Doe',
        email: 'john@example.com',
        company: 'Example Corp',
        phone: '+1 (555) 123-4567'
    })

    const tabs = [
        { id: 'profile', label: 'Profile', icon: 'fa-user' },
        { id: 'email', label: 'Email Settings', icon: 'fa-envelope' },
        { id: 'notifications', label: 'Notifications', icon: 'fa-bell' },
        { id: 'api', label: 'API Keys', icon: 'fa-key' }
    ]

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <TitleComponent type="h2" className="text-gray-800">
                    Settings
                </TitleComponent>
                <TitleComponent type="p" size="base" className="text-gray-600 mt-1">
                    Manage your account and application preferences
                </TitleComponent>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Tabs */}
                <div className="lg:col-span-1">
                    <Card padding="small">
                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === tab.id
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <i className={`fas ${tab.icon}`}></i>
                                    <span className="text-sm font-medium">{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </Card>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <Card>
                            <TitleComponent type="h4" className="text-gray-900 mb-6">
                                Profile Information
                            </TitleComponent>

                            <div className="space-y-6">
                                {/* Profile Picture */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Profile Picture
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                                            <i className="fas fa-user text-gray-600 text-2xl"></i>
                                        </div>
                                        <div>
                                            <Button variant="outline" size="small">
                                                Change Photo
                                            </Button>
                                            <TitleComponent type="p" size="small" className="text-gray-500 mt-1">
                                                JPG, PNG. Max 2MB
                                            </TitleComponent>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Full Name"
                                        value={profileData.fullName}
                                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                    />
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    />
                                    <Input
                                        label="Company"
                                        value={profileData.company}
                                        onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                                    />
                                    <Input
                                        label="Phone Number"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <Button variant="primary">Save Changes</Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Email Settings Tab */}
                    {activeTab === 'email' && (
                        <Card>
                            <TitleComponent type="h4" className="text-gray-900 mb-6">
                                Email Sending Preferences
                            </TitleComponent>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sending Email Address
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="outreach@yourcompany.com"
                                    />
                                    <TitleComponent type="p" size="small" className="text-gray-500 mt-1">
                                        The email address that will appear in the "From" field
                                    </TitleComponent>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sender Name
                                    </label>
                                    <Input placeholder="Your Name" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Daily Send Limit
                                    </label>
                                    <Input type="number" placeholder="500" />
                                    <TitleComponent type="p" size="small" className="text-gray-500 mt-1">
                                        Maximum number of emails to send per day
                                    </TitleComponent>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    <input type="checkbox" id="trackOpens" className="rounded" />
                                    <label htmlFor="trackOpens" className="text-sm text-gray-700 cursor-pointer">
                                        Track email opens
                                    </label>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    <input type="checkbox" id="trackClicks" className="rounded" defaultChecked />
                                    <label htmlFor="trackClicks" className="text-sm text-gray-700 cursor-pointer">
                                        Track link clicks
                                    </label>
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <Button variant="primary">Save Settings</Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <Card>
                            <TitleComponent type="h4" className="text-gray-900 mb-6">
                                Notification Preferences
                            </TitleComponent>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <TitleComponent type="p" size="base-medium" className="text-gray-900">
                                            Email Notifications
                                        </TitleComponent>
                                        <TitleComponent type="p" size="small" className="text-gray-600">
                                            Receive notifications about campaign activity
                                        </TitleComponent>
                                    </div>
                                    <input type="checkbox" className="rounded" defaultChecked />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <TitleComponent type="p" size="base-medium" className="text-gray-900">
                                            New Replies
                                        </TitleComponent>
                                        <TitleComponent type="p" size="small" className="text-gray-600">
                                            Get notified when a lead replies to your email
                                        </TitleComponent>
                                    </div>
                                    <input type="checkbox" className="rounded" defaultChecked />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <TitleComponent type="p" size="base-medium" className="text-gray-900">
                                            Campaign Completed
                                        </TitleComponent>
                                        <TitleComponent type="p" size="small" className="text-gray-600">
                                            Alert when a campaign finishes sending
                                        </TitleComponent>
                                    </div>
                                    <input type="checkbox" className="rounded" />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <TitleComponent type="p" size="base-medium" className="text-gray-900">
                                            Weekly Reports
                                        </TitleComponent>
                                        <TitleComponent type="p" size="small" className="text-gray-600">
                                            Receive weekly performance summaries
                                        </TitleComponent>
                                    </div>
                                    <input type="checkbox" className="rounded" defaultChecked />
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <Button variant="primary">Save Preferences</Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* API Keys Tab */}
                    {activeTab === 'api' && (
                        <Card>
                            <TitleComponent type="h4" className="text-gray-900 mb-6">
                                API Keys
                            </TitleComponent>

                            <div className="space-y-6">
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex gap-3">
                                        <i className="fas fa-info-circle text-blue-600 mt-1"></i>
                                        <div>
                                            <TitleComponent type="p" size="base-medium" className="text-blue-900">
                                                API Documentation
                                            </TitleComponent>
                                            <TitleComponent type="p" size="small" className="text-blue-800 mt-1">
                                                Use API keys to integrate CortexReach with your applications. Keep your keys secure and never share them publicly.
                                            </TitleComponent>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <TitleComponent type="p" size="base-medium" className="text-gray-900">
                                            Your API Keys
                                        </TitleComponent>
                                        <Button variant="primary" size="small">
                                            <i className="fas fa-plus mr-2"></i>
                                            Generate New Key
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <TitleComponent type="p" size="small" className="text-gray-600 mb-1">
                                                        Production Key
                                                    </TitleComponent>
                                                    <code className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                                        cr_prod_••••••••••••••••3a2b
                                                    </code>
                                                    <TitleComponent type="p" size="small" className="text-gray-500 mt-2">
                                                        Created on Jan 15, 2026 • Last used 2 hours ago
                                                    </TitleComponent>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className="text-gray-600 hover:text-blue-600">
                                                        <i className="fas fa-copy"></i>
                                                    </button>
                                                    <button className="text-gray-600 hover:text-red-600">
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <TitleComponent type="p" size="small" className="text-gray-600 mb-1">
                                                        Development Key
                                                    </TitleComponent>
                                                    <code className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                                        cr_dev_••••••••••••••••7f9e
                                                    </code>
                                                    <TitleComponent type="p" size="small" className="text-gray-500 mt-2">
                                                        Created on Jan 10, 2026 • Last used 1 day ago
                                                    </TitleComponent>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className="text-gray-600 hover:text-blue-600">
                                                        <i className="fas fa-copy"></i>
                                                    </button>
                                                    <button className="text-gray-600 hover:text-red-600">
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Settings
