import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import clsx from 'clsx'

const Sidebar = ({ isOpen, onClose }) => {
    const menuItems = [
        { path: '/', icon: 'fa-chart-line', label: 'Dashboard' },
        { path: '/leads', icon: 'fa-users', label: 'Leads' },
        { path: '/campaigns', icon: 'fa-envelope', label: 'Campaigns' },
        { path: '/sequences', icon: 'fa-list-ol', label: 'Sequences' },
        { path: '/analytics', icon: 'fa-chart-bar', label: 'Analytics' },
        { path: '/settings', icon: 'fa-cog', label: 'Settings' }
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
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 overflow-y-auto">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    end={item.path === '/'}
                                    onClick={onClose}
                                    className={({ isActive }) => clsx(
                                        'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200',
                                        isActive
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    )}
                                >
                                    <i className={`fas ${item.icon} w-5 text-center`}></i>
                                    <span className="font-medium">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Section */}
                <div className="border-t border-gray-200 p-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <i className="fas fa-user text-gray-600"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                            <p className="text-xs text-gray-500 truncate">john@example.com</p>
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
