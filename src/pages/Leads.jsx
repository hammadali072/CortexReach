import { useState } from 'react'
import TitleComponent from '../components/titleComponent/titleComponent'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const Leads = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [hoveredLead, setHoveredLead] = useState(null)

    // Placeholder data - will be replaced with API calls
    const leads = [
        {
            id: 1,
            name: 'John Smith',
            email: 'john.smith@techcorp.com',
            company: 'TechCorp Inc.',
            position: 'CEO',
            status: 'New',
            tags: ['Enterprise', 'Tech'],
            addedDate: 'Jan 20, 2026',
            avatarGradient: 'from-blue-500 to-indigo-600'
        },
        {
            id: 2,
            name: 'Sarah Johnson',
            email: 'sarah.j@innovate.io',
            company: 'Innovate.io',
            position: 'VP of Sales',
            status: 'Opened',
            tags: ['SaaS', 'Sales'],
            addedDate: 'Jan 19, 2026',
            avatarGradient: 'from-emerald-500 to-teal-500'
        },
        {
            id: 3,
            name: 'Michael Chen',
            email: 'mchen@growth.com',
            company: 'Growth Co.',
            position: 'Marketing Director',
            status: 'Ignored',
            tags: ['Marketing', 'Mid-Market'],
            addedDate: 'Jan 18, 2026',
            avatarGradient: 'from-orange-500 to-amber-500'
        },
        {
            id: 4,
            name: 'Emma Williams',
            email: 'emma.w@startup.tech',
            company: 'Startup Tech',
            position: 'Founder',
            status: 'New',
            tags: ['Startup', 'Tech'],
            addedDate: 'Jan 17, 2026',
            avatarGradient: 'from-purple-500 to-pink-500'
        },
        {
            id: 5,
            name: 'David Brown',
            email: 'dbrown@enterprise.com',
            company: 'Enterprise Solutions',
            position: 'CTO',
            status: 'Opened',
            tags: ['Enterprise', 'IT'],
            addedDate: 'Jan 16, 2026',
            avatarGradient: 'from-cyan-500 to-blue-500'
        }
    ]

    const leadStats = [
        { label: 'Total Leads', value: '2,845', icon: 'fa-users', color: 'from-blue-500 to-indigo-600' },
        { label: 'Recently Added', value: '+124', icon: 'fa-user-plus', color: 'from-emerald-500 to-teal-500' },
        { label: 'Engagement Rate', value: '64.2%', icon: 'fa-chart-pie', color: 'from-purple-500 to-pink-500' },
    ]

    const getStatusBadge = (status) => {
        const variants = {
            'New': 'primary',
            'Opened': 'success',
            'Ignored': 'default'
        }
        return variants[status] || 'default'
    }

    return (
        <div className="min-h-screen space-y-8 pb-12">
            {/* Page Header with Gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-xl">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -mr-32 -mt-32"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <TitleComponent type="h1" className="text-white text-4xl font-bold mb-2">
                            Leads Management
                        </TitleComponent>
                        <TitleComponent type="p" size="lg" className="text-white/90">
                            Centralized database for all your outreach contacts and prospects.
                        </TitleComponent>
                    </div>
                    <button className="flex items-center justify-center px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                        <i className="fas fa-plus-circle mr-2 text-lg"></i>
                        Import New Leads
                    </button>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {leadStats.map((stat, idx) => (
                    <div key={idx} className="group overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 flex items-center space-x-4">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-all duration-300`}>
                            <i className={`fas ${stat.icon} text-white text-xl`}></i>
                        </div>
                        <div>
                            <p className="text-gray-500 font-semibold text-sm uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters and Search - Modern Controls */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex flex-col xl:flex-row gap-6">
                    {/* Search Field */}
                    <div className="flex-1 relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                            <i className="fas fa-search"></i>
                        </div>
                        <input
                            type="text"
                            placeholder="Find prospects by name, email, or company..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition-all duration-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filter Group */}
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all cursor-pointer font-medium text-gray-700"
                            >
                                <option value="all">All Statuses</option>
                                <option value="new">New Leads</option>
                                <option value="opened">Opened</option>
                                <option value="ignored">Ignored</option>
                            </select>
                            <div className="absolute left-4 inset-y-0 flex items-center text-gray-500 pointer-events-none">
                                <i className="fas fa-tag"></i>
                            </div>
                            <div className="absolute right-4 inset-y-0 flex items-center text-gray-400 pointer-events-none">
                                <i className="fas fa-chevron-down text-sm"></i>
                            </div>
                        </div>

                        <button className="px-5 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2">
                            <i className="fas fa-sliders-h"></i>
                            Filters
                        </button>

                        <div className="h-8 w-px bg-gray-200 hidden md:block mx-2"></div>

                        <button className="px-5 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-colors flex items-center gap-2">
                            <i className="fas fa-download"></i>
                            Export Data
                        </button>
                    </div>
                </div>
            </div>

            {/* Leads Table - Premium Glassmorphism Design */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="py-5 px-6 shrink-0">
                                    <input type="checkbox" className="w-5 h-5 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer" />
                                </th>
                                <th className="text-left py-5 px-4 font-bold text-gray-500 uppercase tracking-wider text-xs">
                                    Lead Information
                                </th>
                                <th className="text-left py-5 px-4 font-bold text-gray-500 uppercase tracking-wider text-xs">
                                    Company / Role
                                </th>
                                <th className="text-left py-5 px-4 font-bold text-gray-500 uppercase tracking-wider text-xs">
                                    Status
                                </th>
                                <th className="text-left py-5 px-4 font-bold text-gray-500 uppercase tracking-wider text-xs">
                                    Tags
                                </th>
                                <th className="text-left py-5 px-4 font-bold text-gray-500 uppercase tracking-wider text-xs">
                                    Added
                                </th>
                                <th className="text-right py-5 px-8 font-bold text-gray-500 uppercase tracking-wider text-xs">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map((lead) => (
                                <tr
                                    key={lead.id}
                                    className="border-b border-gray-50 hover:bg-indigo-50/20 transition-all duration-200 group"
                                    onMouseEnter={() => setHoveredLead(lead.id)}
                                    onMouseLeave={() => setHoveredLead(null)}
                                >
                                    <td className="py-5 px-6">
                                        <input type="checkbox" className="w-5 h-5 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer" />
                                    </td>
                                    <td className="py-5 px-4">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${lead.avatarGradient} flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                                {lead.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{lead.name}</h4>
                                                <p className="text-sm text-gray-500">{lead.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-800">{lead.company}</span>
                                            <span className="text-sm text-gray-500">{lead.position}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-4">
                                        <Badge variant={getStatusBadge(lead.status)}>
                                            <i className={`fas fa-circle text-[8px] mr-2 ${lead.status === 'New' ? 'animate-pulse' : ''}`}></i>
                                            {lead.status}
                                        </Badge>
                                    </td>
                                    <td className="py-5 px-4">
                                        <div className="flex flex-wrap gap-2">
                                            {lead.tags.map((tag, index) => (
                                                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold hover:bg-gray-200 transition-colors cursor-default">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-5 px-4">
                                        <span className="text-sm font-medium text-gray-600">{lead.addedDate}</span>
                                    </td>
                                    <td className="py-5 px-8">
                                        <div className="flex items-center justify-end space-x-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination - Polished Footer */}
                <div className="bg-gray-50/50 px-8 py-6 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-500">
                        Showing <span className="text-gray-900 font-bold font-idGrotesk">1 - 5</span> of <span className="text-gray-900 font-bold">2,845</span> results
                    </p>
                    <div className="flex items-center space-x-3">
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-400 cursor-not-allowed">
                            Previous
                        </button>
                        <div className="flex items-center space-x-2">
                            <button className="w-10 h-10 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md">1</button>
                            <button className="w-10 h-10 bg-white border border-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50">2</button>
                            <button className="w-10 h-10 bg-white border border-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50">3</button>
                        </div>
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Leads

