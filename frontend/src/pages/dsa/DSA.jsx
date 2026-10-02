import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Code2,
  Cpu,
  Layers,
  Repeat,
  Binary,
  GitBranch,
  Network,
  Split,
  Maximize2,
  Compass,
  Zap,
  CheckCircle2
} from 'lucide-react';

export const DSA_PATTERNS = [
  {
    id: 'sliding-window',
    name: 'Sliding Window',
    desc: 'Solve problems involving contiguous subarrays or substrings with target constraints.',
    icon: <Maximize2 size={20} className="text-purple-600 dark:text-purple-400" />,
    badge: 'High Frequency',
    companies: ['Google', 'Amazon', 'Meta']
  },
  {
    id: 'two-pointers',
    name: 'Two Pointers',
    desc: 'Traverse sorted arrays or strings from opposite ends or at distinct speeds.',
    icon: <Split size={20} className="text-blue-600 dark:text-blue-400" />,
    badge: 'Essential',
    companies: ['Microsoft', 'Apple', 'Uber']
  },
  {
    id: 'fast-slow-pointers',
    name: 'Fast & Slow Pointers',
    desc: 'Detect cycles in linked lists, find middle nodes, and calculate happy numbers (Floyd\'s Cycle).',
    icon: <Repeat size={20} className="text-emerald-600 dark:text-emerald-400" />,
    badge: 'Linked Lists',
    companies: ['Amazon', 'Adobe']
  },
  {
    id: 'merge-intervals',
    name: 'Merge Intervals',
    desc: 'Handle overlapping ranges, schedule meetings, and insert disjoint intervals.',
    icon: <Layers size={20} className="text-amber-600 dark:text-amber-400" />,
    badge: 'Intervals',
    companies: ['Google', 'Bloomberg']
  },
  {
    id: 'cyclic-sort',
    name: 'Cyclic Sort',
    desc: 'Find missing, duplicate, or corrupted numbers in an array within range 1 to N in O(N) time.',
    icon: <Compass size={20} className="text-cyan-600 dark:text-cyan-400" />,
    badge: 'O(N) In-Place',
    companies: ['Microsoft', 'Amazon']
  },
  {
    id: 'in-place-reversal-linkedlist',
    name: 'In-place Reversal of LinkedList',
    desc: 'Reverse sub-lists, nodes in k-groups, and alternate k-element linked lists with O(1) space.',
    icon: <GitBranch size={20} className="text-pink-600 dark:text-pink-400" />,
    badge: 'Pointers',
    companies: ['Meta', 'Oracle']
  },
  {
    id: 'tree-bfs',
    name: 'Tree Breadth-First Search (BFS)',
    desc: 'Traverse trees level-by-level using queues, computing zigzag order, right view, and min depth.',
    icon: <Network size={20} className="text-emerald-500" />,
    badge: 'Level-Order',
    companies: ['Google', 'Meta', 'Amazon']
  },
  {
    id: 'tree-dfs',
    name: 'Tree Depth-First Search (DFS)',
    desc: 'Recursive root-to-leaf paths, maximum path sum, lowest common ancestor (LCA), and diameter.',
    icon: <GitBranch size={20} className="text-red-500" />,
    badge: 'Recursion',
    companies: ['Apple', 'Microsoft']
  },
  {
    id: 'two-heaps',
    name: 'Two Heaps',
    desc: 'Maintain dynamic running medians, sliding window medians, and maximize capital (Min-Heap + Max-Heap).',
    icon: <Binary size={20} className="text-amber-500" />,
    badge: 'Priority Queue',
    companies: ['Netflix', 'Google']
  },
  {
    id: 'subsets-backtracking',
    name: 'Subsets & Backtracking',
    desc: 'Generate power sets, permutations, letter combinations, sudoku solver, and N-Queens.',
    icon: <Cpu size={20} className="text-indigo-500" />,
    badge: 'Combinatorics',
    companies: ['Meta', 'Amazon', 'Uber']
  },
  {
    id: 'modified-binary-search',
    name: 'Modified Binary Search',
    desc: 'Search rotated sorted arrays, find peak elements, bitonic arrays, and search space range.',
    icon: <Zap size={20} className="text-blue-500" />,
    badge: 'O(log N)',
    companies: ['Google', 'Microsoft']
  },
  {
    id: 'top-k-elements',
    name: 'Top \'K\' Elements',
    desc: 'Solve Kth largest/smallest numbers, top K frequent words, and frequency sort using heaps.',
    icon: <Code2 size={20} className="text-teal-500" />,
    badge: 'Heaps',
    companies: ['Amazon', 'Salesforce']
  },
  {
    id: 'dynamic-programming',
    name: '0/1 Knapsack & Dynamic Programming',
    desc: 'Optimal substructure and memoization: Coin change, longest common subsequence, edit distance.',
    icon: <Sparkles size={20} className="text-purple-500" />,
    badge: 'High Frequency',
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft']
  },
  {
    id: 'topological-sort-graphs',
    name: 'Topological Sort & Graph Traversals',
    desc: 'Course schedule, alien dictionary, clone graphs, Dijkstra shortest path, and disjoint set union.',
    icon: <Network size={20} className="text-rose-500" />,
    badge: 'Graphs',
    companies: ['Uber', 'Google', 'Meta']
  }
];

