import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Input from '../../components/common/Input';
import { Search, Trophy, Flame, Video, Award, Code2 } from 'lucide-react';

export const Leaderboard = () => {
  const [rankings, setRankings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.getLeaderboard().then(setRankings).catch(err => console.error('Failed to load leaderboard:', err));
  }, []);

  const filteredRankings = rankings.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate top 3
  const topThree = rankings.slice(0, 3);
  const others = filteredRankings.filter(user => user.rank > 3);

  // Styling helper for podium
  const podiumStyles = [
    {
      bg: 'bg-gradient-to-b from-amber-500/10 to-amber-500/0 border-amber-300 dark:border-amber-700/60',
      text: 'text-amber-500',
      badge: 'bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 text-amber-800',
      crown: '👑',
      height: 'h-48 md:h-52'
    },
    {
      bg: 'bg-gradient-to-b from-slate-400/10 to-slate-400/0 border-slate-300 dark:border-slate-700/60',
      text: 'text-slate-400',
      badge: 'bg-slate-100 dark:bg-slate-900/60 dark:text-slate-300 text-slate-800',
      crown: '🥈',
      height: 'h-44 md:h-48'
    },
    {
      bg: 'bg-gradient-to-b from-amber-700/10 to-amber-700/0 border-amber-800/40 dark:border-amber-900/40',
      text: 'text-amber-750',
      badge: 'bg-amber-50 dark:bg-amber-950/20 dark:text-amber-450 text-amber-850',
      crown: '🥉',
      height: 'h-40 md:h-44'
    }
  ];

  // Order podium as 2nd, 1st, 3rd for standard visual display
  const orderedPodium = [];
  if (topThree[1]) orderedPodium.push({ ...topThree[1], style: podiumStyles[1] });
  if (topThree[0]) orderedPodium.push({ ...topThree[0], style: podiumStyles[0] });
  if (topThree[2]) orderedPodium.push({ ...topThree[2], style: podiumStyles[2] });

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Leaderboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Compete with fellow SDE candidates. Rankings update in real-time as problems are solved.
        </p>
      </div>

      {/* Podium Grid */}
      {rankings.length >= 3 && (
        <div className="grid gap-4 grid-cols-3 items-end max-w-3xl mx-auto pt-6 text-center">
          {orderedPodium.map((candidate) => (
            <div
              key={candidate.name}
              className={`flex flex-col items-center justify-end rounded-2xl border p-4 ${candidate.style.bg} ${candidate.style.height} relative shadow-xs`}
            >
              {/* Crown / Trophy indicator */}
              <span className="text-2xl mb-1.5">{candidate.style.crown}</span>

              {/* Avatar circle */}
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-base font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300 shadow-md">
                {candidate.name.split(' ').map(n => n[0]).join('')}
              </div>

              {/* Name */}
              <h4 className="mt-2 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 truncate w-full px-1">
                {candidate.name}
              </h4>

              {/* Score */}
              <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${candidate.style.badge}`}>
                <Code2 size={10} />
                {candidate.solvedCount} Solved
              </div>

              {/* Streak */}
              <div className="mt-1 flex items-center justify-center gap-0.5 text-[10px] text-slate-400 font-medium">
                <Flame size={10} className="fill-orange-500 text-orange-500" />
                <span>{candidate.streak}d streak</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search Filter */}
      <div className="max-w-md">
        <Input
          placeholder="Search candidates by name..."
          icon={<Search size={16} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Rankings List Table */}
      <Card className="overflow-hidden border border-slate-200/85 p-0 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
            <thead className="bg-slate-50/75 dark:bg-slate-900/40">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Candidate</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Solved Problems</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Interviews</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Score</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Streak</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-950 dark:divide-slate-800">
              {filteredRankings.map((user) => (
                <tr
                  key={user.name}
                  className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/25 transition-colors ${
                    user.rank <= 3 ? 'bg-purple-50/5 dark:bg-purple-950/5' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold font-mono ${
                        user.rank === 1 ? 'text-amber-500' :
                        user.rank === 2 ? 'text-slate-400' :
                        user.rank === 3 ? 'text-amber-700 dark:text-amber-600' :
                        'text-slate-450'
                      }`}>
                        #{user.rank}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-750 dark:bg-purple-950/75 dark:text-purple-300">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-bold text-slate-850 dark:text-slate-200">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300 font-semibold">
                    {user.solvedCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-455">
                    <span className="inline-flex items-center gap-1">
                      <Video size={12} className="text-slate-450" />
                      {user.interviewsCount} sessions
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-mono font-bold ${
                      user.score >= 85 ? 'text-emerald-600' :
                      user.score >= 70 ? 'text-amber-600' :
                      'text-red-500'
                    }`}>
                      {user.score}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400 font-bold px-2 py-0.5 rounded-full">
                      <Flame size={12} className="fill-current" />
                      {user.streak} days
                    </span>
                  </td>
                </tr>
              ))}

              {filteredRankings.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                    🔍 No candidates match "{searchTerm}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Leaderboard;
