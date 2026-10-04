import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import {
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  Search,
  Filter,
  Award,
  Users,
  Building,
  CheckCircle2,
  TrendingUp,
  ListTodo
} from 'lucide-react';

export const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState('');

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getEvents({
        type: selectedType === 'All' ? undefined : selectedType,
        location: selectedLocation === 'All' ? undefined : selectedLocation,
        search: searchQuery
      });
      setEvents(data || []);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [selectedType, selectedLocation]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadEvents();
  };

  const handleAddTodo = async (title, company, deadline) => {
    try {
      await api.createTodo({
        title: `Submit project/registration for ${title} (${company})`,
        category: 'Development',
        priority: 'high',
        daysOffset: 5
      });
      setActionNotice(`Added milestone for ${title} to your Todo Planner!`);
      setTimeout(() => setActionNotice(''), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  // Section 36: Calculate deterministic compatibility
  const calculateEventMatch = (event) => {
    const userSkills = new Set(
      (user?.profile?.skills || []).map((s) => s.toLowerCase().trim())
    );
    (user?.profile?.developerDna?.detectedTechStack || []).forEach((t) => {
      userSkills.add(t.toLowerCase().trim());
    });

    const tags = event.tags || [];
    if (tags.length === 0) return { score: 75, matched: ['Open Source', 'Algorithms'], missing: [] };

    const matched = [];
    const missing = [];

    tags.forEach((tag) => {
      const clean = tag.toLowerCase().trim();
      if (userSkills.has(clean) || Array.from(userSkills).some((u) => u.includes(clean) || clean.includes(u))) {
        matched.push(tag);
      } else {
        missing.push(tag);
      }
    });

    const basePct = Math.round((matched.length / tags.length) * 100);
    const score = Math.min(96, Math.max(30, basePct + 20));

    return {
      score,
      matched,
      missing
    };
  };

  const typePillColors = {
    Hackathon: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60',
    'Hiring Challenge': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60',
    'Open Source': 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60',
    Workshop: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60',
    'Coding Contest': 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/60',
    'Tech Summit': 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200/60 dark:border-pink-800/60'
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 mb-2">
            <Sparkles size={12} />
            Hackathons & Competitions
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Hackathons & Events Hub
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl mt-1">
            Verified campus challenges, flagship corporate hackathons (Flipkart GRiD, SIH, GSoC), and developer workshops with deterministic compatibility scoring.
          </p>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={14} />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Filter and Search Controls (Section 34 & 37) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        
        {/* Type Filter Pills (Section 34) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['All', 'Hackathon', 'Hiring Challenge', 'Open Source', 'Workshop', 'Tech Summit'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedType === type
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Location Privacy & Search (Section 37: Coarse Location) */}
        <div className="flex items-center gap-2">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Locations</option>
            <option value="Online">Online / Virtual</option>
            <option value="India">All India</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Delhi NCR">Delhi NCR</option>
            <option value="Hyderabad">Hyderabad</option>
          </select>

          <form onSubmit={handleSearch} className="flex items-center gap-1.5">
            <input
              placeholder="Search event or sponsor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs px-3 py-1.5 w-36 sm:w-48 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="p-1.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
            >
              <Search size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-52 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse"></div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-slate-200 dark:border-slate-800">
          <Calendar size={36} className="mx-auto text-slate-300 mb-2 opacity-50" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No events matching criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try broadening your search or location filter.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((e) => {
            const matchInfo = calculateEventMatch(e);

            return (
              <Card
                key={e._id || e.id}
                className="p-5 border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:shadow-lg transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        typePillColors[e.type] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {e.type}
                    </span>

                    {/* Section 36: Deterministic Match Score */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800/60">
                      <TrendingUp size={11} />
                      {matchInfo.score}% Match
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {e.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    <Building size={12} />
                    {e.company} • <span className="text-slate-400">{e.location}</span>
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {e.description}
                  </p>

                  {/* Prize pool / awards */}
                  {e.prizePool && (
                    <div className="mt-3 p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-center gap-2 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                      <Award size={13} className="shrink-0 text-amber-600" />
                      <span className="truncate">{e.prizePool}</span>
                    </div>
                  )}

                  {/* Tags / skills match */}
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-1">
                    {matchInfo.matched.map((m) => (
                      <span
                        key={m}
                        className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                      >
                        <CheckCircle2 size={9} />
                        {m}
                      </span>
                    ))}
                    {matchInfo.missing.map((mis) => (
                      <span
                        key={mis}
                        className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      >
                        {mis}
                      </span>
                    ))}
                  </div>

                  <div className="mt-2 text-[11px] text-slate-400">
                    <span>Deadline: {new Date(e.registrationDeadline).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleAddTodo(e.title, e.company, e.registrationDeadline)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 transition-colors"
                  >
                    <ListTodo size={14} />
                    <span>Add to Todo</span>
                  </button>

                  <a
                    href={e.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <span>Apply Now</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Events;
