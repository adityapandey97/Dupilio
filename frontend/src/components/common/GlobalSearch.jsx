import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Code2,
  Swords,
  Sparkles,
  Briefcase,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';

export const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    problems: [],
    contests: [],
    events: [],
    jobs: []
  });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ problems: [], contests: [], events: [], jobs: [] });
    }
  }, [isOpen]);

  // Debounced search across real endpoints
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ problems: [], contests: [], events: [], jobs: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const q = query.toLowerCase();

        // 1. Contests
        const contestRes = await api.getContests({ status: 'upcoming' }).catch(() => ({ contests: [] }));
        const matchedContests = (contestRes.contests || [])
          .filter(c => c.title.toLowerCase().includes(q) || c.platform.toLowerCase().includes(q))
          .slice(0, 3);

        // 2. Problems
        const problemRes = await api.getProblems().catch(() => ({ problems: [] }));
        const matchedProblems = (problemRes.problems || [])
          .filter(p => p.title.toLowerCase().includes(q) || p.topic.toLowerCase().includes(q))
          .slice(0, 3);

        // 3. Events
        const eventRes = await api.getEvents().catch(() => ({ events: [] }));
        const matchedEvents = (eventRes.events || [])
          .filter(e => e.title.toLowerCase().includes(q) || e.company.toLowerCase().includes(q))
          .slice(0, 3);

        setResults({
          contests: matchedContests,
          problems: matchedProblems,
          events: matchedEvents,
          jobs: []
        });
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  const totalResults =
    results.contests.length +
    results.problems.length +
    results.events.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search size={20} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problems, contests, events, skills, topics... (Press Esc to exit)"
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 text-left">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-400">
              Searching DUPILIO live directory...
            </div>
          )}

          {!loading && query.length >= 2 && totalResults === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching resources found for "<span className="text-slate-700 dark:text-slate-200 font-semibold">{query}</span>"
            </div>
          )}

          {!loading && query.length < 2 && (
            <div className="py-6 px-3 text-xs text-slate-400 space-y-2">
              <p className="font-semibold text-slate-600 dark:text-slate-300">Quick Navigation:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSelect('/contests')}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Swords size={16} className="text-indigo-600" />
                  <span>Upcoming Contests</span>
                </button>
                <button
                  onClick={() => handleSelect('/problems')}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Code2 size={16} className="text-indigo-600" />
                  <span>Algorithmic Problem Hub</span>
                </button>
                <button
                  onClick={() => handleSelect('/events')}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Sparkles size={16} className="text-indigo-600" />
                  <span>Hackathons & Challenges</span>
                </button>
                <button
                  onClick={() => handleSelect('/career')}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Briefcase size={16} className="text-indigo-600" />
                  <span>Resume & Career Matches</span>
                </button>
              </div>
            </div>
          )}

          {/* Contests Section */}
          {results.contests.length > 0 && (
            <div className="mb-3">
              <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Competitive Programming Contests
              </p>
              {results.contests.map((c) => (
                <div
                  key={c._id || c.title}
                  onClick={() => handleSelect('/contests')}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Swords size={16} className="text-indigo-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{c.title}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{c.platform} • Starts {new Date(c.startTime).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-slate-400" />
                </div>
              ))}
            </div>
          )}

          {/* Problems Section */}
          {results.problems.length > 0 && (
            <div className="mb-3">
              <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Practice Problems
              </p>
              {results.problems.map((p) => (
                <div
                  key={p._id || p.title}
                  onClick={() => handleSelect('/problems')}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Code2 size={16} className="text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{p.title}</p>
                      <p className="text-[10px] text-slate-400">{p.topic} • {p.difficulty}</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-slate-400" />
                </div>
              ))}
            </div>
          )}

          {/* Events Section */}
          {results.events.length > 0 && (
            <div>
              <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Hackathons & Events
              </p>
              {results.events.map((e) => (
                <div
                  key={e._id || e.title}
                  onClick={() => handleSelect('/events')}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={16} className="text-amber-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{e.title}</p>
                      <p className="text-[10px] text-slate-400">{e.company} • {e.type}</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-slate-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
