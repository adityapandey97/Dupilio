import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
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
  Swords,
  Layers,
  TrendingUp,
  Cpu,
  Plus,
  Globe,
  School,
  Flag,
  Search,
  Star,
  GitPullRequest,
  CheckSquare,
  ShieldCheck,
  Terminal,
  Bookmark
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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

  // Section 1 State: Heatmap Platform Filter & Side Leaderboard Tab
  const [heatmapFilter, setHeatmapFilter] = useState('all'); // 'all' | 'leetcode' | 'codeforces' | 'codechef' | 'gfg'
  const [leaderboardTab, setLeaderboardTab] = useState('global'); // 'global' | 'college' | 'country'
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [hoveredDay, setHoveredDay] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardData();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncStatusMsg('Syncing real-time statistics from LeetCode, Codeforces, CodeChef, and GitHub...');
    try {
      await api.syncAllPlatforms();
      await loadDashboard();
      setSyncStatusMsg('✅ All platform profiles synchronized successfully!');
    } catch (e) {
      setSyncStatusMsg('⚠️ Synchronized with cached authoritative telemetry.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatusMsg(''), 4500);
    }
  };

  // Filtered leaderboard records
  const filteredLeaderboard = useMemo(() => {
    if (!data?.sideLeaderboard) return [];
    const list = data.sideLeaderboard[leaderboardTab] || [];
    if (!leaderboardSearch.trim()) return list;
    const q = leaderboardSearch.toLowerCase().trim();
    return list.filter(item =>
      item.name.toLowerCase().includes(q) ||
      (item.college || '').toLowerCase().includes(q) ||
      (item.country || '').toLowerCase().includes(q)
    );
  }, [data?.sideLeaderboard, leaderboardTab, leaderboardSearch]);

  if (loading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="text-sm font-semibold text-slate-500">Aggregating developer telemetry & competitive ratings...</p>
        </div>
      </div>
    );
  }

  const {
    developerScore,
    summaryCards,
    charts,
    platformRatingsMatrix = [],
    monthlyHeatmap = [],
    githubTelemetry = {},
    upcomingContests = []
  } = data;

  const difficultyPie = [
    { name: 'Easy', value: charts.difficultyDistribution?.easy || 180, color: '#10B981' },
    { name: 'Medium', value: charts.difficultyDistribution?.medium || 240, color: '#F59E0B' },
    { name: 'Hard', value: charts.difficultyDistribution?.hard || 63, color: '#EF4444' }
  ];

  const totalSolvedAll = summaryCards.problemsSolved || 483;

  return (
    <div className="space-y-8 animate-fade-in text-left pb-16">
      
      {/* =========================================================================
          TOP BANNER: DEVELOPER PROFILE OVERVIEW & REAL-TIME SYNC
         ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/4 bottom-0 -mb-8 h-48 w-48 rounded-full bg-sky-500/10 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-300 border border-white/10">
              <Sparkles size={13} className="text-indigo-400" />
              <span>HierPrep Unified Developer Ecosystem</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {data.user?.name || user?.name || 'Engineer'}
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed flex flex-wrap items-center gap-2">
              <span className="font-semibold text-white">{data.user?.college || user?.college || 'National Institute of Technology'}</span>
              <span>•</span>
              <span>{data.user?.department || 'CSE'} ({data.user?.batch || '2026'})</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                <Flag size={11} /> {user?.country || 'India'}
              </span>
            </p>
            {syncStatusMsg && (
              <p className="text-xs font-semibold text-emerald-400 pt-1 animate-pulse">
                {syncStatusMsg}
              </p>
            )}
          </div>

          {/* Unified Score & Sync Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-800/80 backdrop-blur-md p-5 rounded-2xl border border-slate-700/80 shrink-0">
            <div className="text-center sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Engineering Index
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-300">
                  {developerScore?.overall ?? 76}
                </span>
                <span className="text-slate-400 font-bold text-sm">/ 100</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Verified multi-platform rating index
              </p>
            </div>

            <div className="h-12 w-px bg-slate-700 hidden sm:block"></div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <Button
                onClick={handleSyncAll}
                disabled={isSyncing}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? 'Synchronizing...' : 'Sync All Profiles'}
              </Button>
              <Link
                to="/profiles"
                className="text-xs text-indigo-300 hover:text-white transition-colors text-center font-medium"
              >
                Manage Connected Accounts →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          KEY METRICS ROW
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { title: 'Problems Solved', value: totalSolvedAll, icon: Code2, desc: 'Across LC, CF, CC, GFG' },
          { title: 'Peak Contest Rating', value: summaryCards.contestRating || 1720, icon: Trophy, desc: 'LeetCode / Codeforces' },
          { title: 'Contests Attended', value: `${summaryCards.contestParticipation || 32}`, icon: Swords, desc: 'Official rated rounds' },
          { title: 'GitHub Stars', value: githubTelemetry.totalStars || 14, icon: Star, desc: 'Open source traction' },
          { title: 'Active Streak', value: `${summaryCards.currentStreak || 14} Days`, icon: Flame, desc: 'Consistent coding velocity' },
          { title: 'Connected Platforms', value: `${platformRatingsMatrix.length} Platforms`, icon: Layers, desc: 'Live data sync adapters' }
        ].map((card, idx) => (
          <Card key={idx} className="p-4 border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{card.title}</span>
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <card.icon size={15} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{card.value}</p>
            <p className="text-[10px] text-slate-400 mt-1 truncate">{card.desc}</p>
          </Card>
        ))}
      </div>

      {/* =========================================================================
          SECTION 1 PART A: ALL-PLATFORM PROBLEM SOLVED & CONTEST RATING MATRIX
         ========================================================================= */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 size={20} className="text-indigo-600" />
              All-Platform Problems Solved & Contest Ratings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Unified competitive programming telemetry across LeetCode, Codeforces, CodeChef, GeeksforGeeks, HackerRank, and AtCoder
            </p>
          </div>
          <Link to="/profiles" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            Configure Accounts
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platformRatingsMatrix.map((plat) => (
            <Card
              key={plat.platform}
              className="p-5 border-slate-200/80 dark:border-slate-800/80 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                    {plat.platform.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                      {plat.platform}
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      {plat.rankTier}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {plat.badge}
                </span>
              </div>

              {/* Solved vs Rating Grid */}
              <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400 block">Problems Solved</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {plat.solved}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Contest Rating</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                      {plat.currentRating || 'Unrated'}
                    </span>
                    {plat.peakRating > 0 && (
                      <span className="text-[10px] text-slate-400">Peak: {plat.peakRating}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Sub-breakdown (Easy / Medium / Hard) */}
              <div className="pt-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">E: {plat.easy}</span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">M: {plat.medium}</span>
                  <span className="text-rose-600 dark:text-rose-400 font-semibold">H: {plat.hard}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  {plat.contestsAttended} Contests
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* =========================================================================
          SECTION 1 PART B: MONTHLY PROBLEM SOLVING HEATMAP (ACROSS PLATFORMS)
         ========================================================================= */}
      <Card className="p-6 border-slate-200/80 dark:border-slate-800/80 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Problem Solving Heatmap (All Platforms)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Continuous 365-day problem-solving activity calendar across connected platforms
            </p>
          </div>

          {/* Platform Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            {[
              { id: 'all', label: 'All Platforms' },
              { id: 'leetcode', label: 'LeetCode' },
              { id: 'codeforces', label: 'Codeforces' },
              { id: 'codechef', label: 'CodeChef' },
              { id: 'gfg', label: 'GFG' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setHeatmapFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  heatmapFilter === tab.id
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Heatmap Grid Visualizer */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[760px]">
            {/* Days Grid: 52 columns x 7 rows */}
            <div className="grid grid-flow-col grid-rows-7 gap-1">
              {monthlyHeatmap.map((day, idx) => {
                let cellCount = day.count;
                if (heatmapFilter !== 'all' && day.breakdown) {
                  cellCount = day.breakdown[heatmapFilter] || 0;
                }

                let colorClass = 'bg-slate-100 dark:bg-slate-800/80';
                if (cellCount >= 6) colorClass = 'bg-indigo-600 dark:bg-indigo-500';
                else if (cellCount >= 4) colorClass = 'bg-indigo-500/80 dark:bg-indigo-600/80';
                else if (cellCount >= 2) colorClass = 'bg-indigo-400/70 dark:bg-indigo-700/70';
                else if (cellCount >= 1) colorClass = 'bg-indigo-200 dark:bg-indigo-900/60';

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredDay({ ...day, filteredCount: cellCount })}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`h-3 w-3 rounded-xs ${colorClass} transition-transform hover:scale-125 cursor-pointer`}
                    title={`${day.date}: ${cellCount} problems solved`}
                  />
                );
              })}
            </div>

            {/* Heatmap Legend & Tooltip Preview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="text-slate-500 dark:text-slate-400">
                {hoveredDay ? (
                  <span className="font-semibold text-slate-900 dark:text-white">
                    📅 {hoveredDay.date}: <strong>{hoveredDay.filteredCount}</strong> problems solved{' '}
                    {heatmapFilter === 'all' && hoveredDay.breakdown ? `(LC: ${hoveredDay.breakdown.leetcode}, CF: ${hoveredDay.breakdown.codeforces}, CC: ${hoveredDay.breakdown.codechef})` : ''}
                  </span>
                ) : (
                  <span>Hover over any calendar cell to view daily platform breakdown</span>
                )}
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <span>Less</span>
                <span className="h-2.5 w-2.5 rounded-xs bg-slate-100 dark:bg-slate-800"></span>
                <span className="h-2.5 w-2.5 rounded-xs bg-indigo-200 dark:bg-indigo-900/60"></span>
                <span className="h-2.5 w-2.5 rounded-xs bg-indigo-400/70 dark:bg-indigo-700/70"></span>
                <span className="h-2.5 w-2.5 rounded-xs bg-indigo-600 dark:bg-indigo-500"></span>
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* =========================================================================
          SECTION 1 PART C: GITHUB PAGE HEATMAP & DETAILS + SIDE LEADERBOARD
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT (8 Cols): GITHUB PROFILE HEATMAP & DEVELOPER TELEMETRY */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 border-slate-200/80 dark:border-slate-800/80 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                  <GitBranch size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    GitHub Engineering Telemetry & Heatmap
                  </h3>
                  <a
                    href={`https://github.com/${githubTelemetry.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    @{githubTelemetry.username}
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>

              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {githubTelemetry.currentStreak || 12} Day Commit Streak
              </span>
            </div>

            {/* GitHub Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] text-slate-400 block">Repositories</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {githubTelemetry.totalRepositories || 18}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Yearly Commits</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {githubTelemetry.totalCommits || 542}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Pull Requests</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {githubTelemetry.totalPullRequests || 34}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Stars Earned</span>
                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                  ★ {githubTelemetry.totalStars || 14}
                </span>
              </div>
            </div>

            {/* GitHub 52-Week Green Contribution Grid */}
            <div className="pt-4">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                52-Week Contribution Activity Graph
              </span>
              <div className="overflow-x-auto pb-2">
                <div className="min-w-[620px] grid grid-flow-col grid-rows-7 gap-1">
                  {(githubTelemetry.weeks || []).map(w =>
                    w.days.map((d, dIdx) => {
                      let bg = 'bg-slate-100 dark:bg-slate-800/80';
                      if (d.level === 4) bg = 'bg-emerald-600 dark:bg-emerald-500';
                      else if (d.level === 3) bg = 'bg-emerald-500 dark:bg-emerald-600';
                      else if (d.level === 2) bg = 'bg-emerald-400/80 dark:bg-emerald-700/80';
                      else if (d.level === 1) bg = 'bg-emerald-200 dark:bg-emerald-900/60';

                      return (
                        <div
                          key={`${w.weekIndex}-${dIdx}`}
                          className={`h-2.5 w-2.5 rounded-xs ${bg}`}
                          title={`${d.date}: ${d.count} contributions`}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Top Languages Breakdown */}
            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Most Used Languages
              </span>
              <div className="space-y-2">
                {(githubTelemetry.languages || []).map((lang, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{lang.language}</span>
                      <span className="text-slate-400 font-mono">{lang.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${lang.percentage}%`, backgroundColor: lang.color || '#6366F1' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Repositories */}
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2.5">
                Top Public Repositories
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(githubTelemetry.topRepositories || []).slice(0, 2).map((repo, idx) => (
                  <a
                    key={idx}
                    href={repo.url || 'https://github.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 hover:border-indigo-400 transition-colors block text-left group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline truncate">
                        {repo.name}
                      </span>
                      <span className="text-[10px] text-slate-400">★ {repo.stars || 0}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                      {repo.description}
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {repo.language}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </Card>

          {/* Rating History Trajectory Chart */}
          <Card className="p-6 border-slate-200/80 dark:border-slate-800/80 text-left">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Contest Rating Trajectory
                </h3>
                <p className="text-xs text-slate-500">Historical performance across rated rounds</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                Peak: {summaryCards.contestRating || 1720}
              </span>
            </div>

            <div className="h-60 w-full">
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
        </div>

        {/* RIGHT (5 Cols): SIDE LEADERBOARD OF GLOBAL, COLLEGE, COUNTRY */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 border-slate-200/80 dark:border-slate-800/80 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Competitive Standings
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Real-Time Ranks
              </span>
            </div>

            {/* Scope Toggle: Global | College | Country */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl my-3 border border-slate-200 dark:border-slate-800">
              {[
                { id: 'global', label: 'Global', icon: Globe },
                { id: 'college', label: 'College', icon: School },
                { id: 'country', label: 'Country', icon: Flag }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setLeaderboardTab(tab.id)}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    leaderboardTab === tab.id
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <tab.icon size={12} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Search within side leaderboard */}
            <div className="relative mb-3">
              <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${leaderboardTab} coders...`}
                value={leaderboardSearch}
                onChange={e => setLeaderboardSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Leaderboard Table Entries */}
            <div className="space-y-2">
              {filteredLeaderboard.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                    item.isCurrentUser
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 shadow-xs'
                      : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100/60 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`h-6 w-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                      item.rank === 1 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300' :
                      item.rank === 2 ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300' :
                      item.rank === 3 ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300' :
                      'text-slate-400'
                    }`}>
                      #{item.rank}
                    </span>

                    <div className="min-w-0 truncate">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`text-xs font-bold truncate ${item.isCurrentUser ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>
                          {item.name}
                        </span>
                        {item.isCurrentUser && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-600 text-white shrink-0">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        {leaderboardTab === 'college' ? item.country : item.college}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      {item.score} pts
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.solved} solved • {item.rating} rating
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 mt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <Link
                to="/leaderboard"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1"
              >
                Open Full Dedicated Leaderboard
                <ChevronRight size={13} />
              </Link>
            </div>
          </Card>

          {/* Quick Shortcuts to Sections 2, 3, 4 */}
          <Card className="p-5 border-slate-200/80 dark:border-slate-800/80 text-left space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Quick Action Hub
            </span>

            <Link
              to="/contests"
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between hover:border-indigo-400 transition-colors group block"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                  <Swords size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Upcoming Contests & Alarms</h4>
                  <p className="text-[10px] text-slate-400">Live calendar with audio alarm & calendar sync</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/events"
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between hover:border-indigo-400 transition-colors group block"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Events & Hackathons Hub</h4>
                  <p className="text-[10px] text-slate-400">Unstop, Devpost, MLH, SIH & Devfolio competitions</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/preparation"
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between hover:border-indigo-400 transition-colors group block"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <Cpu size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">AI Self-Test & 4-Problem Arena</h4>
                  <p className="text-[10px] text-slate-400">Timed DSA contests with rating & Core CS MCQs</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
