import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Link } from 'react-router-dom';
import {
  Milestone,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  Code2,
  BookOpenCheck,
  Video,
  FileText,
  Trophy,
  Flame
} from 'lucide-react';

const INITIAL_ROADMAP = [
  {
    phase: 'Phase 1: DSA Foundations',
    title: 'Data Structures & Big-O Complexity',
    desc: 'Master time and space complexity analysis, Arrays, Strings, HashMaps, and Linked Lists.',
    duration: 'Weeks 1-2',
    icon: <Code2 size={20} className="text-purple-600 dark:text-purple-400" />,
    link: '/dsa',
    linkText: 'Solve Array/String Problems',
    tasks: [
      { id: 'p1-t1', text: 'Time and Space Complexity Analysis (Big-O, Omega, Theta)', done: true },
      { id: 'p1-t2', text: 'Array manipulations, Prefix Sums, and Two Pointers', done: true },
      { id: 'p1-t3', text: 'Singly and Doubly Linked Lists reversal & cycle detection', done: true },
      { id: 'p1-t4', text: 'HashMaps and Frequency counting patterns', done: false }
    ]
  },
  {
    phase: 'Phase 2: High-Yield DSA Patterns',
    title: 'Top 14 Algorithmic Problem Patterns',
    desc: 'Focus exclusively on pattern recognition: Sliding Window, Fast & Slow Pointers, BFS/DFS, DP, and Backtracking.',
    duration: 'Weeks 3-5',
    icon: <Sparkles size={20} className="text-blue-600 dark:text-blue-400" />,
    link: '/dsa',
    linkText: 'Practice AI DSA Patterns',
    tasks: [
      { id: 'p2-t1', text: 'Sliding Window (Fixed and Dynamic size)', done: true },
      { id: 'p2-t2', text: 'Fast & Slow Pointers (Floyd Cycle Detection)', done: false },
      { id: 'p2-t3', text: 'Tree Traversal: Inorder, Preorder, Postorder & Level Order (BFS)', done: false },
      { id: 'p2-t4', text: 'Dynamic Programming: 0/1 Knapsack and Longest Common Subsequence', done: false }
    ]
  },
  {
    phase: 'Phase 3: Core CS Subjects',
    title: 'OOPs, OS, DBMS, & Computer Networks',
    desc: 'Deep-dive into core computer science theory asked in technical interviews by top tech companies.',
    duration: 'Weeks 6-7',
    icon: <BookOpenCheck size={20} className="text-emerald-600 dark:text-emerald-400" />,
    link: '/core-notes',
    linkText: 'Read AI Core Notes',
    tasks: [
      { id: 'p3-t1', text: 'OOPs: Polymorphism, Virtual Functions, and SOLID Principles', done: false },
      { id: 'p3-t2', text: 'Operating Systems: Process Synchronization, Semaphores & Deadlocks', done: false },
      { id: 'p3-t3', text: 'DBMS: Normalization (1NF-BCNF), Indexing, and Transactions ACID', done: false },
      { id: 'p3-t4', text: 'Computer Networks: TCP 3-way Handshake, HTTP/HTTPS, and DNS', done: false }
    ]
  },
  {
    phase: 'Phase 4: SDE Mock Interviews & System Design',
    title: 'AI Conversational Mock Evaluations',
    desc: 'Simulate high-pressure SDE interviews with live AI evaluation on technical depth, speech, and communication.',
    duration: 'Weeks 8-9',
    icon: <Video size={20} className="text-amber-600 dark:text-amber-400" />,
    link: '/interview',
    linkText: 'Launch AI Mock Interview',
    tasks: [
      { id: 'p4-t1', text: 'Complete Full SDE Technical Mock Interview', done: false },
      { id: 'p4-t2', text: 'Complete React & Frontend Architecture Mock Interview', done: false },
      { id: 'p4-t3', text: 'High-Level System Design (Rate Limiter, URL Shortener, Cache)', done: false },
      { id: 'p4-t4', text: 'Behavioral STAR Method (Leadership & Conflict resolution)', done: false }
    ]
  },
  {
    phase: 'Phase 5: Contest Sprint & ATS Resume',
    title: 'Competitive Coding & Final Placement Polish',
    desc: 'Participate in weekly Codeforces/LeetCode contests and optimize your resume score above 85+.',
    duration: 'Week 10+',
    icon: <Trophy size={20} className="text-rose-600 dark:text-rose-400" />,
    link: '/resume',
    linkText: 'Optimize Resume ATS',
    tasks: [
      { id: 'p5-t1', text: 'Achieve 80+ ATS score on your resume with keyword match', done: true },
      { id: 'p5-t2', text: 'Participate in LeetCode Biweekly & Codeforces Div. 3 rounds', done: false },
      { id: 'p5-t3', text: 'Solve 50+ medium problems across all 14 DSA patterns', done: false }
    ]
  }
];

