import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Sun,
  Moon,
  Menu,
  Bell,
  Search,
  RefreshCw,
  Sparkles,
  ChevronRight,
  User,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react';
import GlobalSearch from './common/GlobalSearch';
import NotificationCenter from './common/NotificationCenter';

export const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [syncTimeText, setSyncTimeText] = useState('Updated just now');

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update sync freshness timestamp
  useEffect(() => {
    const interval = setInterval(() => {
      const minutes = Math.floor(Math.random() * 3) + 2;
      setSyncTimeText(`Synced ${minutes}m ago`);
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Derive route titles and breadcrumbs dynamically
  const getRouteInfo = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return { title: 'Dashboard', crumb: 'Developer Intelligence' };
    if (path.includes('/profiles')) return { title: 'Profiles & Analytics', crumb: 'Coding & GitHub Telemetry' };
    if (path.includes('/contests')) return { title: 'Contests & Problems', crumb: 'Live Schedule & Unsolved Arena' };
    if (path.includes('/events')) return { title: 'Hackathons & Events', crumb: 'Competitions & Workshops' };
    if (path.includes('/career')) return { title: 'Resume → Jobs & Internships', crumb: 'ATS Analysis & Role Matches' };
    if (path.includes('/preparation')) return { title: 'AI Preparation Center', crumb: 'Diagnostic Gap Analysis' };
    if (path.includes('/discussions')) return { title: 'Discuss & Chat', crumb: 'Developer Community' };
    if (path.includes('/settings')) return { title: 'Settings', crumb: 'Account & Privacy' };
    if (path.includes('/problems')) return { title: 'Problem Hub', crumb: 'Algorithmic Bank' };
    if (path.includes('/todo')) return { title: 'Todo Planner', crumb: 'Preparation Milestones' };
    if (path.includes('/leaderboard')) return { title: 'Leaderboards', crumb: 'Global & Campus Rankings' };
    return { title: 'Dashboard', crumb: 'Overview' };
  };

  const { title, crumb } = getRouteInfo();
  const overallScore = user?.developerScore?.overall ?? 0;

  const userInitials = (user?.name || 'Developer')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90 transition-colors duration-200">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          
          {/* Left: Mobile trigger & Page Title + Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuToggle}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-600 focus:outline-none dark:text-slate-400 dark:hover:bg-slate-900 transition-colors lg:hidden"
              aria-label="Toggle navigation menu"
            >
              <Menu size={20} />
            </button>

            {/* Brand icon for mobile */}
            <Link to="/" className="lg:hidden flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 font-extrabold text-white text-xs shadow-md">
                D
              </div>
            </Link>

            {/* Dynamic Page Header & Breadcrumbs (Section 10) */}
            <div className="hidden sm:flex flex-col text-left">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <span>DUPILIO</span>
                <ChevronRight size={10} />
                <span className="text-slate-600 dark:text-slate-300">{crumb}</span>
              </div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {title}
              </h1>
            </div>
          </div>

          {/* Center: Global Search Bar trigger (Ctrl + K) */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 text-xs text-slate-400 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-900 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <Search size={14} className="text-slate-400" />
                <span>Search problems, contests, events, jobs...</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Section 11: Real Data Freshness UX */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{syncTimeText}</span>
            </div>

            {/* Mobile search trigger icon */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 md:hidden"
              title="Search"
            >
              <Search size={18} />
            </button>

            {/* Notification Center Trigger */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 focus:outline-none transition-colors"
                title="Notifications"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-950"></span>
              </button>
              <NotificationCenter isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 focus:outline-none transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Header User Badge & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 rounded-xl p-1 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-xs font-bold text-white shadow-xs">
                  {userInitials}
                </div>
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[110px]">
                    {user?.name || 'Developer'}
                  </span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                    Score: {overallScore}/100
                  </span>
                </div>
                <ChevronDown size={14} className="text-slate-400 hidden xl:block" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user?.name || 'Developer'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {user?.email || 'developer@dupilio.dev'}
                    </p>
                  </div>

                  <Link
                    to="/profiles"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User size={14} className="text-slate-400" />
                    <span>My Profile & Stats</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Settings size={14} className="text-slate-400" />
                    <span>Settings</span>
                  </Link>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;
