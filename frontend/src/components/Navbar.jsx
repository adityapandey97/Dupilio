import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Menu, LogOut, User, Bell, ChevronDown, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const devScore = user?.developerScore?.overall || 74;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/85 transition-colors duration-200">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Mobile menu trigger & Dupilio Brand */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-600 focus:outline-none dark:text-slate-400 dark:hover:bg-slate-900 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>
          
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 font-extrabold text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              D
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-400 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-300 dark:to-indigo-200">
                DUPILIO
              </span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 -mt-1 tracking-wider uppercase">
                Developer Hub
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Live Developer Score Quick Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 text-xs font-medium">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-500 dark:text-slate-400">Developer Score:</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">{devScore}/100</span>
        </div>

        {/* Action icons & profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 focus:outline-none transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Quick AI Action Link */}
          <Link
            to="/ai-assistant"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors border border-purple-200/50 dark:border-purple-800/50"
          >
            <Sparkles size={14} className="text-purple-600 dark:text-purple-400" />
            <span>AI Assistant</span>
          </Link>

          {/* User profile dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 focus:outline-none dark:hover:bg-slate-900 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-xs">
                  {(user.name || 'D').split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    {user.college || 'Developer'}
                  </p>
                </div>
                <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
              </button>

              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setProfileOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl ring-1 ring-black/5 focus:outline-none dark:border-slate-800 dark:bg-slate-900 z-40 text-left">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Signed in as</p>
                      <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-200">{user.email}</p>
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                        Score: {devScore} | {user.batch || '2026'}
                      </p>
                    </div>

                    <Link
                      to="/profiles"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60 transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User size={16} className="text-slate-400" />
                      Connected Profiles
                    </Link>

                    <Link
                      to="/settings"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60 transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Sparkles size={16} className="text-slate-400" />
                      Account & Privacy
                    </Link>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              Sign In
            </Link>
          )}

        </div>
      </div>
    </header>
  );
};

export default Navbar;
