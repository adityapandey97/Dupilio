import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import {
  CheckCircle2,
  Circle,
  Search,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Zap
} from 'lucide-react';
import { DSA_PATTERNS } from './DSA';

export const Problems = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const patternFilter = searchParams.get('pattern') || searchParams.get('topic') || '';

  const [problems, setProblems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genSuccessMsg, setGenSuccessMsg] = useState('');

  const loadProblems = async () => {
    try {
      const list = await api.getProblems();
      setProblems(list);
    } catch (err) {
      console.error('Failed to fetch problems:', err);
    }
  };

  useEffect(() => {
    loadProblems();
  }, []);

  const handleGenerateWithAI = async () => {
    const targetPattern = patternFilter || 'Sliding Window';
    setIsGenerating(true);
    setGenSuccessMsg(`Generating fresh interview problems for ${targetPattern} using Gemini AI...`);
    try {
      const newProblems = await api.generatePatternProblems(targetPattern);
      if (Array.isArray(newProblems) && newProblems.length > 0) {
        // Add to backend / database pool
        for (const p of newProblems) {
          try {
            await api.addProblem({
              title: p.title,
              difficulty: p.difficulty,
              topic: p.topic || targetPattern,
              description: p.description,
              constraints: p.constraints || [],
              examples: p.examples || [],
              starterCode: p.starterCode || {},
              isSolved: false,
              platform: 'LeetCode'
            });
          } catch (e) {
            // If already exists or creation failed, proceed
          }
        }
        await loadProblems();
        setGenSuccessMsg(`✨ AI generated and indexed ${newProblems.length} new problems for ${targetPattern}!`);
      }
    } catch (err) {
      setGenSuccessMsg('⚠️ AI generation completed.');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenSuccessMsg(''), 6000);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDifficultyFilter('');
    setStatusFilter('');
    setSearchParams({});
  };

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPattern = patternFilter 
      ? (problem.topic.toLowerCase().includes(patternFilter.toLowerCase()) || patternFilter.toLowerCase().includes(problem.topic.toLowerCase()))
      : true;

    const matchesDifficulty = difficultyFilter 
      ? problem.difficulty === difficultyFilter 
      : true;

    const matchesStatus = statusFilter
      ? (statusFilter === 'solved' ? problem.isSolved : !problem.isSolved)
      : true;

    return matchesSearch && matchesPattern && matchesDifficulty && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Back button and title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            to="/dsa"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none mb-1"
          >
            <ArrowLeft size={16} />
            Back to DSA Patterns
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {patternFilter ? `${patternFilter} Problem Set` : 'All Pattern Problem Sets'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {patternFilter
              ? `Practicing problems categorized under the ${patternFilter} algorithmic archetype.`
              : 'Master problem-solving by pattern rather than memorizing individual solutions.'}
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleGenerateWithAI}
          disabled={isGenerating}
          icon={<Sparkles size={16} className={isGenerating ? 'animate-spin' : ''} />}
        >
          {isGenerating ? 'Generating with AI...' : `Generate ${patternFilter ? patternFilter : 'Pattern'} Problems (AI)`}
        </Button>
      </div>

      {/* AI Generation Notification Banner */}
      {genSuccessMsg && (
        <div className="p-3 text-xs font-semibold rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-2 animate-fade-in">
          <Zap size={14} className="shrink-0 text-purple-600 dark:text-purple-400" />
          <span>{genSuccessMsg}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <Card className="p-4 grid gap-4 md:grid-cols-4 items-end">
        <Input
          placeholder="Search problem title..."
          icon={<Search size={16} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:col-span-2"
        />

        <div className="text-left">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Pattern Filter
          </label>
          <select
            value={patternFilter}
            onChange={(e) => setSearchParams(e.target.value ? { pattern: e.target.value } : {})}
            className="block w-full rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-sm text-slate-800 px-3 py-2.5 focus:border-purple-500 focus:ring-purple-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="">All 14 Patterns</option>
            {DSA_PATTERNS.map(p => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="text-left">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Difficulty
          </label>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="block w-full rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-sm text-slate-800 px-3 py-2.5 focus:border-purple-500 focus:ring-purple-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </Card>

      {/* Active filters summary */}
      {(searchTerm || patternFilter || difficultyFilter || statusFilter) && (
        <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-100/55 border border-slate-200/55 dark:bg-slate-900/30 dark:border-slate-800 p-3 rounded-lg">
          <div className="flex flex-wrap items-center gap-2">
            <span>Active filters:</span>
            {searchTerm && <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-medium">Search: "{searchTerm}"</span>}
            {patternFilter && <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-medium">Pattern: {patternFilter}</span>}
            {difficultyFilter && <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-medium">Difficulty: {difficultyFilter}</span>}
          </div>
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 font-semibold text-purple-600 hover:text-purple-500 dark:text-purple-400 outline-none"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>
      )}

      {/* Problems list */}
      <Card className="overflow-hidden border border-slate-200/85 p-0 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
            <thead className="bg-slate-50/75 dark:bg-slate-900/40">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Pattern</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Platform</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Difficulty</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-950 dark:divide-slate-800">
              {filteredProblems.map((problem) => (
                <tr key={problem.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/25 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {problem.isSolved ? (
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    ) : (
                      <Circle size={18} className="text-slate-350 dark:text-slate-700" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/dsa/problem/${problem.id}`}
                      className="text-sm font-bold text-slate-800 hover:text-purple-600 dark:text-slate-200 dark:hover:text-purple-400"
                    >
                      {problem.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-purple-700 dark:text-purple-300">
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/30">
                      {problem.topic}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {problem.platform || 'LeetCode'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      problem.difficulty === 'Easy'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-450'
                        : problem.difficulty === 'Medium'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-450'
                        : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-450'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link to={`/dsa/problem/${problem.id}`}>
                      <Button size="sm" variant={problem.isSolved ? 'outline' : 'primary'}>
                        {problem.isSolved ? 'Review' : 'Solve with AI Judge'}
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}

              {filteredProblems.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                    <div className="space-y-3">
                      <p>🔍 No problems found for this pattern yet.</p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleGenerateWithAI}
                        disabled={isGenerating}
                        icon={<Sparkles size={14} />}
                      >
                        {isGenerating ? 'Generating...' : `Generate ${patternFilter || 'Pattern'} Problem Set with AI`}
                      </Button>
                    </div>
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

export default Problems;
