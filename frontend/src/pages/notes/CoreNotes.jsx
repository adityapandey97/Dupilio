import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import {
  BookOpen,
  Sparkles,
  Layers,
  Database,
  Cpu,
  Globe,
  HelpCircle,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  Brain,
  Award,
  Zap,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const SUBJECTS = [
  {
    id: 'dsa',
    name: 'DSA & Algorithmic Patterns',
    icon: <Brain size={18} className="text-purple-500" />,
    topics: [
      'Dynamic Programming (1D & 2D)',
      'Graph Shortest Path & Dijkstra',
      'Monotonic Stack & Sliding Window',
      'Trees, BST & Lowest Common Ancestor',
      'Topological Sort & Kahn BFS',
      'Trie & Prefix Matching',
      'Backtracking & State Space Trees'
    ]
  },
  {
    id: 'system_design',
    name: 'System Design & High-Scale Architecture',
    icon: <Cpu size={18} className="text-indigo-500" />,
    topics: [
      'Rate Limiting (Token Bucket & Leaky Bucket)',
      'Distributed Caching & Redis Eviction',
      'Consistent Hashing & Virtual Nodes',
      'Message Queues & Kafka Event Streams',
      'Database Sharding & Replication',
      'API Gateway & Load Balancing Algorithms'
    ]
  },
  {
    id: 'oops',
    name: 'Object-Oriented Programming (OOPs)',
    icon: <Layers size={18} className="text-blue-500" />,
    topics: [
      'Classes & Objects',
      'Encapsulation & Abstraction',
      'Inheritance & Diamond Problem',
      'Polymorphism (Compile vs Runtime)',
      'Virtual Functions & VTables',
      'SOLID Design Principles'
    ]
  },
  {
    id: 'os',
    name: 'Operating Systems (OS)',
    icon: <Cpu size={18} className="text-blue-500" />,
    topics: [
      'Processes vs Threads',
      'CPU Scheduling Algorithms',
      'Deadlocks & Banker Algorithm',
      'Virtual Memory & Paging',
      'Process Synchronization & Semaphores',
      'Page Replacement Algorithms (LRU)'
    ]
  },
  {
    id: 'dbms',
    name: 'Database Management Systems (DBMS)',
    icon: <Database size={18} className="text-emerald-500" />,
    topics: [
      'ACID Properties & Transactions',
      'Database Normalization (1NF to BCNF)',
      'Indexing & B/B+ Trees',
      'SQL Joins & Complex Queries',
      'Concurrency Control & Locking',
      'NoSQL vs Relational Databases'
    ]
  },
  {
    id: 'cn',
    name: 'Computer Networks (CN)',
    icon: <Globe size={18} className="text-cyan-500" />,
    topics: [
      'OSI vs TCP/IP Models',
      'TCP 3-Way Handshake & Teardown',
      'HTTP vs HTTPS & SSL/TLS',
      'DNS Resolution Process',
      'IP Addressing & Subnetting',
      'WebSockets vs Long Polling'
    ]
  }
];

export const CoreNotes = () => {
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [selectedTopic, setSelectedTopic] = useState(SUBJECTS[0].topics[0]);
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  // Knowledge Pre-check Diagnostic Modal states
  const [isPrecheckModalOpen, setIsPrecheckModalOpen] = useState(false);
  const [precheckQuestions, setPrecheckQuestions] = useState([]);
  const [userPrecheckAnswers, setUserPrecheckAnswers] = useState({});
  const [diagnosedTier, setDiagnosedTier] = useState('INTERMEDIATE');
  const [isPrecheckSubmitted, setIsPrecheckSubmitted] = useState(false);

  const fetchNotes = async (topicName, tier = diagnosedTier, scorePct = 75) => {
    setLoading(true);
    try {
      const data = await api.getAdaptiveNotes(topicName, tier, scorePct);
      if (data && data.notes) {
        setNotes(data.notes);
      }
    } catch (err) {
      console.error('Failed to generate adaptive notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes(selectedTopic, diagnosedTier, 75);
  }, [selectedTopic]);

  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
    setSelectedTopic(subject.topics[0]);
  };

  const handleCustomSearch = (e) => {
    e.preventDefault();
    if (customTopicInput.trim()) {
      setSelectedTopic(customTopicInput.trim());
      setCustomTopicInput('');
    }
  };

  const handleStartPrecheck = async () => {
    setUserPrecheckAnswers({});
    setIsPrecheckSubmitted(false);
    try {
      const data = await api.precheckTopic(selectedTopic);
      if (data && data.diagnosticQuestions) {
        setPrecheckQuestions(data.diagnosticQuestions);
        setIsPrecheckModalOpen(true);
      }
    } catch (e) {
      setIsPrecheckModalOpen(true);
    }
  };

  const handlePrecheckSubmit = () => {
    let correctCount = 0;
    precheckQuestions.forEach((q, idx) => {
      if (userPrecheckAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const scorePct = Math.round((correctCount / (precheckQuestions.length || 1)) * 100);
    let assignedTier = 'INTERMEDIATE';
    if (scorePct >= 80) assignedTier = 'ADVANCED';
    else if (scorePct < 40) assignedTier = 'NOVICE';

    setDiagnosedTier(assignedTier);
    setIsPrecheckSubmitted(true);

    // Refresh notes with newly diagnosed tier
    setTimeout(() => {
      setIsPrecheckModalOpen(false);
      fetchNotes(selectedTopic, assignedTier, scorePct);
    }, 1500);
  };

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleCopyNotes = () => {
    if (!notes) return;
    const textToCopy = `# ${notes.subject}: ${notes.topic} (${notes.diagnosedTier} Tier)\n\n${notes.summary}\n\n` +
      (notes.sections || []).map(s => `## ${s.title}\n${s.content}\n${s.code ? '```' + (s.language || '') + '\n' + s.code + '\n```\n' : ''}`).join('\n') +
      `\n## Top Interview Questions\n` +
      (notes.interviewQuestions || []).map((q, i) => `${i + 1}. ${q.question}\nAnswer: ${q.answer}\n`).join('\n');

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
              <Sparkles size={12} />
              Adaptive Knowledge Engine
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Adaptive SDE Placement & Core Notes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            AI checks your profile and knowledge level first with a diagnostic pre-check, then generates customized study notes for Novice, Intermediate, or Advanced tiers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartPrecheck}
            icon={<ShieldCheck size={14} className="text-purple-600 dark:text-purple-400" />}
          >
            Pre-Check Knowledge ({diagnosedTier})
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyNotes}
            icon={copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          >
            {copied ? 'Copied' : 'Copy Notes'}
          </Button>
        </div>
      </div>

      {/* Topic Search Bar */}
      <form onSubmit={handleCustomSearch} className="flex gap-2 max-w-xl">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search or type ANY topic (e.g. B+ Trees, Token Bucket, Monotonic Deque)..."
            value={customTopicInput}
            onChange={(e) => setCustomTopicInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <Button type="submit" size="sm">
          Generate Topic
        </Button>
      </form>

      {/* Subject Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {SUBJECTS.map((sub) => {
          const isActive = selectedSubject.id === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => handleSelectSubject(sub)}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                isActive
                  ? 'border-purple-600 bg-purple-50/60 dark:border-purple-500 dark:bg-purple-950/30 font-bold text-purple-900 dark:text-purple-200 shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300'
              }`}
            >
              {sub.icon}
              <span className="text-xs font-semibold truncate">{sub.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Topic Selector + Content */}
      <div className="grid gap-6 lg:grid-cols-4">
        
        {/* Topic Selector Sidebar */}
        <Card className="lg:col-span-1 p-3">
          <CardHeader className="px-2 py-2">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-400 font-bold">
              {selectedSubject.name.split('(')[0]} Topics
            </CardTitle>
          </CardHeader>
          <div className="space-y-1 mt-2">
            {selectedSubject.topics.map((topic) => {
              const isTopicActive = selectedTopic === topic;
              return (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isTopicActive
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  {topic}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Notes Display Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {loading ? (
            <Card className="p-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Synthesizing Adaptive Notes for {selectedTopic}...
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Adjusting depth, invariants, code snippets, and top interview questions for {diagnosedTier} level.
                </p>
              </div>
            </Card>
          ) : notes ? (
            <>
              {/* Summary Card with Diagnosed Tier switcher */}
              <Card className="border-l-4 border-l-purple-600 bg-gradient-to-r from-purple-50/40 via-transparent to-transparent dark:from-purple-950/20">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        {notes.subject || 'Algorithm & Placement Study'}
                      </span>
                      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        {notes.topic}
                      </h2>
                    </div>

                    {/* Tier selector pills */}
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-xs">
                      {['NOVICE', 'INTERMEDIATE', 'ADVANCED'].map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            setDiagnosedTier(t);
                            fetchNotes(selectedTopic, t);
                          }}
                          className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                            (notes.diagnosedTier || diagnosedTier) === t
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed">
                    {notes.summary}
                  </p>
                </div>
              </Card>

              {/* Note Content Sections */}
              <div className="space-y-4">
                {notes.sections?.map((sec, idx) => (
                  <Card key={idx} className="space-y-3">
                    <h3 className="text-base font-bold text-slate-850 dark:text-slate-100">
                      {sec.title}
                    </h3>
                    <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed whitespace-pre-line">
                      {sec.content}
                    </p>

                    {sec.code && (
                      <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 mt-3">
                        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 text-xs text-slate-400 border-b border-slate-800 font-mono">
                          <span>{sec.language || 'Code Snippet'}</span>
                        </div>
                        <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                          <code>{sec.code}</code>
                        </pre>
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {/* Top Interview Questions */}
              {notes.interviewQuestions?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle size={18} className="text-purple-600 dark:text-purple-400" />
                      Top Placement Interview Questions on {notes.topic}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {notes.interviewQuestions.map((q, qIdx) => {
                      const isExpanded = expandedQuestions[qIdx];
                      return (
                        <div
                          key={qIdx}
                          className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30 transition-colors"
                        >
                          <button
                            onClick={() => toggleQuestion(qIdx)}
                            className="w-full flex items-center justify-between text-left font-bold text-sm text-slate-800 dark:text-slate-200"
                          >
                            <span>Q{qIdx + 1}: {q.question}</span>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">Answer:</span>
                              {q.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Rapid Revision Takeaways */}
              {notes.quickTakeaways?.length > 0 && (
                <Card className="bg-slate-900 text-white border-none shadow-lg">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-purple-400 mb-3 flex items-center gap-1.5">
                    <Sparkles size={14} />
                    High-Yield Rapid Revision Cheatsheet
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {notes.quickTakeaways.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </>
          ) : null}
        </div>

      </div>

      {/* Pre-Check Knowledge Diagnostic Modal */}
      <Modal
        isOpen={isPrecheckModalOpen}
        onClose={() => setIsPrecheckModalOpen(false)}
        title={`Knowledge Pre-Check Diagnostic: ${selectedTopic}`}
      >
        <div className="space-y-5 text-left text-xs">
          <p className="text-slate-500 dark:text-slate-400">
            Answer these 3 rapid diagnostic questions. HierPrep analyzes your answers and customizes your notes to the optimal depth level.
          </p>

          <div className="space-y-4">
            {precheckQuestions.map((q, idx) => (
              <div key={q.id || idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="font-bold text-sm text-slate-850 dark:text-slate-100">
                  {idx + 1}. {q.question}
                </div>
                <div className="space-y-1.5">
                  {q.options?.map((opt, oIdx) => (
                    <label
                      key={oIdx}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        userPrecheckAnswers[idx] === oIdx
                          ? 'border-purple-600 bg-purple-50 dark:border-purple-500 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-semibold'
                          : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${idx}`}
                        checked={userPrecheckAnswers[idx] === oIdx}
                        onChange={() => setUserPrecheckAnswers({ ...userPrecheckAnswers, [idx]: oIdx })}
                        className="text-purple-600"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {isPrecheckSubmitted && (
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 font-bold text-center">
              ✓ Diagnostic Complete! Diagnosed Knowledge Tier: {diagnosedTier}. Tailoring notes now...
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsPrecheckModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePrecheckSubmit}>
              Submit & Personalize Notes
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default CoreNotes;
