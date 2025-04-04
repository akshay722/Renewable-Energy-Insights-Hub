import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import TimeFrameSelector from './TimeFrameSelector'
import { useState } from 'react'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Check if we should show the TimeFrameSelector
  // We'll show it on all pages except login, register, and notfound
  const showTimeFrameSelector = !location.pathname.includes('/login') && 
                              !location.pathname.includes('/register') &&
                              !location.pathname.includes('/notfound');

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar for larger screens or when open */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} />
        
        {/* Global TimeFrameSelector */}
        {showTimeFrameSelector && (
          <div className="border-b border-gray-200 bg-white px-4 md:px-6 py-2">
            <TimeFrameSelector />
          </div>
        )}
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout