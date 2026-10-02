import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import {
  Target,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Brain,
  Sparkles,
  ExternalLink,
  PlusCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
  Zap
} from 'lucide-react';

export const Preparation = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  const loadPreparation = async () => {
    try {
      setLoading(true);
      const res = await api.getPreparationData();
      setData(res);
    } catch (err) {
      console.error('Failed to load preparation analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreparation();
  }, []);

  const handleAddRecToTodo = async (rec) => {
    try {
      await api.createTodo({
        title: `Weak Topic Practice: ${rec.title} (${rec.topic})`,
        description: `${rec.reason} Platform: ${rec.source}. Link: ${rec.originalUrl}`,
        category: 'DSA',
        priority: rec.difficulty === 'Hard' ? 'urgent' : 'high',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        tags: [rec.topic, rec.difficulty, 'AI-Recommended'],
        isCompleted: false
      });
      setNotice(`✅ "${rec.title}" scheduled into your Todo Planner for tomorrow!`);
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      alert(`Failed to add task: ${err.message}`);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="text-sm font-semibold text-slate-500">Diagnosing algorithmic telemetry & gaps...</p>
        </div>
      </div>
    );
  }

  const { analysis, recommendations } = data;
  const { readinessScore, topicMastery, priorityAreas, summary } = analysis;

  const statusColors = {
    STRONG: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    MODERATE: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    WEAK: 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    CRITICAL_GAP: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800'
  };

  return (
    <div className="space-y-8 animate-fade-in text-left pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Target size={28} className="text-indigo-600" />
            AI Preparation Analysis & Gap Detection
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deterministic diagnostic evaluation of your connected profile data to eliminate critical algorithmic blindspots.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          {notice}
        </div>
      )}

      {/* Readiness Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Overall Readiness Metric */}
        <Card className="p-6 border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Overall Placement Readiness
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-indigo-600 dark:text-indigo-400">
                {readinessScore}%
              </span>
              <span className="text-sm font-semibold text-slate-400">Evaluation Index</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              {summary}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Target Benchmark:</span>
            <span className="font-bold text-slate-900 dark:text-white">85% for Tier-1 OAs</span>
          </div>
        </Card>

        {/* Right: Top 3 Priority Focus Action Items */}
        <Card className="lg:col-span-2 p-6 border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert size={18} className="text-rose-500" />
                Diagnosed Priority Focus Areas
              </h3>
              <p className="text-xs text-slate-500">Elevating these domains significantly increases OA clearance probability</p>
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-900">
              Needs Attention
            </span>
          </div>

          <div className="space-y-3">
            {priorityAreas.map((p) => (
              <div key={p.rank} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold">
                  {p.rank}
                </span>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{p.topic}</h4>
                    <span className="text-xs font-mono font-bold text-rose-600">Current: {p.currentScore}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {p.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Complete Topic Domain Mastery Breakdown */}
      <Card className="p-6 border-slate-200/80 dark:border-slate-800/80">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Domain Mastery & Topic Telemetry</h3>
          <p className="text-xs text-slate-500">Calculated from LeetCode solved tags, Codeforces submissions, and streak continuity</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {topicMastery.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{item.topic}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${statusColors[item.status]}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-mono font-black text-slate-900 dark:text-white">{item.mastery}%</span>
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${item.mastery >= 75 ? 'bg-emerald-500' : item.mastery >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  style={{ width: `${item.mastery}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Personalized Practice Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-600" />
              Personalized Practice Recommendations
            </h2>
            <p className="text-xs text-slate-500">Tailored problems selected to systematically close identified diagnostic drop-offs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendations.map(rec => (
            <Card
              key={rec.id}
              className="p-5 border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between hover:shadow-lg transition-all text-left"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                    {rec.topic}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                    {rec.difficulty}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {rec.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Source: {rec.source}</p>

                <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong className="text-indigo-600 dark:text-indigo-400 block mb-0.5">Why Recommended:</strong>
                  {rec.reason}
                </div>

                {rec.optimalComplexity && (
                  <p className="text-[11px] text-slate-400 font-mono mt-2">
                    Target: {rec.optimalComplexity}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleAddRecToTodo(rec)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle size={14} className="text-indigo-600" />
                  <span>Add to Todo</span>
                </button>

                <a
                  href={rec.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <span>Solve Problem</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Preparation;
