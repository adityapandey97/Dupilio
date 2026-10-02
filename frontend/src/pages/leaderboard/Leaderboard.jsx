import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import {
  Trophy,
  Globe,
  Building,
  BookOpen,
  GraduationCap,
  Search,
  Flame,
  Star,
  Award,
  TrendingUp,
  User,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const Leaderboard = () => {
  const { user } = useAuth();
  const [scope, setScope] = useState('global'); // global, college, department, batch
  const [search, setSearch] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await api.getLeaderboard({ scope, search });
      setLeaderboard(data || []);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [scope]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLeaderboard();
  };

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  const scopeTabs = [
    { id: 'global', label: 'Global', icon: <Globe size={16} /> },
    { id: 'college', label: user?.college ? user.college : 'College', icon: <Building size={16} /> },
    { id: 'department', label: user?.department ? user.department : 'Department', icon: <BookOpen size={16} /> },
    { id: 'batch', label: user?.batch ? `Batch ${user.batch}` : 'Batch', icon: <GraduationCap size={16} /> }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-600 text-white shadow-md shadow-amber-500/20">
              <Trophy size={24} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Developer Leaderboard
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
            Rankings calculated automatically using the transparent 6-dimension Dupilio Developer Score.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span>Scores recalibrated continuously across platforms</span>
        </div>
      </div>

      {/* Scope Selector Bar & Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {scopeTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setScope(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                  scope === tab.id
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-md shadow-amber-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search coder or college..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 w-56"
              />
            </div>
            <Button type="submit" variant="outline" className="text-xs py-1.5 px-3">
              Filter
            </Button>
          </form>
        </div>
      </Card>

      {/* Top 3 Podium (if at least 3 candidates) */}
      {!loading && topThree.length >= 3 && !search && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {/* Rank 2 (Silver) */}
          <div className="order-2 md:order-1 flex flex-col justify-end">
            <Card className="p-5 border-slate-300 dark:border-slate-700 bg-gradient-to-b from-slate-100/60 to-white dark:from-slate-800/40 dark:to-slate-900 text-center relative overflow-hidden shadow-sm">
              <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                #2 Silver
              </div>
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-800 flex items-center justify-center font-black text-xl shadow-md mb-3">
                {topThree[1].name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {topThree[1].name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {topThree[1].college}
              </p>
              <div className="mt-3 inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-black text-sm">
                Score: {topThree[1].score}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                <div>
                  <p className="text-slate-400 font-medium">Solved</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{topThree[1].problemsSolved}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Rating</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{topThree[1].rating}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Streak</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{topThree[1].streak}d</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Rank 1 (Gold) */}
          <div className="order-1 md:order-2 flex flex-col justify-end">
            <Card className="p-6 border-amber-300 dark:border-amber-700/80 bg-gradient-to-b from-amber-100/40 via-amber-50/20 to-white dark:from-amber-950/30 dark:to-slate-900 text-center relative overflow-hidden shadow-lg shadow-amber-500/10 scale-105 z-10">
              <div className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-xs">
                👑 #1 Gold
              </div>
              <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/30 mb-3 ring-4 ring-amber-400/30">
                {topThree[0].name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <h3 className="font-black text-slate-900 dark:text-white text-lg">
                {topThree[0].name}
              </h3>
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mt-0.5">
                {topThree[0].college}
              </p>
              <div className="mt-3 inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black text-base shadow-sm">
                Score: {topThree[0].score}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-amber-200 dark:border-amber-900/50 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Solved</p>
                  <p className="font-extrabold text-slate-900 dark:text-white">{topThree[0].problemsSolved}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Rating</p>
                  <p className="font-extrabold text-slate-900 dark:text-white">{topThree[0].rating}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Streak</p>
                  <p className="font-extrabold text-slate-900 dark:text-white">{topThree[0].streak}d</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="order-3 md:order-3 flex flex-col justify-end">
            <Card className="p-5 border-amber-700/30 dark:border-amber-900/40 bg-gradient-to-b from-amber-900/5 to-white dark:from-amber-950/20 dark:to-slate-900 text-center relative overflow-hidden shadow-sm">
              <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-800/20 text-amber-900 dark:text-amber-300">
                #3 Bronze
              </div>
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-500 text-amber-100 flex items-center justify-center font-black text-xl shadow-md mb-3">
                {topThree[2].name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {topThree[2].name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {topThree[2].college}
              </p>
              <div className="mt-3 inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-black text-sm">
                Score: {topThree[2].score}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                <div>
                  <p className="text-slate-400 font-medium">Solved</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{topThree[2].problemsSolved}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Rating</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{topThree[2].rating}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Streak</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{topThree[2].streak}d</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Main Leaderboard Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500"></div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading rankings...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-16 text-center">
            <Trophy size={36} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No ranked developers found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Try adjusting your search criteria or switch to Global scope.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 w-14 text-center">Rank</th>
                  <th className="py-3 px-4">Developer</th>
                  <th className="py-3 px-4">Academic Base</th>
                  <th className="py-3 px-4 text-center">Dupilio Score</th>
                  <th className="py-3 px-4 text-center">Solved</th>
                  <th className="py-3 px-4 text-center">Top Rating</th>
                  <th className="py-3 px-4 text-center">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                {leaderboard.map((coder) => {
                  const isCurrent = coder.isCurrentUser;
                  const rankBadge =
                    coder.rank === 1 ? 'bg-amber-400 text-amber-950 font-black' :
                    coder.rank === 2 ? 'bg-slate-300 text-slate-800 font-black' :
                    coder.rank === 3 ? 'bg-amber-700 text-white font-black' :
                    'text-slate-500 dark:text-slate-400 font-bold';

                  return (
                    <tr
                      key={coder.id || coder.name}
                      className={`transition-colors duration-150 ${
                        isCurrent
                          ? 'bg-amber-50/60 dark:bg-amber-950/20 font-semibold'
                          : 'hover:bg-slate-50/60 dark:hover:bg-slate-900/40'
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs ${rankBadge}`}>
                          {coder.rank}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs">
                            {coder.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {coder.name}
                              </span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded-sm text-[9px] font-bold bg-amber-500 text-white uppercase tracking-wider">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {coder.department} • Batch {coder.batch}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {coder.college}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-yellow-500/15 text-amber-700 dark:text-amber-300 border border-amber-300/40 dark:border-amber-700/40 font-black text-xs">
                          {coder.score} / 100
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                        {coder.problemsSolved}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-indigo-600 dark:text-indigo-400">
                        {coder.rating}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-orange-500 font-bold">
                          <Flame size={13} />
                          {coder.streak}d
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-3.5 bg-slate-50/70 dark:bg-slate-900/50 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Privacy note: You can adjust your leaderboard visibility anytime in Settings.</span>
          <span className="font-semibold">Showing top {leaderboard.length} candidates</span>
        </div>
      </Card>
    </div>
  );
};

export default Leaderboard;
