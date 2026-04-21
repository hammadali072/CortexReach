import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useAuth } from '../../../context/AuthContext'

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
        <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-border h-14 lg:h-16">
            <div className="h-full px-4 lg:px-8 flex items-center justify-between">
                {/* Left Section - Mobile Menu Button */}
                <div className="flex items-center space-x-1 lg:space-x-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 text-muted hover:text-dark duration-200 focus:outline-none"
                    >
                        <i className="fas fa-bars text-lg" />
                    </button>

                    {/* Search Bar - Hidden on mobile */}
                    <div className="hidden md:flex items-center relative group">
                        <i className="fas fa-search absolute left-3 text-subtle group-focus-within:text-primary duration-300" />
                        <input
                            type="text"
                            placeholder="Search outreach signals..."
                            className="pl-10 pr-4 py-2 w-64 lg:w-96 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface duration-300 shadow-sm"
                        />
                    </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={`relative text-muted hover:text-primary duration-300 focus:outline-none p-1.5 lg:p-2 rounded-xl ${showNotifications ? 'bg-white-tint text-primary' : ''}`}
                        >
                            <i className="fas fa-bell text-base lg:text-lg" />
                            <span className="absolute top-1 right-1 size-3.5 lg:size-4 bg-primary rounded-full text-[9px] lg:text-[10px] text-white-tint flex items-center justify-center border-2 border-surface shadow-brand">
                                {notifications.length}
                            </span>
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-3 w-80 bg-surface rounded-2xl shadow-premium border border-border overflow-hidden duration-200">
                                <div className="p-4 border-b border-border flex items-center justify-between bg-surface-alt/50">
                                    <h3 className="text-sm font-bold text-dark">Notifications</h3>
                                    <button className="text-[10px] font-bold text-accent hover:text-primary uppercase tracking-widest duration-200">Mark all as read</button>
                                </div>
                                <div className="max-h-[350px] overflow-y-auto">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => setShowNotifications(false)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    setShowNotifications(false);
                                                }
                                            }}
                                            className="p-4 border-b border-border hover:bg-surface-alt duration-200 cursor-pointer group focus:outline-none focus:bg-surface-alt"
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className={`size-8 rounded-xl ${notif.bg} ${notif.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 duration-200 shadow-sm`}>
                                                    <i className={`fas ${notif.icon} text-sm`}></i>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-dark leading-tight">{notif.title}</p>
                                                    <p className="text-[11px] text-muted mt-0.5 line-clamp-2">{notif.message}</p>
                                                    <p className="text-[10px] text-subtle mt-1 font-medium italic">{notif.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 text-center bg-surface-alt/50">
                                    <button className="text-xs font-bold text-muted hover:text-dark duration-200">View all updates</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Section */}
                    <div className="flex items-center space-x-2 lg:space-x-4 pl-3 lg:pl-4 border-l border-border">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-dark leading-none">{userProfile?.name || 'User'}</p>
                            <p className="text-[9px] font-medium text-muted uppercase tracking-tighter mt-1">{userProfile?.role || 'Member'}</p>
                        </div>
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => {}} // Could link to profile
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    // Handle profile click
                                }
                            }}
                            className="relative group cursor-pointer focus:outline-none"
                        >
                            <div className="size-8 lg:size-10 rounded-xl overflow-hidden ring-2 ring-white-tint group-hover:ring-primary duration-300 bg-primary flex items-center justify-center text-white-tint font-bold text-xs lg:text-sm shadow-brand">
                                {userProfile?.photoURL ? (
                                    <img
                                        src={userProfile.photoURL}
                                        alt="Profile"
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <span>{userProfile?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'CR'}</span>
                                )}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 size-2.5 lg:size-3 bg-emerald-500 border-2 border-surface rounded-full shadow-brand" />
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


