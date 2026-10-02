import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
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
  CheckCircle2
} from 'lucide-react';

export const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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

  const typePillColors = {
    Hackathon: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60',
    'Hiring Challenge': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60',
    'Open Source': 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60',
    Workshop: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60',
    'Coding Contest': 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/60'
  };

  return (
    <div className="space-y-8 animate-fade-in text-left pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Sparkles size={28} className="text-indigo-600" />
            Hackathons & Opportunities Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Discover verified campus challenges, company hiring hackathons, and open-source programs.
          </p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        
        {/* Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Hackathon', 'Hiring Challenge', 'Open Source', 'Workshop', 'Coding Contest'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedType === type
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Location & Search Input */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          >
            <option value="All">All Locations</option>
            <option value="Online">Online / Virtual</option>
            <option value="India">India</option>
          </select>

          <form onSubmit={handleSearch} className="flex items-center gap-1.5">
            <Input
              placeholder="Search opportunity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs h-9 w-44 sm:w-56"
            />
            <Button type="submit" className="text-xs px-3 h-9 bg-slate-800 text-white">
              <Search size={14} />
            </Button>
          </form>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">Loading verified opportunities...</div>
      ) : events.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-slate-300 dark:border-slate-800">
          <Calendar size={36} className="mx-auto text-slate-400 mb-2 opacity-50" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No opportunities matching criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try broadening your search or filter tags.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(e => (
            <Card
              key={e._id || e.id}
              className="p-5 border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between hover:shadow-xl transition-all text-left"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${typePillColors[e.type] || 'bg-slate-100 text-slate-700'}`}>
                    {e.type}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin size={12} />
                    {e.location}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {e.title}
                </h3>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1">
                  <Building size={13} />
                  {e.company}
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mt-2.5 leading-relaxed">
                  {e.description}
                </p>

                {e.prizePool && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
                    <Award size={15} className="shrink-0 text-amber-600" />
                    <span className="truncate">{e.prizePool}</span>
                  </div>
                )}

                <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p><strong className="text-slate-700 dark:text-slate-300">Eligibility:</strong> {e.eligibility}</p>
                  <p><strong className="text-slate-700 dark:text-slate-300">Deadline:</strong> {new Date(e.registrationDeadline).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">Source: {e.source}</span>
                <a
                  href={e.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <span>Apply Now</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
};

export default Events;
