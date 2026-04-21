import { useState } from 'react'
import PropTypes from 'prop-types'
import { NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '../../../context/AuthContext'
import { HiX } from 'react-icons/hi'

const Sidebar = ({ isOpen, onClose }) => {
    const { userProfile, logout } = useAuth()
    const navigate = useNavigate()
    const [showAccountDropdown, setShowAccountDropdown] = useState(false)
    const menuItems = [
        { path: '/dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
        { path: '/dashboard/projects', icon: 'fa-folder-open', label: 'Projects' },
        { path: '/dashboard/leads', icon: 'fa-users', label: 'Leads' },
        { path: '/dashboard/campaigns', icon: 'fa-envelope', label: 'Campaigns' },
        { path: '/dashboard/templates', icon: 'fa-file-invoice', label: 'Templates' },
        { path: '/dashboard/settings', icon: 'fa-cog', label: 'Settings' }
    ]

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-dark/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={clsx(
                'fixed lg:sticky top-0 left-0 h-screen bg-surface/80 backdrop-blur-xl border-r border-border z-50 duration-300',
                'min-w-[300px] lg:w-72 flex flex-col',
                isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            )}>
                {/* Logo Section */}
                <div className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-border">
                    <div className="flex items-center space-x-2">
                        <div className="size-8 lg:size-10 bg-gradient-brand rounded-lg flex items-center justify-center shadow-brand lg:scale-100 scale-90">
                            <i className="fas fa-brain text-white-tint text-lg"></i>
                        </div>
                        <span className="text-lg lg:text-xl font-bold bg-gradient-brand bg-clip-text text-transparent italic tracking-tight">CortexReach</span>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 text-muted hover:text-dark duration-200"
                    >
                        <HiX className="size-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 lg:px-6 py-6 lg:py-8 overflow-y-auto">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    end={item.path === '/dashboard'}
                                    onClick={onClose}
                                    className={({ isActive }) => clsx(
                                        'flex items-center space-x-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl duration-200',
                                        isActive
                                            ? 'bg-primary text-white-tint shadow-brand'
                                            : 'text-muted hover:bg-white-tint hover:text-primary'
                                    )}
                                >
                                    <i className={`fas ${item.icon} w-5 text-center text-sm lg:text-base`} />
                                    <span className="font-medium text-sm lg:text-base">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Section & Account */}
                <div className="border-t border-border p-6 bg-surface-alt/50 relative">
                    <p className="text-[10px] font-black text-subtle uppercase tracking-[0.2em] mb-4 ml-2">Account</p>

                    <div className="relative group">
                        {/* Dropdown Menu (Opens Upward) */}
                        {showAccountDropdown && (
                            <div className="absolute bottom-full left-0 w-full mb-4 bg-surface rounded-2xl shadow-premium border border-border overflow-hidden duration-200 z-50">
                                <div className="p-2">
                                    <button
                                        onClick={async () => {
                                            await logout();
                                            navigate('/');
                                        }}
                                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 duration-200 group/btn"
                                    >
                                        <div className="size-8 rounded-lg bg-red-50 group-hover/btn:bg-red-100 flex items-center justify-center duration-200">
                                            <i className="fas fa-sign-out-alt text-sm"></i>
                                        </div>
                                        <span className="font-bold text-xs tracking-wider">SIGN OUT</span>
                                    </button>
                                </div>
                                <div className="p-2 border-t border-border bg-surface-alt/50">
                                    <button
                                        onClick={() => {
                                            navigate('/dashboard/settings');
                                            setShowAccountDropdown(false);
                                        }}
                                        className="w-full flex items-center space-x-3 px-4 py-2 rounded-xl text-muted hover:bg-surface hover:shadow-brand duration-200"
                                    >
                                        <div className="size-8 rounded-lg flex items-center justify-center">
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
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setShowAccountDropdown(!showAccountDropdown);
                                }
                            }}
                            role="button"
                            tabIndex={0}
                            className={clsx(
                                'flex items-center space-x-3 p-1.5 lg:p-2 rounded-xl cursor-pointer duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20',
                                showAccountDropdown ? 'bg-surface shadow-brand ring-1 ring-border scale-[1.02]' : 'hover:bg-surface hover:shadow-brand'
                            )}
                        >
                            <div className="size-9 lg:size-10 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-white shadow-brand group-hover:ring-primary duration-300 bg-primary flex items-center justify-center text-white-tint font-bold text-xs lg:text-sm">
                                {userProfile?.photoURL ? (
                                    <img
                                        src={userProfile.photoURL}
                                        alt="Avatar"
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <span>{userProfile?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'CR'}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs lg:text-sm font-bold text-dark truncate">{userProfile?.name || 'User'}</p>
                                <p className="text-[8px] lg:text-[9px] text-muted font-bold uppercase truncate tracking-tighter">{userProfile?.role || 'Member'}</p>
                            </div>
                            <i className={`fas fa-chevron-up text-[9px] lg:text-[10px] text-subtle duration-300 ${showAccountDropdown ? 'rotate-180 text-primary' : ''}`} />
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


