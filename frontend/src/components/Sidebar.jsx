import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  UserCheck,
  Swords,
  Sparkles,
  Code2,
  Target,
  ListTodo,
  Trophy,
  MessageSquare,
  Bot,
  Settings,
  LogOut,
  X,
  ExternalLink
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const primaryMenuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'My Profiles', path: '/profiles', icon: <UserCheck size={18} /> },
    { name: 'Contests', path: '/contests', icon: <Swords size={18} /> },
    { name: 'Events & Hackathons', path: '/events', icon: <Sparkles size={18} /> },
    { name: 'Problem Hub', path: '/problems', icon: <Code2 size={18} /> },
    { name: 'Preparation', path: '/preparation', icon: <Target size={18} /> },
    { name: 'Todo Planner', path: '/todo', icon: <ListTodo size={18} /> },
    { name: 'Leaderboard', path: '/leaderboard', icon: <Trophy size={18} /> },
    { name: 'Discussions', path: '/discussions', icon: <MessageSquare size={18} /> }
  ];

  const secondaryMenuItems = [
    { name: 'AI Assistant', path: '/ai-assistant', icon: <Bot size={18} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={18} /> }
  ];

  const linkStyle = ({ isActive }) => {
    return `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 dark:from-indigo-950/60 dark:to-purple-950/40 dark:text-indigo-300 font-bold shadow-xs border-l-4 border-indigo-600'
        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100'
    }`;
  };

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

        {/* Primary Navigation List */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 text-left">
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Platform Hub
            </p>
            <nav className="space-y-1">
              {primaryMenuItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={linkStyle}
                  onClick={onClose}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Intelligence & Tools
            </p>
            <nav className="space-y-1">
              {secondaryMenuItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={linkStyle}
                  onClick={onClose}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Footer info & Logout button */}
        <div className="border-t border-slate-100 p-3.5 dark:border-slate-800/80 space-y-2">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>

          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 text-xs">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Sync Active
            </span>
            <span className="text-[10px] text-slate-400 font-mono">v3.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
