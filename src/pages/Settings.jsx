import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TitleComponent from '../components/titleComponent/titleComponent'
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

        { id: 'sending', label: 'Sending Defaults', icon: 'fa-paper-plane' },
        { id: 'danger', label: 'Danger Zone', icon: 'fa-exclamation-triangle' },
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
                    <div className="bg-white rounded-lg border border-slate-200 p-2 space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-bold text-sm ${activeTab === tab.id
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
                        <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm animate-in fade-in slide-in-from-right-4">
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


                    {activeTab === 'sending' && (
                        <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm animate-in fade-in slide-in-from-right-4">
                            <h3 className="text-xl font-bold mb-2">Sending Defaults</h3>
                            <p className="text-slate-500 text-sm mb-8">
                                Configure default sending behavior for all campaigns.
                            </p>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Daily Send Limit</label>
                                        <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700">
                                            <option value="50">50 emails/day</option>
                                            <option value="100">100 emails/day</option>
                                            <option value="200">200 emails/day</option>
                                            <option value="500">500 emails/day</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Send Delay Between Emails</label>
                                        <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700">
                                            <option value="30">30 seconds</option>
                                            <option value="60">1 minute</option>
                                            <option value="120">2 minutes</option>
                                            <option value="300">5 minutes</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Default From Name</label>
                                    <input type="text" placeholder="e.g. John from CortexReach"
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700" />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Email Tracking</label>
                                    <div className="space-y-3">
                                        {[
                                            { id: 'track_opens', label: 'Track Email Opens', desc: 'Embed a 1x1 pixel to detect when recipients open emails.' },
                                            { id: 'track_clicks', label: 'Track Link Clicks', desc: 'Wrap links to monitor click-through rates.' },
                                            { id: 'auto_unsubscribe', label: 'Auto-manage Unsubscribes', desc: 'Automatically suppress leads who unsubscribe.' },
                                        ].map(opt => (
                                            <label key={opt.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer hover:border-indigo-200 transition-colors">
                                                <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 accent-indigo-600" />
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{opt.label}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-slate-100 flex justify-end">
                                    <button className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                                        Save Defaults
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'danger' && (
                        <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm animate-in fade-in slide-in-from-right-4 space-y-6">
                            <h3 className="text-xl font-bold text-red-600 mb-2">Danger Zone</h3>
                            <p className="text-slate-500 text-sm mb-6">
                                Irreversible actions. Proceed with extreme caution.
                            </p>
                            <div className="space-y-4">
                                <div className="p-6 border border-red-100 bg-red-50/50 rounded-lg flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-red-900">Delete All Leads</h4>
                                        <p className="text-sm text-red-700 font-medium mt-1">
                                            Permanently removes all leads across all projects.
                                        </p>
                                    </div>
                                    <button className="px-6 py-3 bg-white border border-red-200 text-red-600 rounded-lg font-bold text-sm hover:bg-red-600 hover:text-white transition-all">
                                        Purge Leads
                                    </button>
                                </div>
                                <div className="p-6 border border-red-100 bg-red-50/50 rounded-lg flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-red-900">Delete Account</h4>
                                        <p className="text-sm text-red-700 font-medium mt-1">
                                            Permanently deletes your account and all associated data.
                                        </p>
                                    </div>
                                    <button className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-100">
                                        Delete Account
                                    </button>
                                </div>
                                <div className="p-6 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-red-900">Sign Out</h4>
                                        <p className="text-sm text-red-700 font-medium mt-1">You will be returned to the login screen.</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                                    >
                                        <i className="fas fa-sign-out-alt mr-2" />Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Settings
