import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BarChart3,
  Swords,
  Sparkles,
  Briefcase,
  Target,
  MessageSquare,
  Settings,
  ShieldCheck,
  User,
  Link2,
  HelpCircle,
  LogOut,
  X,
  ChevronUp,
  MoreVertical
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // HierPrep Core Navigation Items
  const primaryMenuItems = [
    { name: 'Dashboard & Profile', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Contests & Reminders', path: '/contests', icon: <Swords size={18} /> },
    { name: 'Events & Hackathons', path: '/events', icon: <Sparkles size={18} /> },
    { name: 'AI Self-Test & Contests', path: '/preparation', icon: <Target size={18} /> },
    { name: 'Tech Discussions', path: '/discussions', icon: <MessageSquare size={18} /> },
    { name: 'Platform Profiles Sync', path: '/profiles', icon: <BarChart3 size={18} /> },
    { name: 'Jobs & Internships', path: '/career', icon: <Briefcase size={18} /> }
  ];

  const linkStyle = ({ isActive }) => {
    return `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 font-bold shadow-xs border-l-4 border-indigo-600'
        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100'
    }`;
  };

  const userInitials = (user?.name || 'Developer')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const userRole = user?.profile?.role || 'Software Developer';

  return (
    <>
      {/* Mobile Sidebar overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200/80 bg-white/95 backdrop-blur-md pt-16 transition-transform duration-200 ease-in-out dark:border-slate-800/80 dark:bg-slate-950/95 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile close button */}
        <div className="flex h-10 items-center justify-end px-4 lg:hidden">
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Primary Navigation List (Section 8: Exactly 7 items) */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4 text-left">
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Developer Platform
            </p>
            <nav className="space-y-1">
              {primaryMenuItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={linkStyle}
                  onClick={onClose}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="truncate">{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Section 9: Profile Menu at bottom of sidebar */}
        <div className="border-t border-slate-200/80 p-3 dark:border-slate-800/80 relative" ref={menuRef}>
          {profileMenuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name || 'Developer'}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email || 'developer@dupilio.dev'}</p>
              </div>

              <Link
                to="/profiles"
                onClick={() => setProfileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80 transition-colors"
              >
                <User size={14} className="text-slate-400" />
                <span>My Profile</span>
              </Link>

              <Link
                to="/settings"
                onClick={() => setProfileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80 transition-colors"
              >
                <Settings size={14} className="text-slate-400" />
                <span>Settings</span>
              </Link>

              <Link
                to="/profiles"
                onClick={() => setProfileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80 transition-colors"
              >
                <Link2 size={14} className="text-slate-400" />
                <span>Connected Accounts</span>
              </Link>

              <Link
                to="/settings"
                onClick={() => setProfileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80 transition-colors"
              >
                <ShieldCheck size={14} className="text-slate-400" />
                <span>Privacy</span>
              </Link>

              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  setShowHelpModal(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80 transition-colors text-left"
              >
                <HelpCircle size={14} className="text-slate-400" />
                <span>Help & Documentation</span>
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* User Profile Bar trigger */}
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex w-full items-center justify-between gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-xs font-bold text-white shadow-xs">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {user?.name || 'Developer'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {userRole}
                </p>
              </div>
            </div>
            <MoreVertical size={16} className="text-slate-400 shrink-0" />
          </button>
        </div>
      </aside>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle size={18} className="text-indigo-600" />
                HierPrep Developer Manual
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p>
                <strong>HierPrep</strong> is a high-performance developer ecosystem unifying competitive programming telemetry, contest reminders, hackathons, and AI-driven self-test contests.
              </p>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 p-3 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
                <p className="font-semibold text-slate-900 dark:text-white">Quick Tips:</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-500 dark:text-slate-400">
                  <li>Connect your handles in <strong>Profiles & Analytics</strong> for live stats.</li>
                  <li>Use <strong>Ctrl + K</strong> to search problems, contests, and jobs anywhere.</li>
                  <li>All contest countdowns are synchronized directly with server times.</li>
                  <li>Reminders can be delivered through browser, email, or voice alerts.</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