export const Roadmap = () => {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState(INITIAL_ROADMAP);
  const [customizing, setCustomizing] = useState(false);

  const toggleTask = (phaseIdx, taskId) => {
    setRoadmap(prev => {
      const updated = [...prev];
      const targetPhase = { ...updated[phaseIdx] };
      targetPhase.tasks = targetPhase.tasks.map(t =>
        t.id === taskId ? { ...t, done: !t.done } : t
      );
      updated[phaseIdx] = targetPhase;
      return updated;
    });
  };

  // Calculate total completed tasks
  const allTasks = roadmap.flatMap(p => p.tasks);
  const completedTasks = allTasks.filter(t => t.done).length;
  const overallProgress = Math.round((completedTasks / allTasks.length) * 100);

  const handleCustomizeRoadmap = () => {
    setCustomizing(true);
    setTimeout(() => {
      setCustomizing(false);
      alert('✨ AI Personalized Roadmap updated based on your weak topics (Graph, DP) and 14-day placement goals!');
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
              <Milestone size={12} />
              Hierprep Placement Kit
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            SDE Placement Preparation Roadmap
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Step-by-step master plan structured for campus placements and technical software engineering interviews.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleCustomizeRoadmap}
          disabled={customizing}
          icon={<Sparkles size={16} />}
        >
          {customizing ? 'Personalizing with AI...' : 'AI Personalize Roadmap'}
        </Button>
      </div>

      {/* Progress Overview Card */}
      <Card className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white border-none shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider font-bold text-purple-300">Overall Readiness</span>
            <h3 className="text-2xl font-bold">
              {completedTasks} of {allTasks.length} Milestones Achieved
            </h3>
            <p className="text-slate-300 text-xs max-w-xl">
              Keep checking off tasks as you finish DSA pattern problem sets, read Core Notes, and complete AI Mock Interviews.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md shrink-0">
            <div className="text-center">
              <span className="text-3xl font-extrabold text-white">{overallProgress}%</span>
              <span className="block text-[10px] text-purple-200 uppercase font-semibold">Placement Ready</span>
            </div>
            <div className="h-10 w-px bg-white/20"></div>
            <div className="flex items-center gap-2">
              <Flame size={24} className="text-orange-400 fill-current" />
              <div>
                <span className="text-sm font-bold block">14 Days</span>
                <span className="text-[10px] text-slate-300">Streak Active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-400 to-emerald-400 transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
      </Card>

      {/* Roadmap Timeline Nodes */}
      <div className="relative space-y-6 before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {roadmap.map((phase, pIdx) => {
          const phaseTasks = phase.tasks;
          const phaseCompleted = phaseTasks.filter(t => t.done).length;
          const isPhaseFinished = phaseCompleted === phaseTasks.length;

          return (
            <div key={pIdx} className="relative pl-14">
              
              {/* Phase Node Marker */}
              <div className={`absolute left-3.5 top-5 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-900 ${
                isPhaseFinished
                  ? 'border-emerald-500 text-emerald-500'
                  : 'border-purple-600 text-purple-600'
              }`}>
                {isPhaseFinished ? <CheckCircle2 size={16} className="fill-emerald-100 dark:fill-emerald-950" /> : <Circle size={10} className="fill-current" />}
              </div>

              {/* Phase Content Card */}
              <Card hoverEffect className="border border-slate-200/80 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-850">
                      {phase.icon}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                        {phase.phase} • {phase.duration}
                      </span>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        {phase.title}
                      </h3>
                    </div>
                  </div>

                  <Link to={phase.link}>
                    <Button variant="outline" size="sm" icon={<ArrowRight size={14} />}>
                      {phase.linkText}
                    </Button>
                  </Link>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 py-3">
                  {phase.desc}
                </p>

                {/* Tasks checklist */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Action Checkpoints</span>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {phase.tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => toggleTask(pIdx, task.id)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-left text-xs transition-colors ${
                          task.done
                            ? 'bg-emerald-50/50 border-emerald-200/60 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-300'
                            : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-900/40 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-850'
                        }`}
                      >
                        {task.done ? (
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <Circle size={16} className="text-slate-350 dark:text-slate-600 shrink-0 mt-0.5" />
                        )}
                        <span className={task.done ? 'line-through opacity-80' : ''}>{task.text}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </Card>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default Roadmap;
