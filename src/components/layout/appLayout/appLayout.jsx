import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../sidebar/sidebar'
import Header from '../header/header'

const AppLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
    const closeSidebar = () => setSidebarOpen(false)

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <Header onMenuClick={toggleSidebar} />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AppLayout


