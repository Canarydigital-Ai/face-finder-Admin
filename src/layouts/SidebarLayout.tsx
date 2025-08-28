import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';

const SidebarLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-collapse on mobile
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
     <div className="flex min-h-screen bg-[#0F0F0F]"> 
      {/* Sidebar - Fixed width that changes based on collapsed state */}
      <div className={`fixed left-0 top-0 h-full z-20 transition-all duration-500 ${
        isCollapsed ? 'w-[70px]' : 'w-[280px]'
      } ${isMobile && isCollapsed ? '-translate-x-full' : 'translate-x-0'}`}>
        <Sidebar isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />
      </div>

      {/* Mobile overlay */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={toggleCollapse}
        />
      )}

      {/* Main Content Area - Dynamic margin based on sidebar state */}
       <div 
      className={`flex-1 transition-all duration-500 bg-[#0F0F0F] ${
        isMobile 
          ? 'ml-0' 
          : isCollapsed 
            ? 'ml-[70px]' 
            : 'ml-[280px]'
      }`}
    >
        {/* Mobile hamburger menu button */}
        {isMobile && (
          <button
            onClick={toggleCollapse}
            className="fixed top-4 left-4 z-30 p-3 bg-[#0F0F0F] text-white rounded-lg shadow-lg border border-[#222222] hover:bg-[#1a1a1a] transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        )}

        {/* Main content */}
        <main className="min-h-screen bg-[#0F0F0F]">
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;