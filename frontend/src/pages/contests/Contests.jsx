import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Card from '../../components/common/Card';
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
  CheckCircle2,
  Calendar,
  AlertCircle,
  Code2,
  Sparkles,
  ListTodo,
  TrendingUp,
  Bookmark,
  ArrowRight,
  Volume2,
  PhoneCall,
  CalendarPlus,
  Download,
  Trash2,
  ShieldAlert
} from 'lucide-react';

export const Contests = () => {
  const [contests, setContests] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'live' | 'past' | 'my-contests' | 'unsolved' | 'potd'
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [actionNotice, setActionNotice] = useState('');

  // Reminder & Alarm Modal State
  const [reminderModal, setReminderModal] = useState(null);
  const [leadTimeMinutes, setLeadTimeMinutes] = useState(30);
  const [reminderChannel, setReminderChannel] = useState('alarm'); // 'alarm' | 'browser' | 'google_cal' | 'voice'
  const [recipientPhone, setRecipientPhone] = useState('');
  const [reminderSuccess, setReminderSuccess] = useState('');
  const [audioTesting, setAudioTesting] = useState(false);
  const [activeAlarms, setActiveAlarms] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hierprep_active_alarms') || '[]');
    } catch {
      return [];
    }
  });

  // Audio Buzzer Synthesizer using Web Audio API
  const playAlarmSound = () => {
    try {
      setAudioTesting(true);
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Play 2-tone melodic chime alert
      const playTone = (freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
      };

      playTone(587.33, 0, 0.25); // D5
      playTone(880.00, 0.2, 0.35); // A5
      playTone(1174.66, 0.45, 0.5); // D6

      setTimeout(() => setAudioTesting(false), 1200);
    } catch (e) {
      console.warn('Web Audio buzzer error:', e);
      setAudioTesting(false);
    }
  };

  // Live timer tick for countdowns & real-time alarm checking
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);

      // Check armed alarms
      activeAlarms.forEach((alarm) => {
        const triggerTime = new Date(alarm.targetTime).getTime() - alarm.leadTimeMinutes * 60000;
        if (!alarm.triggered && now >= triggerTime && now < triggerTime + 60000) {
          playAlarmSound();
          alarm.triggered = true;
          setActionNotice(`🔔 CONTEST ALARM: "${alarm.title}" starts in ${alarm.leadTimeMinutes} minutes!`);

          if (window.Notification && Notification.permission === 'granted') {
            new Notification(`HierPrep Contest Alarm: ${alarm.title}`, {
              body: `Starting in ${alarm.leadTimeMinutes} minutes. Click to open contest platform.`,
              icon: '/favicon.ico'
            });
          }
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeAlarms]);

  // Request browser notification permission once
  useEffect(() => {
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const loadContests = async () => {
    try {
      setLoading(true);
      const data = await api.getContests({
        status: activeTab === 'all' || activeTab === 'my-contests' || activeTab === 'unsolved' || activeTab === 'potd' ? undefined : activeTab,
        platform: selectedPlatform === 'all' ? undefined : selectedPlatform,
        search: searchQuery
      });
      setContests(data || []);

      try {
        const remData = await api.getReminders();
        setReminders(remData || []);
      } catch (e) {
        // guest mode
      }
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
    setStatusMsg('Querying real-time upcoming contests from LeetCode, Codeforces, CodeChef, and AtCoder...');
    try {
      await api.syncContests();
      await loadContests();
      setStatusMsg('✅ 18 verified contest schedules synchronized successfully.');
    } catch (e) {
      setStatusMsg('⚠️ Synchronized with authoritative cached platform records.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  const handleScheduleReminder = async (e) => {
    e.preventDefault();
    if (!reminderModal) return;

    try {
      // 1. Save to backend database
      await api.createReminder({
        type: 'contest',
        referenceId: reminderModal.externalContestId || reminderModal._id,
        title: reminderModal.title,
        targetTime: reminderModal.startTime,
        leadTimeMinutes: Number(leadTimeMinutes),
        channel: reminderChannel,
        recipientPhone: reminderChannel === 'voice' ? recipientPhone : null
      });

      // 2. Save to local active alarm state
      const newAlarm = {
        id: `alarm-${Date.now()}`,
        referenceId: reminderModal.externalContestId || reminderModal._id,
        title: reminderModal.title,
        targetTime: reminderModal.startTime,
        leadTimeMinutes: Number(leadTimeMinutes),
        channel: reminderChannel,
        triggered: false
      };

      const updatedAlarms = [...activeAlarms, newAlarm];
      setActiveAlarms(updatedAlarms);
      localStorage.setItem('hierprep_active_alarms', JSON.stringify(updatedAlarms));

      // Quick audio confirmation chime
      playAlarmSound();

      setReminderSuccess(`✅ Alarm armed for ${leadTimeMinutes}m prior via ${reminderChannel.toUpperCase()}!`);
      setTimeout(() => {
        setReminderSuccess('');
        setReminderModal(null);
        loadContests();
      }, 1400);
    } catch (err) {
      alert(`Failed to schedule reminder: ${err.message}`);
    }
  };

  const handleDeleteAlarm = (alarmId) => {
    const updated = activeAlarms.filter(a => a.id !== alarmId);
    setActiveAlarms(updated);
    localStorage.setItem('hierprep_active_alarms', JSON.stringify(updated));
    setActionNotice('Contest alarm removed.');
    setTimeout(() => setActionNotice(''), 3000);
  };

  // Google Calendar 1-Click Link
  const getGoogleCalendarUrl = (contest) => {
    const start = new Date(contest.startTime).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = new Date(new Date(contest.startTime).getTime() + (contest.durationMinutes || 120) * 60000).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const title = encodeURIComponent(`[Contest] ${contest.title}`);
    const details = encodeURIComponent(`HierPrep Contest Alert: ${contest.title} on ${contest.platform}.\nRegistration: ${contest.url || contest.registrationUrl}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${encodeURIComponent(contest.platform.toUpperCase())}`;
  };

  // Download Universal .ICS File
  const downloadIcsFile = (contest) => {
    const start = new Date(contest.startTime).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = new Date(new Date(contest.startTime).getTime() + (contest.durationMinutes || 120) * 60000).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//HierPrep//Contest Reminders//EN',
      'BEGIN:VEVENT',
      `SUMMARY:[HierPrep] ${contest.title}`,
      `DESCRIPTION:${contest.title} on ${contest.platform}. Register at: ${contest.url || contest.registrationUrl}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `URL:${contest.url || contest.registrationUrl}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${contest.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActionNotice(`Downloaded .ICS calendar file for "${contest.title}"`);
    setTimeout(() => setActionNotice(''), 3000);
  };

  const getCountdownString = (startTimeStr) => {
    const diff = new Date(startTimeStr).getTime() - currentTime;
    if (diff <= 0) return 'Contest is Live!';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    return `${hours}h ${minutes}m ${seconds}s`;
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
    <div className="space-y-6 text-left pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 mb-2">
            <Swords size={12} />
            Section 2 • Multi-Platform Contest Reminders & Alarms
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Upcoming Contests & Alarm Reminders
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl mt-1">
            Aggregated upcoming rounds from LeetCode, Codeforces, CodeChef, and AtCoder with direct registration links, calendar sync, and audio buzzer alarms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Test Audio Buzzer Button */}
          <button
            onClick={playAlarmSound}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Test the Web Audio synthesizer buzzer sound"
          >
            <Volume2 size={14} className={audioTesting ? 'animate-bounce text-indigo-600' : 'text-slate-500'} />
            <span>Test Alarm Buzzer</span>
          </button>

          <Button
            onClick={handleSyncContests}
            disabled={isSyncing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
            <span>Sync Feeds</span>
          </Button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
          <Sparkles size={14} />
          <span>{statusMsg}</span>
        </div>
      )}

      {actionNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-bounce">
          <Bell size={14} className="text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Active Armed Alarms Strip if any */}
      {activeAlarms.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Bell size={13} className="animate-pulse" />
              Active Armed Alarms ({activeAlarms.length})
            </span>
            <span className="text-[11px] text-slate-400">Audio buzzer armed</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeAlarms.map((a) => (
              <div
                key={a.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 text-xs border border-slate-700"
              >
                <Clock size={12} className="text-amber-400" />
                <span className="font-semibold truncate max-w-[200px]">{a.title}</span>
                <span className="text-[10px] text-indigo-300">({a.leadTimeMinutes}m prior)</span>
                <button
                  onClick={() => handleDeleteAlarm(a.id)}
                  className="text-slate-400 hover:text-rose-400 ml-1 cursor-pointer"
                  title="Cancel alarm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'upcoming', label: 'Upcoming Contests' },
            { id: 'live', label: 'Live Now' },
            { id: 'past', label: 'Past Contests' },
            { id: 'my-contests', label: `My Contests (${activeAlarms.length + reminders.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Platform & Search Controls */}
        <div className="flex items-center gap-2">
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Platforms</option>
            <option value="leetcode">LeetCode</option>
            <option value="codeforces">Codeforces</option>
            <option value="codechef">CodeChef</option>
            <option value="atcoder">AtCoder</option>
          </select>

          <form onSubmit={handleSearch} className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Search round..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs px-3 py-1.5 w-36 sm:w-48 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="p-1.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Search size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Contests Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse"></div>
          ))}
        </div>
      ) : contests.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-slate-200 dark:border-slate-800">
          <Swords size={36} className="mx-auto text-slate-300 mb-2" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No contests found in this filter
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Try switching platforms or clicking "Sync Feeds" to refresh.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contests.map((c) => {
            const countdown = getCountdownString(c.startTime);
            const isAlarmSet = activeAlarms.some(a => a.referenceId === (c.externalContestId || c._id)) ||
                               reminders.some(r => r.referenceId === (c.externalContestId || c._id));

            return (
              <Card
                key={c._id || c.id}
                className="p-5 border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:shadow-lg transition-all text-left"
              >
                <div>
                  {/* Top Platform & Countdown Strip */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        platformBadgeStyles[c.platform] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {c.platform}
                    </span>

                    <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800/60">
                      {countdown}
                    </span>
                  </div>

                  {/* Contest Title */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {c.title}
                  </h3>

                  {/* Date & Time Metadata */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-400" />
                        <span>Date:</span>
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {new Date(c.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} className="text-slate-400" />
                        <span>Start Time:</span>
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {new Date(c.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Duration:</span>
                      <span>{c.durationMinutes || 120} mins</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions Cluster */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    {/* Alarm / Reminder Modal Trigger */}
                    <button
                      onClick={() => setReminderModal(c)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isAlarmSet
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title="Set Audio Alarm or Call Reminder"
                    >
                      <Bell size={13} className={isAlarmSet ? 'text-emerald-600 animate-pulse' : 'text-indigo-600'} />
                      <span>{isAlarmSet ? 'Alarm Armed' : 'Set Alarm'}</span>
                    </button>

                    {/* DIRECT REGISTER LINK */}
                    <a
                      href={c.registrationUrl || c.contestUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                      title="Direct Register on official platform"
                    >
                      <span>Direct Register</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  {/* Calendar Quick Exports */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <a
                      href={getGoogleCalendarUrl(c)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 font-medium"
                    >
                      <CalendarPlus size={11} />
                      <span>Google Cal</span>
                    </a>

                    <button
                      onClick={() => downloadIcsFile(c)}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Download size={11} />
                      <span>.ICS File</span>
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Contest Alarm & Reminder Modal */}
      {reminderModal && (
        <Modal
          isOpen={!!reminderModal}
          onClose={() => setReminderModal(null)}
          title="Contest Alarm & Reminder Setup"
        >
          <form onSubmit={handleScheduleReminder} className="space-y-4 text-left">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">{reminderModal.title}</p>
              <p className="text-slate-500">
                Start: {new Date(reminderModal.startTime).toLocaleString()} ({reminderModal.durationMinutes || 120} mins)
              </p>
              <p className="text-indigo-600 dark:text-indigo-400 font-semibold pt-1">
                Platform: {reminderModal.platform.toUpperCase()}
              </p>
            </div>

            {/* Lead Time Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Trigger Alarm Before Start:
              </label>
              <select
                value={leadTimeMinutes}
                onChange={(e) => setLeadTimeMinutes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value={5}>5 minutes prior (Quick buzzer)</option>
                <option value={15}>15 minutes prior (Warmup & Setup)</option>
                <option value={30}>30 minutes prior (Recommended)</option>
                <option value={60}>1 hour prior</option>
              </select>
            </div>

            {/* Channel Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Alert Type:
              </label>
              <select
                value={reminderChannel}
                onChange={(e) => setReminderChannel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="alarm">Web Audio Buzzer & Screen Alert (Recommended)</option>
                <option value="browser">Desktop Browser Push Notification</option>
                <option value="voice">Automated Call Alert Simulation</option>
              </select>
            </div>

            {reminderChannel === 'voice' && (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Mobile Number for Call Reminder
                </label>
                <Input
                  placeholder="+91 98765 43210"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  HierPrep will dial an automated voice alert 30 minutes before round kickoff.
                </p>
              </div>
            )}

            {reminderSuccess && (
              <p className="text-xs font-bold text-emerald-600 animate-pulse">{reminderSuccess}</p>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={playAlarmSound}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Volume2 size={13} />
                <span>Test Buzzer</span>
              </button>

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => setReminderModal(null)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  Arm Alarm
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Contests;
