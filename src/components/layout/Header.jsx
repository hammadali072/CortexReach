import PropTypes from 'prop-types'

const Header = ({ onMenuClick }) => {
    return (
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16">
            <div className="h-full px-4 lg:px-6 flex items-center justify-between">
                {/* Left Section - Mobile Menu Button */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden text-gray-600 hover:text-gray-800 focus:outline-none"
                    >
                        <i className="fas fa-bars text-xl" />
                    </button>

                    {/* Search Bar - Hidden on mobile */}
                    <div className="hidden md:flex items-center relative">
                        <i className="fas fa-search absolute left-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2 w-64 lg:w-96 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <button className="relative text-gray-600 hover:text-gray-800 focus:outline-none">
                        <i className="fas fa-bell text-xl" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                            3
                        </span>
                    </button>

                    {/* Profile Dropdown - Placeholder */}
                    <div className="hidden sm:flex items-center space-x-2 cursor-pointer">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <i className="fas fa-user text-gray-600 text-sm" />
                        </div>
                        <i className="fas fa-chevron-down text-gray-600 text-xs" />
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
