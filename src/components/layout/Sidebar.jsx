import { useState } from 'react'
import PropTypes from 'prop-types'
import { NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '../../context/AuthContext'

const Sidebar = ({ isOpen, onClose }) => {
    const { userProfile, logout } = useAuth()
    const navigate = useNavigate()
    const [showAccountDropdown, setShowAccountDropdown] = useState(false)
    const menuItems = [
        { path: '/dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
        { path: '/dashboard/projects', icon: 'fa-folder-open', label: 'Projects' },
        { path: '/dashboard/leads', icon: 'fa-users', label: 'Leads' },
        { path: '/dashboard/campaigns', icon: 'fa-envelope', label: 'Campaigns' },
        { path: '/dashboard/sequences', icon: 'fa-reply-all', label: 'Follow-Ups' },
        { path: '/dashboard/analytics', icon: 'fa-chart-bar', label: 'Analytics' },
        { path: '/dashboard/settings', icon: 'fa-cog', label: 'Settings' }
    ]

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={clsx(
                'fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 z-50 transition-transform duration-300',
                'w-64 flex flex-col',
                isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            )}>
                {/* Logo Section */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <i className="fas fa-brain text-white text-lg"></i>
                        </div>
                        <span className="text-xl font-bold text-gray-800">CortexReach</span>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={onClose}
                        className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                        <i className="fas fa-times" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 overflow-y-auto">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    end={item.path === '/dashboard'}
                                    onClick={onClose}
                                    className={({ isActive }) => clsx(
                                        'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200',
                                        isActive
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    )}
                                >
                                    <i className={`fas ${item.icon} w-5 text-center`} />
                                    <span className="font-medium">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Section & Account */}
                <div className="border-t border-gray-100 p-6 bg-gray-50/50 relative">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Account</p>

                    <div className="relative group">
                        {/* Dropdown Menu (Opens Upward) */}
                        {showAccountDropdown && (
                            <div className="absolute bottom-full left-0 w-full mb-4 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
                                <div className="p-2">
                                    <button
                                        onClick={async () => {
                                            await logout();
                                            navigate('/');
                                        }}
                                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 group/btn"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-red-50 group-hover/btn:bg-red-100 flex items-center justify-center transition-colors">
                                            <i className="fas fa-sign-out-alt text-sm"></i>
                                        </div>
                                        <span className="font-bold text-xs tracking-wider">SIGN OUT</span>
                                    </button>
                                </div>
                                <div className="p-2 border-t border-gray-50 bg-gray-50/50">
                                    <button className="w-full flex items-center space-x-3 px-4 py-2 rounded-xl text-gray-600 hover:bg-white hover:shadow-sm transition-all duration-200">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                                            <i className="fas fa-user-gear text-sm"></i>
                                        </div>
                                        <span className="font-bold text-[10px] tracking-widest uppercase">Settings</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Profile Trigger */}
                        <div
                            onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                            className={`flex items-center space-x-3 p-2 rounded-2xl cursor-pointer transition-all duration-300 ${showAccountDropdown ? 'bg-white shadow-md ring-1 ring-black/5 scale-[1.02]' : 'hover:bg-white hover:shadow-sm'}`}
                        >
                            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-white shadow-sm group-hover:ring-indigo-500 transition-all bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                {userProfile?.photoURL ? (
                                    <img
                                        src={userProfile.photoURL}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>{userProfile?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'CR'}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{userProfile?.name || 'User'}</p>
                                <p className="text-[9px] text-gray-500 font-bold uppercase truncate tracking-tighter">{userProfile?.role || 'Member'}</p>
                            </div>
                            <i className={`fas fa-chevron-up text-[10px] text-gray-300 transition-transform duration-300 ${showAccountDropdown ? 'rotate-180 text-indigo-500' : ''}`} />
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}

Sidebar.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
}

export default Sidebar
