import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, Bot } from 'lucide-react';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-50 flex flex-col">
      <Navbar onMenuToggle={toggleSidebar} />
      
      {/* Preview Mode Notification Banner */}
      {user?.isGuest && (
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
            <span className="flex items-center gap-2 text-left">
              <Sparkles size={14} className="animate-pulse shrink-0" />
              <span>You are viewing <strong>DUPILIO</strong> in <strong>Preview Mode</strong>. Explore developer profiles, contest tracking, hackathons, and AI preparation freely.</span>
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <Link to="/login" className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-md transition-colors font-medium">
                Sign In
              </Link>
              <Link to="/register" className="px-2.5 py-1 bg-white text-indigo-700 font-bold rounded-md hover:bg-slate-100 transition-colors flex items-center gap-1 shadow-xs">
                Register
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 w-full max-w-full">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        
        {/* Main Content Area */}
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-64px)] overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Assistant Quick Trigger */}
      <Link
        to="/ai-assistant"
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-xl shadow-indigo-500/25 hover:scale-105 hover:shadow-indigo-500/40 transition-all border border-white/20"
        title="Open Dupilio AI Assistant"
      >
        <Bot size={20} className="animate-pulse" />
        <span className="text-sm hidden sm:inline">Ask AI Assistant</span>
      </Link>
    </div>
  );
};

export default DashboardLayout;
