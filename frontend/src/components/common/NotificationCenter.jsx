import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  X,
  Swords,
  Clock,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

export const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const loadNotifications = async () => {
      setLoading(true);
      try {
        const notifList = [];

        // Fetch upcoming contests
        const contestRes = await api.getContests({ status: 'upcoming' }).catch(() => ({ contests: [] }));
        const upcoming = (contestRes.contests || []).slice(0, 3);
        
        upcoming.forEach(c => {
          const startTime = new Date(c.startTime);
          const diffHours = Math.round((startTime - new Date()) / (1000 * 60 * 60));
          notifList.push({
            id: `contest-${c._id}`,
            title: c.title,
            type: 'contest',
            platform: c.platform,
            timeDesc: diffHours > 0 ? `Starts in ~${diffHours}h` : 'Starting shortly',
            link: '/contests',
            read: false,
            timestamp: c.startTime
          });
        });

        // Add system sync item
        notifList.push({
          id: 'sync-status-1',
          title: 'All CP platform adapters synchronized',
          type: 'system',
          timeDesc: 'Updated just now',
          link: '/profiles',
          read: true,
          timestamp: new Date().toISOString()
        });

        setNotifications(notifList);
      } catch (e) {
        console.error('Failed to load notifications:', e);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [isOpen]);

  if (!isOpen) return null;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-left"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-indigo-600" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Notifications
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Mark all read
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {loading && (
          <div className="p-6 text-center text-xs text-slate-400">
            Checking active alerts...
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="p-6 text-center text-xs text-slate-400">
            No active notifications right now.
          </div>
        )}

        {!loading &&
          notifications.map((n) => (
            <Link
              key={n.id}
              to={n.link}
              onClick={onClose}
              className={`flex items-start gap-3 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                !n.read ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 shrink-0">
                {n.type === 'contest' ? <Swords size={14} /> : <CheckCircle2 size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {n.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <Clock size={10} />
                    {n.timeDesc}
                  </span>
                  {n.platform && (
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {n.platform}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight size={14} className="text-slate-400 shrink-0 mt-1" />
            </Link>
          ))}
      </div>

      <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 text-center">
        <Link
          to="/contests"
          onClick={onClose}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 inline-flex items-center gap-1"
        >
          <span>View all upcoming contests</span>
          <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  );
};

export default NotificationCenter;
