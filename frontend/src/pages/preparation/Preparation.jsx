import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Card from '../../components/common/Card';
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
  Zap,
  Swords,
  Play,
  RotateCcw,
  Code2,
  Layers,
  Cpu,
  Trophy,
  Check,
  X,
  ChevronRight,
  HelpCircle,
  Award,
  Terminal,
  Send,
  BookOpen
} from 'lucide-react';

export const Preparation = () => {
  // Navigation sub-tabs for Section 4
  const [activeSection, setActiveSection] = useState('contest_4prob'); // 'contest_4prob' | 'core_cs_mcq' | 'aptitude_mcq' | 'gap_analysis'

  // Diagnostic Data State
  const [prepData, setPrepData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  // =========================================================================
  // SUB-SECTION 4A: 4-PROBLEM CODING CONTEST SIMULATOR STATE
  // =========================================================================
  const [contestData, setContestData] = useState(null);
  const [contestStarted, setContestStarted] = useState(false);
  const [contestFinished, setContestFinished] = useState(false);
  const [activeProblemIdx, setActiveProblemIdx] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [userCode, setUserCode] = useState({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState({});
  const [contestSeconds, setContestSeconds] = useState(5400); // 90 mins
  const [penalties, setPenalties] = useState(0);
  const [solvedProblemIds, setSolvedProblemIds] = useState(new Set());
  const [contestScorecard, setContestScorecard] = useState(null);

  // =========================================================================
  // SUB-SECTION 4B: DYNAMIC MCQ TEST CONTEST STATE (CORE CS & APTITUDE)
  // =========================================================================
  const [mcqData, setMcqData] = useState(null);
  const [mcqLoading, setMcqLoading] = useState(false);
  const [mcqStarted, setMcqStarted] = useState(false);
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [mcqTimeLeft, setMcqTimeLeft] = useState(1500); // 25 mins
  const [mcqResult, setMcqResult] = useState(null);
  const [isSubmittingMcq, setIsSubmittingMcq] = useState(false);

  // Load Initial Diagnostic telemetry
  const loadPreparation = async () => {
    try {
      setLoading(true);
      const res = await api.getPreparationData();
      setPrepData(res);
    } catch (err) {
      console.error('Failed to load preparation analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load 4-problem contest definition
  const loadContestProblems = async () => {
    try {
      const res = await api.getSelfTestContestProblems();
      if (res && res.problems) {
        setContestData(res);
        // Pre-fill initial starter code
        const initialCodes = {};
        res.problems.forEach(p => {
          initialCodes[p.id] = {
            javascript: p.starterCode?.javascript || '',
            python: p.starterCode?.python || '',
            cpp: p.starterCode?.cpp || '',
            java: p.starterCode?.java || ''
          };
        });
        setUserCode(initialCodes);
      }
    } catch (err) {
      console.error('Failed to load contest problems:', err);
    }
  };

  useEffect(() => {
    loadPreparation();
    loadContestProblems();
  }, []);

  // 4-Problem Contest Timer Countdown
  useEffect(() => {
    let timer = null;
    if (contestStarted && !contestFinished && contestSeconds > 0) {
      timer = setInterval(() => {
        setContestSeconds(prev => {
          if (prev <= 1) {
            handleFinishContest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [contestStarted, contestFinished, contestSeconds]);

  // MCQ Timer Countdown
  useEffect(() => {
    let timer = null;
    if (mcqStarted && !mcqSubmitted && mcqTimeLeft > 0) {
      timer = setInterval(() => {
        setMcqTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitMcq();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mcqStarted, mcqSubmitted, mcqTimeLeft]);

  // Start 4-Problem Contest
  const handleStartContest = () => {
    setContestStarted(true);
    setContestFinished(false);
    setContestSeconds(5400);
    setPenalties(0);
    setSolvedProblemIds(new Set());
    setContestScorecard(null);
  };

  // Run AI Code Judge Evaluation for current problem
  const handleEvaluateCode = async () => {
    if (!contestData) return;
    const currentProb = contestData.problems[activeProblemIdx];
    const code = userCode[currentProb.id]?.[selectedLanguage] || '';

    setIsEvaluating(true);
    try {
      const res = await api.evaluateSelfTestCode(currentProb.id, code, selectedLanguage);
      setEvaluationResult(prev => ({
        ...prev,
        [currentProb.id]: res
      }));

      if (res.verdict === 'Accepted') {
        const nextSolved = new Set(solvedProblemIds);
        nextSolved.add(currentProb.id);
        setSolvedProblemIds(nextSolved);
        setNotice(`🎉 Accepted! +${currentProb.points} points awarded for "${currentProb.title}".`);
      } else {
        setPenalties(prev => prev + 1);
        setNotice(`⚠️ ${res.verdict}: ${res.feedback || 'Review edge cases and complexity.'}`);
      }
      setTimeout(() => setNotice(''), 4500);
    } catch (err) {
      alert(`Evaluation error: ${err.message}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Submit complete 4-Problem Contest & Calculate Elo Rating
  const handleFinishContest = async () => {
    try {
      const elapsed = 5400 - contestSeconds;
      const res = await api.submitSelfTestContest({
        solvedProblemIds: Array.from(solvedProblemIds),
        totalSeconds: elapsed,
        penalties
      });
      setContestScorecard(res.contestSummary);
      setContestFinished(true);
    } catch (err) {
      console.error('Failed to submit contest:', err);
    }
  };

  // Load and Start MCQ Test for selected track
  const handleStartMcq = async (track) => {
    setMcqLoading(true);
    setMcqStarted(false);
    setMcqSubmitted(false);
    setMcqAnswers({});
    setCurrentMcqIndex(0);
    setMcqResult(null);

    try {
      const res = await api.getSelfTestMcq(track, 10);
      setMcqData(res);
      setMcqTimeLeft((res.durationMinutes || 20) * 60);
      setMcqStarted(true);
    } catch (err) {
      alert(`Failed to load MCQ test: ${err.message}`);
    } finally {
      setMcqLoading(false);
    }
  };

  // Submit MCQ Test
  const handleSubmitMcq = async () => {
    if (!mcqData) return;
    setIsSubmittingMcq(true);
    try {
      const res = await api.evaluateSelfTestMcq(mcqData.track, mcqAnswers);
      setMcqResult(res);
      setMcqSubmitted(true);
    } catch (err) {
      alert(`Failed to evaluate MCQ test: ${err.message}`);
    } finally {
      setIsSubmittingMcq(false);
    }
  };

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 text-left pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 mb-2">
            <Target size={12} />
            Section 4 • AI Functional Self-Test & Contest Arena
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            AI Functional Self-Test & Preparation Arena
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl mt-1">
            Simulated 4-problem algorithmic contest with AI code evaluation and real-time Elo rating calculation, plus Core CS (OS, DBMS, SQL, CN, OOPs) and General Aptitude MCQ tests.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
          <Sparkles size={14} />
          <span>{notice}</span>
        </div>
      )}

      {/* Main Track Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
        {[
          { id: 'contest_4prob', label: '4-Problem Coding Contest (Rated)', icon: Swords },
          { id: 'core_cs_mcq', label: 'CS Core MCQ Test (OS, DBMS, SQL, CN, OOPs)', icon: Layers },
          { id: 'aptitude_mcq', label: 'General Aptitude (Quant & Reasoning)', icon: Brain },
          { id: 'gap_analysis', label: 'Skill Gap Telemetry Diagnosis', icon: Zap }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeSection === tab.id
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* =========================================================================
          VIEW 1: 4-PROBLEM CODING CONTEST ARENA WITH AI JUDGE & RATING CALCULATION
         ========================================================================= */}
      {activeSection === 'contest_4prob' && (
        <div className="space-y-6">
          {!contestStarted ? (
            /* Contest Pre-Kickoff Lobby Card */
            <Card className="p-8 border-slate-200/80 dark:border-slate-800 text-center max-w-3xl mx-auto space-y-6">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Swords size={32} />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                  Official Rated Simulation
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  HierPrep AI Bi-Weekly Algorithmic Arena #42
                </h2>
                <p className="text-xs text-slate-500 max-w-lg mx-auto mt-2 leading-relaxed">
                  Real contest simulation with 4 challenges ranging from Easy to Hard. Tested against automated AI judge testcases, execution time, and space complexity with live Elo/Glicko rating calculation.
                </p>
              </div>

              {/* Contest Specs Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Duration</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">90 Minutes</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Total Problems</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">4 Problems</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Scoring Scale</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">1000 Points</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Penalty Rule</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">ICPC 5m / WA</span>
                </div>
              </div>

              {/* Problem List Overview */}
              <div className="space-y-2 text-left pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Round Challenges:
                </span>
                {(contestData?.problems || []).map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px]">
                        P{idx + 1}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{p.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' :
                        p.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' :
                        'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}>
                        {p.difficulty}
                      </span>
                      <span className="font-mono text-slate-400 font-bold">{p.points} pts</span>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleStartContest}
                className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <Play size={16} />
                <span>Start Timed Contest Now</span>
              </Button>
            </Card>
          ) : contestFinished && contestScorecard ? (
            /* Post-Contest Performance Scorecard */
            <Card className="p-8 border-slate-200/80 dark:border-slate-800 max-w-3xl mx-auto space-y-6 text-center">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
                <Trophy size={32} />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                  Contest Concluded • Official Standing Computed
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Contest Performance Standings
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Performance computed based on AC problems, time elapsed, and submission penalties.
                </p>
              </div>

              {/* Elo Rating Impact Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Rating Change Delta
                  </span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-3xl font-black text-white">
                      {contestScorecard.newRating}
                    </span>
                    <span className={`text-base font-bold ${contestScorecard.ratingDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {contestScorecard.ratingDelta >= 0 ? `+${contestScorecard.ratingDelta}` : contestScorecard.ratingDelta}
                    </span>
                    <span className="text-xs text-slate-400">(was {contestScorecard.previousRating})</span>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Rank & Standing
                  </span>
                  <span className="text-lg font-black text-indigo-300">
                    Global Rank #{contestScorecard.rank}
                  </span>
                  <p className="text-[11px] text-slate-400">Top {100 - contestScorecard.percentile}% of contestants</p>
                </div>
              </div>

              {/* Performance Stats Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Score Earned</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {contestScorecard.totalPointsEarned} / 1000
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Solved Count</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {contestScorecard.solvedCount} / 4
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Time Elapsed</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {Math.round(contestScorecard.timeTakenSeconds / 60)} mins
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Performance Tier</span>
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {contestScorecard.badgeEarned}
                  </span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-3">
                <Button
                  onClick={handleStartContest}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  <RotateCcw size={14} className="mr-1.5" /> Retry Fresh Contest Round
                </Button>
                <Link
                  to="/dashboard"
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center"
                >
                  View Profile Trajectory →
                </Link>
              </div>
            </Card>
          ) : (
            /* Live 4-Problem Coding Arena Environment */
            <div className="space-y-4">
              {/* Contest Live Header Bar */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-rose-500 animate-pulse"></span>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-none">
                      HierPrep AI Arena #42 (LIVE)
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Solved: {solvedProblemIds.size} / 4 • Penalties: {penalties}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-700">
                    <Clock size={14} className="text-amber-400" />
                    <span className="font-mono font-bold text-sm text-white">
                      {formatTimer(contestSeconds)}
                    </span>
                  </div>

                  <Button
                    onClick={handleFinishContest}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Finish Contest
                  </Button>
                </div>
              </div>

              {/* Problem Switcher Tabs (P1, P2, P3, P4) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(contestData?.problems || []).map((prob, idx) => {
                  const isSolved = solvedProblemIds.has(prob.id);
                  const isCurrent = activeProblemIdx === idx;

                  return (
                    <button
                      key={prob.id}
                      onClick={() => setActiveProblemIdx(idx)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-slate-400">Problem {idx + 1}</span>
                        {isSolved ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            AC ✓
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">{prob.points} pts</span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {prob.title}
                      </p>
                      <span className={`inline-block mt-1 text-[10px] font-semibold ${
                        prob.difficulty === 'Easy' ? 'text-emerald-600' :
                        prob.difficulty === 'Medium' ? 'text-amber-600' :
                        'text-rose-600'
                      }`}>
                        {prob.difficulty}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Problem Workspace: Split View */}
              {contestData?.problems?.[activeProblemIdx] && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* LEFT: Problem Description & Testcases (5 Cols) */}
                  <Card className="lg:col-span-5 p-5 border-slate-200/80 dark:border-slate-800 text-left space-y-4 max-h-[700px] overflow-y-auto">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          Problem {activeProblemIdx + 1} of 4
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {contestData.problems[activeProblemIdx].points} Points
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {contestData.problems[activeProblemIdx].title}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {contestData.problems[activeProblemIdx].tags.map(t => (
                          <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                      <p className="whitespace-pre-line">{contestData.problems[activeProblemIdx].description}</p>
                    </div>

                    {/* Constraints */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">Constraints:</span>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-slate-500 font-mono">
                        {contestData.problems[activeProblemIdx].constraints.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Examples */}
                    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">Examples:</span>
                      {contestData.problems[activeProblemIdx].examples.map((ex, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs font-mono space-y-1">
                          <p><span className="text-slate-400 font-sans font-bold">Input:</span> {ex.input}</p>
                          <p><span className="text-slate-400 font-sans font-bold">Output:</span> {ex.output}</p>
                          {ex.explanation && (
                            <p className="text-[11px] font-sans text-slate-500 pt-1">
                              <strong>Explanation:</strong> {ex.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* RIGHT: Code Editor & AI Evaluation Panel (7 Cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    <Card className="p-4 border-slate-200/80 dark:border-slate-800 text-left">
                      {/* Code Header Controls */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <Terminal size={16} className="text-indigo-600" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Solution Editor
                          </span>
                        </div>

                        {/* Language Selector */}
                        <select
                          value={selectedLanguage}
                          onChange={(e) => setSelectedLanguage(e.target.value)}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
                        >
                          <option value="javascript">JavaScript (Node.js)</option>
                          <option value="python">Python 3</option>
                          <option value="cpp">C++ (g++ 20)</option>
                          <option value="java">Java (OpenJDK 17)</option>
                        </select>
                      </div>

                      {/* Code Textarea with Monospace styling */}
                      <div className="pt-3">
                        <textarea
                          rows={14}
                          value={userCode[contestData.problems[activeProblemIdx].id]?.[selectedLanguage] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setUserCode(prev => ({
                              ...prev,
                              [contestData.problems[activeProblemIdx].id]: {
                                ...(prev[contestData.problems[activeProblemIdx].id] || {}),
                                [selectedLanguage]: val
                              }
                            }));
                          }}
                          className="w-full font-mono text-xs p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed resize-y"
                          placeholder="// Implement your solution here..."
                          spellCheck={false}
                        />
                      </div>

                      {/* Run / Evaluate Action Row */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] text-slate-400">
                          Evaluates against hidden test cases & Big-O bounds
                        </span>

                        <Button
                          onClick={handleEvaluateCode}
                          disabled={isEvaluating}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
                        >
                          <Send size={13} className={isEvaluating ? 'animate-spin' : ''} />
                          <span>{isEvaluating ? 'Judging Code...' : 'Submit to AI Judge'}</span>
                        </Button>
                      </div>
                    </Card>

                    {/* AI Evaluation Result Banner */}
                    {evaluationResult[contestData.problems[activeProblemIdx].id] && (
                      <Card className={`p-5 text-left border ${
                        evaluationResult[contestData.problems[activeProblemIdx].id].verdict === 'Accepted'
                          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                          : 'border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {evaluationResult[contestData.problems[activeProblemIdx].id].verdict === 'Accepted' ? (
                              <CheckCircle2 size={18} className="text-emerald-600" />
                            ) : (
                              <AlertCircle size={18} className="text-rose-600" />
                            )}
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              Verdict: {evaluationResult[contestData.problems[activeProblemIdx].id].verdict}
                            </h4>
                          </div>

                          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                            {evaluationResult[contestData.problems[activeProblemIdx].id].testCasesPassed} / {evaluationResult[contestData.problems[activeProblemIdx].id].totalTestCases} Testcases Passed
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                          {evaluationResult[contestData.problems[activeProblemIdx].id].feedback}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Time Complexity</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {evaluationResult[contestData.problems[activeProblemIdx].id].timeComplexity}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Space Complexity</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {evaluationResult[contestData.problems[activeProblemIdx].id].spaceComplexity}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Execution Time</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {evaluationResult[contestData.problems[activeProblemIdx].id].executionTimeMs} ms
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Memory Peak</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {evaluationResult[contestData.problems[activeProblemIdx].id].memoryUsedMb} MB
                            </span>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 2 & 3: DYNAMIC REAL-TIME MCQ TEST (CORE CS & GENERAL APTITUDE)
         ========================================================================= */}
      {(activeSection === 'core_cs_mcq' || activeSection === 'aptitude_mcq') && (
        <div className="space-y-6">
          {!mcqStarted ? (
            /* MCQ Kickoff Lobby Card */
            <Card className="p-8 border-slate-200/80 dark:border-slate-800 text-center max-w-2xl mx-auto space-y-6">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                {activeSection === 'core_cs_mcq' ? <Layers size={32} /> : <Brain size={32} />}
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                  Timed Placement Screening Exam
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {activeSection === 'core_cs_mcq'
                    ? 'Core Computer Science Fundamentals Exam'
                    : 'Quantitative Aptitude & Logical Reasoning Exam'}
                </h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                  {activeSection === 'core_cs_mcq'
                    ? 'Comprehensive evaluation covering Operating Systems (OS), Database Management Systems (DBMS), SQL, Computer Networks (CN), and Object-Oriented Programming (OOPs).'
                    : 'High-speed placement test covering Time & Work, Speed-Distance, Profit-Loss, Permutations, Blood Relations, Number Series, and Direction Logic.'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-left">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Questions</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">10 MCQs</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Time Limit</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeSection === 'core_cs_mcq' ? '25 Mins' : '20 Mins'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Evaluation</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Instant AI Check</span>
                </div>
              </div>

              <Button
                onClick={() => handleStartMcq(activeSection === 'core_cs_mcq' ? 'core_cs' : 'aptitude_reasoning')}
                disabled={mcqLoading}
                className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <Play size={16} />
                <span>{mcqLoading ? 'Generating Questions...' : 'Start Assessment Contest'}</span>
              </Button>
            </Card>
          ) : mcqSubmitted && mcqResult ? (
            /* MCQ Results & Detailed Subject-wise Breakdown */
            <div className="max-w-3xl mx-auto space-y-6">
              <Card className="p-8 border-slate-200/80 dark:border-slate-800 text-center space-y-6">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Award size={32} />
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                    Exam Completed • Instant AI Evaluation
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Scorecard: {mcqResult.percentage}% ({mcqResult.score}/{mcqResult.totalQuestions} Correct)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Placement Readiness Percentile: <strong>{mcqResult.percentile}th percentile</strong>
                  </p>
                </div>

                {/* Subject Accuracy Breakdown Progress Bars */}
                {mcqResult.subjectBreakdown && mcqResult.subjectBreakdown.length > 0 && (
                  <div className="space-y-3 text-left pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Topic Mastery Breakdown:
                    </span>
                    {mcqResult.subjectBreakdown.map((subj, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-800 dark:text-slate-200">{subj.subject}</span>
                          <span className="text-indigo-600 dark:text-indigo-400">{subj.accuracy}% ({subj.correct}/{subj.total})</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              subj.accuracy >= 75 ? 'bg-emerald-500' :
                              subj.accuracy >= 50 ? 'bg-amber-500' :
                              'bg-rose-500'
                            }`}
                            style={{ width: `${subj.accuracy}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-center gap-3 pt-3">
                  <Button
                    onClick={() => handleStartMcq(activeSection === 'core_cs_mcq' ? 'core_cs' : 'aptitude_reasoning')}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    <RotateCcw size={14} className="mr-1.5" /> Retake Test
                  </Button>
                </div>
              </Card>

              {/* Step-by-Step Explanations Review */}
              <div className="space-y-4 text-left">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen size={18} className="text-indigo-600" />
                  Detailed Question Explanations & Step-by-Step Solutions
                </h3>

                {(mcqResult.review || []).map((item, idx) => (
                  <Card
                    key={item.id}
                    className={`p-5 border text-left space-y-3 ${
                      item.isCorrect
                        ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                        : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        Q{idx + 1} • {item.subject} ({item.topic})
                      </span>
                      <span className={`font-bold px-2 py-0.5 rounded ${
                        item.isCorrect
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {item.isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed whitespace-pre-line">
                      {item.question}
                    </p>

                    {/* Options list */}
                    <div className="space-y-1.5 pt-1">
                      {item.options.map((opt, oIdx) => {
                        const isChosen = item.userAnswer === oIdx;
                        const isActualCorrect = item.correctAnswer === oIdx;

                        let style = 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300';
                        if (isActualCorrect) {
                          style = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-bold';
                        } else if (isChosen && !isActualCorrect) {
                          style = 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-900 dark:text-rose-200 line-through';
                        }

                        return (
                          <div key={oIdx} className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${style}`}>
                            <span>{opt}</span>
                            {isActualCorrect && <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Correct Answer</span>}
                            {isChosen && !isActualCorrect && <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">Your Choice</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800">
                      <strong className="text-slate-900 dark:text-white block mb-1">Step-by-Step AI Explanation:</strong>
                      <p className="leading-relaxed">{item.explanation}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            /* Live MCQ Testing Interface */
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Timer & Navigation Bar */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Question {currentMcqIndex + 1} of {mcqData.questions.length}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {mcqData.questions[currentMcqIndex].subject} • {mcqData.questions[currentMcqIndex].topic}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
                    <Clock size={13} className="text-amber-400" />
                    <span className="font-mono font-bold text-xs text-white">
                      {formatTimer(mcqTimeLeft)}
                    </span>
                  </div>

                  <Button
                    onClick={handleSubmitMcq}
                    disabled={isSubmittingMcq}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                  >
                    Submit Exam
                  </Button>
                </div>
              </div>

              {/* Current Question Card */}
              <Card className="p-6 border-slate-200/80 dark:border-slate-800 text-left space-y-5">
                <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed whitespace-pre-line">
                  {mcqData.questions[currentMcqIndex].question}
                </p>

                {/* Options List */}
                <div className="space-y-2.5">
                  {mcqData.questions[currentMcqIndex].options.map((opt, oIdx) => {
                    const isSelected = mcqAnswers[mcqData.questions[currentMcqIndex].id] === oIdx;

                    return (
                      <button
                        key={oIdx}
                        onClick={() => {
                          setMcqAnswers(prev => ({
                            ...prev,
                            [mcqData.questions[currentMcqIndex].id]: oIdx
                          }));
                        }}
                        className={`w-full p-3.5 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-900 dark:text-indigo-200 font-bold shadow-xs'
                            : 'bg-slate-50/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <Check size={14} className="text-indigo-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Previous / Next Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentMcqIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentMcqIndex === 0}
                    className="text-xs"
                  >
                    Previous
                  </Button>

                  <span className="text-xs text-slate-400 font-mono">
                    Answered: {Object.keys(mcqAnswers).length} / {mcqData.questions.length}
                  </span>

                  {currentMcqIndex < mcqData.questions.length - 1 ? (
                    <Button
                      onClick={() => setCurrentMcqIndex(prev => prev + 1)}
                      className="text-xs bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                    >
                      Next Question →
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmitMcq}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      Submit Exam
                    </Button>
                  )}
                </div>
              </Card>

              {/* Question Navigation Palette */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                {mcqData.questions.map((q, idx) => {
                  const answered = mcqAnswers[q.id] !== undefined;
                  const isCurrent = currentMcqIndex === idx;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentMcqIndex(idx)}
                      className={`h-7 w-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isCurrent ? 'ring-2 ring-indigo-500 bg-indigo-600 text-white' :
                        answered ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        'bg-white dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 4: SKILL GAP TELEMETRY DIAGNOSIS
         ========================================================================= */}
      {activeSection === 'gap_analysis' && prepData && (
        <div className="space-y-6">
          <Card className="p-6 border-slate-200/80 dark:border-slate-800 text-left">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Placement Readiness & Topic Mastery Index
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Telemetry diagnosis derived from your connected LeetCode, Codeforces, and HackerRank submissions
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(prepData.analysis?.topicMastery || []).map((topic, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{topic.name}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      topic.status === 'STRONG' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                      topic.status === 'MODERATE' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {topic.status}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${topic.score || 60}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recommended Problem Sets */}
          <Card className="p-6 border-slate-200/80 dark:border-slate-800 text-left">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              High-Yield Gap Eliminating Problems
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Targeted practice questions selected to patch detected algorithmic blindspots
            </p>

            <div className="space-y-3">
              {(prepData.recommendations || []).map((rec, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{rec.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{rec.topic} • {rec.difficulty}</p>
                  </div>
                  <a
                    href={rec.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                  >
                    <span>Practice</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Preparation;
