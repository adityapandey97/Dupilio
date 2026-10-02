import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import {
  Code2,
  Bookmark,
  CheckCircle2,
  Circle,
  ExternalLink,
  PlusCircle,
  Search,
  Filter,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

export const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState('');
  const [activeProblem, setActiveProblem] = useState(null);

  const topics = [
    'All',
    'Array',
    'String',
    'Linked List',
    'Stack',
    'Queue',
    'Tree',
    'Graph',
    'DP',
    'Greedy',
    'Binary Search',
    'Two Pointers',
    'Sliding Window'
  ];

  const loadProblems = async () => {
    try {
      setLoading(true);
      const data = await api.getProblems({
        topic: selectedTopic === 'All' ? undefined : selectedTopic,
        difficulty: selectedDifficulty === 'All' ? undefined : selectedDifficulty,
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        search: searchQuery
      });
      setProblems(data || []);
    } catch (err) {
      console.error('Failed to load problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, [selectedTopic, selectedDifficulty, selectedStatus]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadProblems();
  };

  const handleToggleSolve = async (problemId, currentState) => {
    try {
      const nextState = !currentState;
      await api.toggleProblemSolve(problemId, nextState);
      setProblems(prev =>
        prev.map(p => (p.id === problemId ? { ...p, isSolved: nextState } : p))
      );
      setActionNotice(nextState ? 'Problem marked as solved!' : 'Problem marked as unsolved.');
      setTimeout(() => setActionNotice(''), 3000);
    } catch (e) {
      alert(`Failed to update problem: ${e.message}`);
    }
  };

  const handleToggleBookmark = async (problemId, currentBookmark) => {
    try {
      await api.toggleProblemBookmark(problemId);
      setProblems(prev =>
        prev.map(p => (p.id === problemId ? { ...p, isBookmarked: !currentBookmark } : p))
      );
      setActionNotice(!currentBookmark ? 'Bookmarked for revision!' : 'Removed from bookmarks.');
      setTimeout(() => setActionNotice(''), 3000);
    } catch (e) {
      alert(`Failed to update bookmark: ${e.message}`);
    }
  };

  const handleAddToTodo = async (problemId) => {
    try {
      const res = await api.addProblemToTodo(problemId);
      setActionNotice(`✅ Added to your Todo Planner!`);
      setProblems(prev =>
        prev.map(p => (p.id === problemId ? { ...p, addedToTodo: true } : p))
      );
      setTimeout(() => setActionNotice(''), 3000);
    } catch (e) {
      alert(`Failed to add to Todo: ${e.message}`);
    }
  };

  const difficultyColors = {
    Easy: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60',
    Medium: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60',
    Hard: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60'
  };

  return (
    <div className="space-y-8 animate-fade-in text-left pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Code2 size={28} className="text-indigo-600" />
            Problem Hub & Algorithmic Practice
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Curated problems across essential placement patterns with bookmarking and personal planner integration.
          </p>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          {actionNotice}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="space-y-3.5 border-b border-slate-200 dark:border-slate-800 pb-5">
        
        {/* Topic Horizontal Scrollable Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
          {topics.map(t => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedTopic === t
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Secondary Filters & Search Input */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Status</option>
              <option value="solved">Solved</option>
              <option value="unsolved">Unsolved</option>
              <option value="bookmarked">Bookmarked</option>
            </select>
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-1.5">
            <Input
              placeholder="Search problem title or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs h-9 w-48 sm:w-64"
            />
            <Button type="submit" className="text-xs px-3 h-9 bg-slate-800 text-white">
              <Search size={14} />
            </Button>
          </form>
        </div>
      </div>

      {/* Problems Table / List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">Loading problem catalog...</div>
      ) : problems.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-slate-300 dark:border-slate-800">
          <Code2 size={36} className="mx-auto text-slate-400 mb-2 opacity-50" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No problems found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting topic, difficulty, or search filters.</p>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-xs">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200/80 bg-slate-50/75 dark:border-slate-800/80 dark:bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Status</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Topic</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {problems.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggleSolve(p.id, p.isSolved)}
                      className="cursor-pointer transition-transform hover:scale-110"
                      title={p.isSolved ? 'Mark as Unsolved' : 'Mark as Solved'}
                    >
                      {p.isSolved ? (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      ) : (
                        <Circle size={18} className="text-slate-300 dark:text-slate-600" />
                      )}
                    </button>
                  </td>

                  <td className="py-3 px-4">
                    <button
                      onClick={() => setActiveProblem(p)}
                      className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left"
                    >
                      {p.title}
                    </button>
                    {p.companyTags && p.companyTags.length > 0 && (
                      <span className="block text-[11px] text-slate-400 mt-0.5">
                        Asked in: {p.companyTags.slice(0, 3).join(', ')}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {p.topic}
                  </td>

                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${difficultyColors[p.difficulty] || 'bg-slate-100 text-slate-700'}`}>
                      {p.difficulty}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-xs font-mono text-slate-500">
                    {p.platform || 'LeetCode'}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleToggleBookmark(p.id, p.isBookmarked)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${p.isBookmarked ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        title={p.isBookmarked ? 'Remove Bookmark' : 'Bookmark Problem'}
                      >
                        <Bookmark size={15} className={p.isBookmarked ? 'fill-current' : ''} />
                      </button>

                      <button
                        onClick={() => handleAddToTodo(p.id)}
                        disabled={p.addedToTodo}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${p.addedToTodo ? 'text-emerald-500' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        title="Add to Todo Planner"
                      >
                        <PlusCircle size={15} />
                      </button>

                      <a
                        href={p.externalUrl || `https://leetcode.com/problemset/all/?search=${encodeURIComponent(p.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Open Original Problem Link"
                      >
                        <ExternalLink size={15} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Problem Quick View Modal */}
      {activeProblem && (
        <Modal
          isOpen={!!activeProblem}
          onClose={() => setActiveProblem(null)}
          title={`${activeProblem.title} (${activeProblem.difficulty})`}
        >
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${difficultyColors[activeProblem.difficulty]}`}>
                {activeProblem.difficulty}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Topic: {activeProblem.topic}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {activeProblem.description}
            </div>

            {activeProblem.constraints && activeProblem.constraints.length > 0 && (
              <div className="text-xs text-slate-500">
                <strong className="text-slate-700 dark:text-slate-300 block mb-1">Constraints:</strong>
                <ul className="list-disc pl-4 space-y-0.5 font-mono">
                  {activeProblem.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <a
                href={activeProblem.externalUrl || `https://leetcode.com/problemset/all/?search=${encodeURIComponent(activeProblem.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                Solve on {activeProblem.platform || 'LeetCode'} <ExternalLink size={12} />
              </a>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    handleToggleSolve(activeProblem.id, activeProblem.isSolved);
                    setActiveProblem(null);
                  }}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {activeProblem.isSolved ? 'Mark as Unsolved' : 'Mark Solved'}
                </Button>
                <Button onClick={() => setActiveProblem(null)} variant="outline" className="text-xs">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default Problems;
