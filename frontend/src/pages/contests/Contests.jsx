import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import {
  Swords,
  Clock,
  ExternalLink,
  Bell,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const Contests = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'live', 'past'
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Reminder Modal State
  const [reminderModal, setReminderModal] = useState(null);
  const [leadTimeMinutes, setLeadTimeMinutes] = useState(30);
  const [reminderChannel, setReminderChannel] = useState('browser');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [reminderSuccess, setReminderSuccess] = useState('');

  const loadContests = async () => {
    try {
      setLoading(true);
      const data = await api.getContests({
        status: activeTab === 'all' ? undefined : activeTab,
        platform: selectedPlatform === 'all' ? undefined : selectedPlatform,
        search: searchQuery
      });
      setContests(data || []);
    } catch (err) {
      console.error('Failed to load contests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContests();
  }, [activeTab, selectedPlatform]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadContests();
  };

  const handleSyncContests = async () => {
    setIsSyncing(true);
    setStatusMsg('Ingesting real-time contest lists from Codeforces, LeetCode, CodeChef, and AtCoder...');
    try {
      await api.syncContests();
      await loadContests();
      setStatusMsg('✅ Contests successfully synchronized across platforms.');
    } catch (e) {
      setStatusMsg('⚠️ Synchronized with cached fallback.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  const handleScheduleReminder = async (e) => {
    e.preventDefault();
    if (!reminderModal) return;

    try {
      await api.createReminder({
        type: 'contest',
        referenceId: reminderModal.externalContestId || reminderModal._id,
        title: reminderModal.title,
        targetTime: reminderModal.startTime,
        leadTimeMinutes: Number(leadTimeMinutes),
        channel: reminderChannel,
        recipientPhone: reminderChannel === 'voice' ? recipientPhone : null
      });

      setReminderSuccess(`✅ Reminder scheduled ${leadTimeMinutes}m prior via ${reminderChannel}!`);
      setTimeout(() => {
        setReminderSuccess('');
        setReminderModal(null);
      }, 2000);
    } catch (err) {
      alert(`Failed to set reminder: ${err.message}`);
    }
  };

  const platformBadgeStyles = {
    codeforces: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300 dark:border-sky-800',
    leetcode: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    codechef: 'bg-stone-50 text-stone-700 dark:bg-stone-900/60 dark:text-stone-300 border-stone-300 dark:border-stone-700',
    atcoder: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    gfg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    hackerrank: 'bg-green-50 text-green-700 dark:bg-green-950/60 dark:text-green-300 border-green-300 dark:border-green-800'
  };

  return (
    <div className="space-y-8 animate-fade-in text-left pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Swords size={28} className="text-indigo-600" />
            Contest Hub & Arena
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Aggregated competitive programming rounds with direct registration links and AI-powered reminders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSyncContests}
            disabled={isSyncing}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            <span>Sync Feeds</span>
          </Button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          {statusMsg}
        </div>
      )}

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        
        {/* Status Tabs */}
        <div className="flex items-center gap-2">
          {[
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'live', label: 'Live Now' },
            { id: 'past', label: 'Past Contests' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Platform & Search Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Platforms</option>
            <option value="codeforces">Codeforces</option>
            <option value="leetcode">LeetCode</option>
            <option value="codechef">CodeChef</option>
            <option value="atcoder">AtCoder</option>
            <option value="gfg">GeeksforGeeks</option>
          </select>

          <form onSubmit={handleSearch} className="flex items-center gap-1.5">
            <Input
              placeholder="Search contest..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs h-9 w-44 sm:w-56"
            />
            <Button type="submit" className="text-xs px-3 h-9 bg-slate-800 text-white">
              <Search size={14} />
            </Button>
          </form>
        </div>
      </div>

      {/* Contests Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">Loading aggregated contests...</div>
      ) : contests.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-slate-300 dark:border-slate-800">
          <Swords size={36} className="mx-auto text-slate-400 mb-2 opacity-50" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No {activeTab} contests found</h3>
          <p className="text-xs text-slate-500 mt-1">Try changing filters or sync external platform feeds.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {contests.map(c => (
            <Card
              key={c._id || c.id}
              className="p-5 border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between hover:shadow-lg transition-all text-left"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${platformBadgeStyles[c.platform] || 'bg-slate-100 text-slate-700'}`}>
                    {c.platform}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    {c.durationMinutes} mins
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                  {c.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                  {c.description || `${c.platform.toUpperCase()} rated competition for algorithmic problem solvers.`}
                </p>

                <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="font-medium">Start Time:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">
                      {new Date(c.startTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="font-medium">Rating Bracket:</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{c.ratingRange}</span>
                  </div>
                </div>
              </div>

              {/* Actions: Register (Redirects to original page), View, Remind */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setReminderModal(c)}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Schedule Reminder"
                >
                  <Bell size={14} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Remind Me</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <a
                    href={c.contestUrl || c.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    View
                  </a>
                  <a
                    href={c.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    <span>Register</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reminder Scheduler Modal */}
      {reminderModal && (
        <Modal
          isOpen={!!reminderModal}
          onClose={() => setReminderModal(null)}
          title={`Contest Alert: ${reminderModal.title}`}
        >
          <form onSubmit={handleScheduleReminder} className="space-y-4 text-left">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <p className="font-bold text-slate-800 dark:text-slate-200">{reminderModal.title}</p>
              <p className="text-slate-500">
                Starts: {new Date(reminderModal.startTime).toLocaleString()} ({reminderModal.durationMinutes} mins)
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Remind Me Before Start
              </label>
              <select
                value={leadTimeMinutes}
                onChange={(e) => setLeadTimeMinutes(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before (Recommended)</option>
                <option value={60}>1 hour before</option>
                <option value={1440}>1 day before</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Notification Channel
              </label>
              <select
                value={reminderChannel}
                onChange={(e) => setReminderChannel(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                <option value="browser">In-App Notification & Browser Alert</option>
                <option value="email">Email Notification</option>
                <option value="voice">Automated AI Voice Call</option>
              </select>
            </div>

            {reminderChannel === 'voice' && (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Phone Number for Automated Voice Alert
                </label>
                <Input
                  placeholder="+1 (555) 019-2834"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Private & secure: phone numbers are never stored in plain text or shared.
                </p>
              </div>
            )}

            {reminderSuccess && (
              <p className="text-xs font-bold text-emerald-600">{reminderSuccess}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setReminderModal(null)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                Set Reminder
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

export default Contests;