export const DSA = () => {
  const [problems, setProblems] = useState([]);
  const [solvedCount, setSolvedCount] = useState(0);

  useEffect(() => {
    api.getProblems().then(list => {
      setProblems(list);
      setSolvedCount(list.filter(p => p.isSolved).length);
    }).catch(err => console.error('Failed to load problems:', err));
  }, []);

  const getPatternSolveStats = (patternName) => {
    const matched = problems.filter(p => p.topic.toLowerCase().includes(patternName.toLowerCase()) || patternName.toLowerCase().includes(p.topic.toLowerCase()));
    const solved = matched.filter(p => p.isSolved).length;
    return { solved, total: matched.length };
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
              <Sparkles size={12} />
              AI-Powered Pattern Problem Sets
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            DSA Problem Patterns Master
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Top tech companies test algorithmic pattern recognition, not memorized questions. Select any of the 14 core patterns below to generate and solve problem sets fetched by AI in your browser.
          </p>
        </div>

        <Link to="/dsa/problems">
          <Button variant="primary" icon={<Code2 size={16} />}>
            Browse All Problem Sets
          </Button>
        </Link>
      </div>

      {/* Overview Banner */}
      <Card className="bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 text-white border-none shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider font-bold text-purple-200">14 Essential Algorithmic Archetypes</span>
            <h3 className="text-2xl font-bold">
              Dynamic AI Problem Generation Enabled
            </h3>
            <p className="text-purple-100 text-xs max-w-xl">
              Each pattern card contains interview-grade questions. If you need fresh questions, the browser triggers Gemini to generate tailored edge cases, examples, and test templates.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md shrink-0">
            <div>
              <span className="text-3xl font-extrabold text-white">{solvedCount}</span>
              <span className="block text-[10px] text-purple-200 uppercase font-semibold">Problems Solved</span>
            </div>
            <div className="h-10 w-px bg-white/20"></div>
            <div>
              <span className="text-3xl font-extrabold text-white">14</span>
              <span className="block text-[10px] text-purple-200 uppercase font-semibold">Total Patterns</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Patterns Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {DSA_PATTERNS.map((pattern) => {
          const stats = getPatternSolveStats(pattern.name);
          return (
            <Card
              hoverEffect
              key={pattern.id}
              className="flex flex-col justify-between border border-slate-200/80 dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                    {pattern.icon}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                    {pattern.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                  {pattern.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                  {pattern.desc}
                </p>

                {/* Company chips */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {pattern.companies.map(c => (
                    <span
                      key={c}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  {stats.solved > 0 ? `${stats.solved} Solved` : 'Ready to Solve'}
                </span>
                <Link to={`/dsa/problems?pattern=${encodeURIComponent(pattern.name)}`}>
                  <Button
                    size="sm"
                    variant="primary"
                    icon={<ArrowRight size={14} />}
                  >
                    Solve Pattern
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

    </div>
  );
};

export default DSA;
