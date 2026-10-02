import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Activity,
  Code2,
  ChevronRight,
  Flame,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Calendar,
  Clock,
  ExternalLink,
  GitBranch,
  Award,
  AlertCircle,
  Bell,
  ArrowUpRight,
  CheckSquare,
  Swords,
  Layers,
  TrendingUp,
  Cpu
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [reminderModal, setReminderModal] = useState(null);
  const [reminderLeadTime, setReminderLeadTime] = useState(30);
  const [reminderChannel, setReminderChannel] = useState('browser');
  const [reminderStatus, setReminderStatus] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardData();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncStatusMsg('Fetching real-time updates from LeetCode, Codeforces, CodeChef, and GitHub...');
    try {
      await api.syncAllPlatforms();
      await loadDashboard();
      setSyncStatusMsg('✅ All platform profiles synchronized successfully!');
    } catch (e) {
      setSyncStatusMsg('⚠️ Synchronized with cached fallback.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatusMsg(''), 4000);
    }
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (!reminderModal) return;
    try {
      await api.createReminder({
        type: 'contest',
        referenceId: reminderModal.externalContestId || reminderModal.id,
        title: reminderModal.title,
        targetTime: reminderModal.startTime,
        leadTimeMinutes: Number(reminderLeadTime),
        channel: reminderChannel
      });
      setReminderStatus(`✅ Reminder set for ${reminderLeadTime}m before start via ${reminderChannel}!`);
      setTimeout(() => {
        setReminderStatus('');
        setReminderModal(null);
      }, 2000);
    } catch (err) {
      setReminderStatus(`Error: ${err.message}`);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="text-sm font-semibold text-slate-500">Aggregating developer telemetry & score...</p>
        </div>
      </div>
    );
  }

  const { developerScore, summaryCards, charts, platformProfiles, upcomingContests, upcomingEvents, todayTasks, recentActivities } = data;
  const dimensions = developerScore?.dimensions || {};

  const difficultyPie = [
    { name: 'Easy', value: charts.difficultyDistribution?.easy || 120, color: '#10B981' },
    { name: 'Medium', value: charts.difficultyDistribution?.medium || 180, color: '#F59E0B' },
    { name: 'Hard', value: charts.difficultyDistribution?.hard || 42, color: '#EF4444' }
  ];

  const platformBadgeColors = {
    leetcode: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    codeforces: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300 dark:border-sky-800',
    codechef: 'bg-stone-100 text-stone-800 dark:bg-stone-900/60 dark:text-stone-300 border-stone-300 dark:border-stone-700',
    hackerrank: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    gfg: 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 border-green-300 dark:border-green-800',
    atcoder: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    github: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800'
  };

  return (
    <div className="space-y-8 animate-fade-in text-left pb-12">
      
      {/* Top Banner: Greeting, Developer Score & Sync Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 -mb-10 h-48 w-48 rounded-full bg-purple-500/10 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-300 border border-white/10">
            <Sparkles size={13} className="text-indigo-400" />
            <span>Unified Developer Profile</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Welcome back, {data.user?.name || user?.name}!
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            {data.user?.college || 'National Institute of Technology'} • {data.user?.department || 'CSE'} ({data.user?.batch || '2026'})
          </p>
          {syncStatusMsg && (
            <p className="text-xs font-semibold text-emerald-400 pt-1 animate-pulse">
              {syncStatusMsg}
            </p>
          )}
        </div>

        {/* Dupilio Developer Score Card */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 bg-white/5 backdrop-blur-lg p-5 rounded-2xl border border-white/10 shrink-0">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Dupilio Developer Score</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                {developerScore?.overall || 74}
              </span>
              <span className="text-slate-400 font-bold text-sm">/ 100</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Top 8% among peers</p>
          </div>

          <div className="h-12 w-px bg-white/10 hidden sm:block"></div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Syncing...' : 'Sync All Platforms'}
            </Button>
            <Link
              to="/profiles"
              className="text-xs text-indigo-300 hover:text-white transition-colors text-center font-medium"
            >
              Manage Profiles →
            </Link>
          </div>
        </div>
      </div>

      {/* Developer Score Dimensional Breakdown */}
      <Card className="p-5 border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Dupilio Developer Score Breakdown
            </h3>
            <p className="text-xs text-slate-500">Transparent index computed across 6 distinct engineering dimensions</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
            Transparent Evaluation
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Problem Solving', score: dimensions.problemSolving || 78, icon: Code2, color: 'text-indigo-600' },
            { label: 'Competitive Prog.', score: dimensions.competitiveProgramming || 72, icon: Swords, color: 'text-sky-600' },
            { label: 'Consistency', score: dimensions.consistency || 70, icon: Flame, color: 'text-amber-500' },
            { label: 'Contest Attendance', score: dimensions.contestParticipation || 68, icon: Trophy, color: 'text-purple-600' },
            { label: 'GitHub Activity', score: dimensions.gitHubActivity || 80, icon: GitBranch, color: 'text-emerald-600' },
            { label: 'Project Depth', score: dimensions.projectActivity || 75, icon: Layers, color: 'text-pink-600' }
          ].map((dim, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 text-left">
              <div className="flex items-center justify-between mb-1.5">
                <dim.icon size={16} className={dim.color} />
                <span className="text-xs font-bold text-slate-900 dark:text-white">{dim.score}%</span>
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-tight truncate">{dim.label}</p>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className={`h-full rounded-full bg-indigo-600`} style={{ width: `${dim.score}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Summary KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { title: 'Problems Solved', value: summaryCards.problemsSolved, icon: Code2, desc: 'Across LC, GFG, HR' },
          { title: 'Contest Rating', value: summaryCards.contestRating, icon: Trophy, desc: 'Peak Codeforces/LC' },
          { title: 'Contests Attended', value: summaryCards.contestParticipation, icon: Swords, desc: 'Verified participations' },
          { title: 'GitHub Stars', value: summaryCards.githubContributions, icon: GitBranch, desc: 'Open source traction' },
          { title: 'Current Streak', value: `${summaryCards.currentStreak} Days`, icon: Flame, desc: 'Consecutive activity' },
          { title: 'Connected Platforms', value: `${summaryCards.connectedPlatformsCount} / 7`, icon: Layers, desc: 'Active data sync' }
        ].map((card, idx) => (
          <Card key={idx} className="p-4 border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{card.title}</span>
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <card.icon size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{card.value}</p>
            <p className="text-[11px] text-slate-400 mt-1">{card.desc}</p>
          </Card>
        ))}
      </div>

      {/* Charts Section: Rating History & Solved Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Rating History */}
        <Card className="lg:col-span-2 p-5 border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Contest Rating Trajectory</h3>
              <p className="text-xs text-slate-500">Historical performance across competitive programming rounds</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
              Peak: {summaryCards.contestRating}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.ratingHistory}>
                <defs>
                  <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="contest" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} domain={['dataMin - 100', 'dataMax + 100']} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                <Area type="monotone" dataKey="rating" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorRating)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Difficulty Distribution Pie */}
        <Card className="p-5 border-slate-200/80 dark:border-slate-800/80">
          <div className="mb-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Difficulty Breakdown</h3>
            <p className="text-xs text-slate-500">Solved distribution by challenge complexity</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={difficultyPie}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {difficultyPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: 8, color: '#fff', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            {difficultyPie.map(item => (
              <div key={item.name}>
                <span className="text-xs font-semibold block" style={{ color: item.color }}>{item.name}</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Connected Platform Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Connected Platforms</h2>
            <p className="text-xs text-slate-500">Live statistics synchronized via official & public platform adapters</p>
          </div>
          <Link to="/profiles" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            Configure All Profiles
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {platformProfiles.map(profile => (
            <Card
              key={profile.platform}
              className="p-5 border-slate-200/80 dark:border-slate-800/80 hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => setSelectedPlatform(profile)}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${platformBadgeColors[profile.platform] || 'bg-slate-100 text-slate-700'}`}>
                  {profile.platform}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {profile.connectionStatus === 'connected' ? '● Synced' : '○ Pending'}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-400">Handle</p>
                <p className="text-base font-bold text-slate-900 dark:text-white truncate">
                  @{profile.username}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-left">
                <div>
                  <span className="text-[11px] text-slate-400 block">{profile.platform === 'github' ? 'Repos' : 'Solved'}</span>
                  <span className="text-lg font-extrabold text-slate-900 dark:text-white">{profile.solved}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">{profile.platform === 'github' ? 'Velocity' : 'Rating'}</span>
                  <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{profile.rating || 'N/A'}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                <span>View Analytics</span>
                <ChevronRight size={14} />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Upcoming Contests & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming Contests */}
        <Card className="p-5 border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Swords size={18} className="text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Upcoming Contests</h3>
              </div>
              <Link to="/contests" className="text-xs font-semibold text-indigo-600 hover:underline">
                View All Contests →
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingContests.map(c => (
                <div key={c._id || c.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-3">
                  <div className="space-y-1 text-left min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${platformBadgeColors[c.platform] || 'bg-slate-100 text-slate-700'}`}>
                        {c.platform}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                        <Clock size={12} />
                        {new Date(c.startTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {c.title}
                    </p>
                    <p className="text-[11px] text-slate-400">Duration: {c.durationMinutes} mins • {c.ratingRange}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setReminderModal(c)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Bell size={13} />
                      <span className="hidden sm:inline">Remind</span>
                    </button>
                    <a
                      href={c.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <span>Register</span>
                      <ArrowUpRight size={13} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[11px] text-slate-400">
              *Register redirects to original platform registration page.
            </p>
          </div>
        </Card>

        {/* Today's Tasks & Schedule */}
        <Card className="p-5 border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare size={18} className="text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Today's Tasks & Schedule</h3>
              </div>
              <Link to="/todo" className="text-xs font-semibold text-indigo-600 hover:underline">
                Todo Planner →
              </Link>
            </div>

            <div className="space-y-2.5">
              {todayTasks.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-500 opacity-60" />
                  <p className="text-sm font-semibold">No pending tasks for today!</p>
                  <Link to="/todo" className="text-xs text-indigo-600 font-bold mt-1 inline-block hover:underline">
                    + Add a preparation task
                  </Link>
                </div>
              ) : (
                todayTasks.map(t => (
                  <div key={t._id || t.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${t.priority === 'urgent' ? 'bg-rose-500' : t.priority === 'high' ? 'bg-amber-500' : 'bg-indigo-500'}`}></span>
                      <div className="truncate">
                        <p className={`text-sm font-semibold ${t.isCompleted ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'} truncate`}>
                          {t.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">Category: {t.category} • Priority: {t.priority}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                      {t.isCompleted ? 'Done' : 'Pending'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Stay consistent to elevate your consistency score.</span>
            <Link to="/todo" className="font-bold text-indigo-600 hover:underline">Manage All Tasks</Link>
          </div>
        </Card>
      </div>

      {/* Opportunities & Hackathons Preview */}
      <Card className="p-5 border-slate-200/80 dark:border-slate-800/80 text-left">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Upcoming Hackathons & Opportunities</h3>
            <p className="text-xs text-slate-500">Verified campus competitions, fellowships, and hiring challenges</p>
          </div>
          <Link to="/events" className="text-xs font-semibold text-indigo-600 hover:underline">
            Browse All Opportunities →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingEvents.map(evt => (
            <div key={evt._id || evt.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                    {evt.type}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{evt.location}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{evt.title}</h4>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">{evt.company}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                  {evt.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">
                  Deadline: {new Date(evt.registrationDeadline).toLocaleDateString()}
                </span>
                <a
                  href={evt.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-0.5"
                >
                  Apply <ArrowUpRight size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Platform Details Analytics Modal */}
      {selectedPlatform && (
        <Modal
          isOpen={!!selectedPlatform}
          onClose={() => setSelectedPlatform(null)}
          title={`${selectedPlatform.platform.toUpperCase()} Analytics (@${selectedPlatform.username})`}
        >
          <div className="space-y-4 text-left">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-slate-400 block">Rating</span>
                <span className="text-xl font-black text-indigo-600">{selectedPlatform.rating || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Global Rank / Percentile</span>
                <span className="text-xl font-bold text-slate-800 dark:text-slate-200">{selectedPlatform.rank}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Solved Problems</span>
                <span className="text-xl font-bold text-slate-800 dark:text-slate-200">{selectedPlatform.solved}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Contest Participations</span>
                <span className="text-xl font-bold text-slate-800 dark:text-slate-200">{selectedPlatform.contests}</span>
              </div>
            </div>

            {selectedPlatform.recentActivity && selectedPlatform.recentActivity.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Recent Submissions</h4>
                <div className="space-y-1.5">
                  {selectedPlatform.recentActivity.map((sub, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-100/70 dark:bg-slate-900/50 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{sub.title}</span>
                      <span className="font-bold text-emerald-600">{sub.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-between items-center">
              <a
                href={selectedPlatform.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                Open Original Profile <ExternalLink size={12} />
              </a>
              <Button onClick={() => setSelectedPlatform(null)} className="text-xs px-4 py-1.5">
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Contest Reminder Scheduler Modal */}
      {reminderModal && (
        <Modal
          isOpen={!!reminderModal}
          onClose={() => setReminderModal(null)}
          title={`Set Contest Reminder: ${reminderModal.title}`}
        >
          <form onSubmit={handleCreateReminder} className="space-y-4 text-left">
            <p className="text-xs text-slate-500">
              Schedule an automated notification before the contest begins so you never miss registration or round start.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Reminder Lead Time
              </label>
              <select
                value={reminderLeadTime}
                onChange={(e) => setReminderLeadTime(e.target.value)}
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
                <option value="browser">In-App & Browser Alert</option>
                <option value="email">Email Notification</option>
                <option value="voice">Automated AI Voice Call Alert</option>
              </select>
            </div>

            {reminderStatus && (
              <p className="text-xs font-bold text-emerald-600">{reminderStatus}</p>
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

export default Dashboard;
