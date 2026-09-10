import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

/**
 * DashboardLayout Component
 *
 * Master shell combining Sidebar, Navbar, and dynamic page content.
 * Uses React state `sidebarOpen` to handle mobile slide-over navigation.
 * Uses React Router's `<Outlet />` to render the active page.
 */
function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Navbar onToggleSidebar={toggleSidebar} />
        
        {/* Routed child page is injected here */}
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;

