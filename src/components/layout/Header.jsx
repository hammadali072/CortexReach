import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useAuth } from '../../context/AuthContext'

const Header = ({ onMenuClick }) => {
    const { userProfile } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    const notifications = [
        { id: 1, title: 'Lead Engagement', message: 'Alice opened your "SaaS Outreach" email.', time: '2m ago', icon: 'fa-envelope-open', color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 2, title: 'New Eligible Lead', message: 'Bob Roberts is now eligible for follow-up.', time: '15m ago', icon: 'fa-user-check', color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 3, title: 'Campaign Alert', message: 'Jan Sales Outreach has reached 50% yield.', time: '1h ago', icon: 'fa-chart-pie', color: 'text-purple-500', bg: 'bg-purple-50' },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 h-16">
            <div className="h-full px-4 lg:px-6 flex items-center justify-between">
                {/* Left Section - Mobile Menu Button */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden text-gray-500 hover:text-gray-800 transition-colors focus:outline-none"
                    >
                        <i className="fas fa-bars text-xl" />
                    </button>

                    {/* Search Bar - Hidden on mobile */}
                    <div className="hidden md:flex items-center relative group">
                        <i className="fas fa-search absolute left-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search outreach signals..."
                            className="pl-10 pr-4 py-2 w-64 lg:w-96 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                        />
                    </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex items-center space-x-6">
                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={`relative text-gray-500 hover:text-indigo-600 transition-all duration-300 focus:outline-none p-2 rounded-lg ${showNotifications ? 'bg-indigo-50 text-indigo-600' : ''}`}
                        >
                            <i className="fas fa-bell text-lg" />
                            <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 rounded-lg text-[10px] text-white flex items-center justify-center border-2 border-white">
                                {notifications.length}
                            </span>
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                    <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                                    <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">Mark all as read</button>
                                </div>
                                <div className="max-h-[350px] overflow-y-auto">
                                    {notifications.map((notif) => (
                                        <div key={notif.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group">
                                            <div className="flex items-start space-x-3">
                                                <div className={`w-8 h-8 rounded-lg ${notif.bg} ${notif.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                                    <i className={`fas ${notif.icon} text-sm`}></i>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-gray-900 leading-tight">{notif.title}</p>
                                                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                                    <p className="text-[10px] text-gray-400 mt-1 font-medium italic">{notif.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 text-center bg-gray-50/50">
                                    <button className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">View all updates</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Section */}
                    <div className="flex items-center space-x-3 pl-4 border-l border-gray-100">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-900 leading-none">{userProfile?.name || 'User'}</p>
                            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-tighter mt-1">{userProfile?.role || 'Member'}</p>
                        </div>
                        <div className="relative group cursor-pointer">
                            <div className="w-10 h-10 rounded-lg overflow-hidden ring-2 ring-gray-100 group-hover:ring-indigo-500 transition-all duration-300 bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                {userProfile?.photoURL ? (
                                    <img
                                        src={userProfile.photoURL}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>{userProfile?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'CR'}</span>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-md" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

Header.propTypes = {
    onMenuClick: PropTypes.func.isRequired
}

export default Header
