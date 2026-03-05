import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TitleComponent from '../components/titleComponent/titleComponent'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'

const Settings = () => {
    const { userProfile, logout } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('profile')

    const [profileData, setProfileData] = useState({
        fullName: userProfile?.name || '',
        email: userProfile?.email || '',
        company: ''
    })

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    const tabs = [
        { id: 'profile', label: 'User Profile', icon: 'fa-user' },
        { id: 'email', label: 'Inboxes', icon: 'fa-envelope-open-text' }
    ]

    return (
        <div className="min-h-screen space-y-8 pb-12">
            {/* Page Header */}
            <div>
                <TitleComponent type="h1" className="text-slate-900 text-3xl font-bold">
                    System Configuration
                </TitleComponent>
                <TitleComponent type="p" size="base" className="text-slate-500 mt-1">
                    Manage your identity and email connectivity credentials.
                </TitleComponent>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-[8px] border border-slate-200 p-2 space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-[8px] transition-all font-bold text-sm ${activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                    : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                <i className={`fas ${tab.icon}`} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    {activeTab === 'profile' && (
                        <div className="bg-white p-8 rounded-[8px] border border-slate-200 shadow-sm animate-in fade-in slide-in-from-right-4">
                            <h3 className="text-xl font-bold mb-6">Identity Details</h3>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Full Name"
                                        value={profileData.fullName}
                                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                    />
                                    <Input
                                        label="Primary Work Email"
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    />
                                </div>
                                <Input
                                    label="Organization Name"
                                    value={profileData.company}
                                    onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                                />
                                <div className="pt-6 border-t border-slate-100 flex justify-end">
                                    <Button variant="primary" className="px-8">Update Identity</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'email' && (
                        <div className="bg-white p-8 rounded-[8px] border border-slate-200 shadow-sm animate-in fade-in slide-in-from-right-4">
                            <h3 className="text-xl font-bold mb-2">Connected Inboxes</h3>
                            <p className="text-slate-500 text-sm mb-8">Authorizing an inbox allows CortexReach to detect engagement signals (opens/replies).</p>

                            <div className="space-y-4">
                                <div className="p-6 bg-slate-50 rounded-[8px] border border-slate-200 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-[8px] shadow-sm flex items-center justify-center text-indigo-600">
                                            <i className="fab fa-google text-xl" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">john@example.com</p>
                                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Connected via Google OAuth</p>
                                        </div>
                                    </div>
                                    <Badge variant="success">Active</Badge>
                                </div>

                                <button className="w-full p-6 border-2 border-dashed border-slate-200 rounded-[8px] text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all font-bold flex items-center justify-center gap-3">
                                    <i className="fas fa-plus"></i>
                                    Connect New Inbox
                                </button>
                            </div>

                            <div className="mt-12 p-6 bg-indigo-50 rounded-[8px] border border-indigo-100">
                                <h4 className="font-bold text-indigo-900 mb-2">Domain Health Tip</h4>
                                <p className="text-indigo-800 text-sm leading-relaxed">
                                    By strictly following CortexReach's "One-Signal" rule, your connected inboxes maintain significantly higher reputation scores than traditional drip-sequence tools.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="p-6 bg-red-50 border border-red-100 rounded-[8px] flex items-center justify-between">
                <div>
                    <h4 className="font-bold text-red-900">Sign Out</h4>
                    <p className="text-sm text-red-700 font-medium">You will be returned to the login screen.</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="px-6 py-3 bg-red-600 text-white rounded-[8px] font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                >
                    <i className="fas fa-sign-out-alt mr-2" />Sign Out
                </button>
            </div>
        </div>
    )
}

export default Settings
