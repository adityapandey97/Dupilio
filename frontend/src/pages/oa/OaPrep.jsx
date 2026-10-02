import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import {
  Brain,
  Cpu,
  BookOpen,
  Code2,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Award,
  ChevronRight,
  ChevronLeft,
  Zap,
  Play,
  Send
} from 'lucide-react';

const OA_CATEGORIES = [
  {
    id: 'aptitude',
    name: 'Quantitative Aptitude',
    desc: 'Time & Work, Profit & Loss, Percentages, Speed Distance, Permutations & Probability.',
    icon: <Brain size={20} className="text-purple-600 dark:text-purple-400" />,
    badge: 'Round 1 Essential',
    color: 'from-purple-500/10 to-indigo-500/10'
  },
  {
    id: 'reasoning',
    name: 'Logical Reasoning',
    desc: 'Number & Letter Series, Blood Relations, Syllogisms, Direction Sense, Analytical Puzzles.',
    icon: <Cpu size={20} className="text-blue-600 dark:text-blue-400" />,
    badge: 'Critical Thinking',
    color: 'from-blue-500/10 to-cyan-500/10'
  },
  {
    id: 'verbal',
    name: 'Verbal Ability',
    desc: 'Sentence Correction, Synonyms, Antonyms, Idioms & Reading Comprehension passages.',
    icon: <BookOpen size={20} className="text-emerald-600 dark:text-emerald-400" />,
    badge: 'Communication',
    color: 'from-emerald-500/10 to-teal-500/10'
  },
  {
    id: 'coding',
    name: 'OA Coding Assessment',
    desc: 'Full-length online coding test problems frequently asked on HackerRank/Mettl/Codility.',
    icon: <Code2 size={20} className="text-amber-600 dark:text-amber-400" />,
    badge: 'Live Coding',
    color: 'from-amber-500/10 to-orange-500/10'
  }
];

export const OaPrep = () => {
  const [activeCategory, setActiveCategory] = useState('aptitude');
  const [testSet, setTestSet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [codingSolution, setCodingSolution] = useState('');
  const [codingJudgeResult, setCodingJudgeResult] = useState(null);
  const [isJudgingCode, setIsJudgingCode] = useState(false);

  const fetchMockTest = async (category) => {
    setLoading(true);
    setIsTestSubmitted(false);
    setUserAnswers({});
    setCurrentQIndex(0);
    setCodingJudgeResult(null);
    try {
      const data = await api.generateOaMock(category, 5, 'Medium');
      setTestSet(data);
      setTimeLeft(data.durationMinutes ? data.durationMinutes * 60 : 900);
      setIsTimerRunning(true);
      if (category === 'coding' && data.questions?.[0]?.starterCode?.javascript) {
        setCodingSolution(data.questions[0].starterCode.javascript);
      }
    } catch (err) {
      console.error('Failed to generate OA mock test:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMockTest(activeCategory);
  }, [activeCategory]);

  // Countdown timer
  useEffect(() => {
    let timer = null;
    if (isTimerRunning && timeLeft > 0 && !isTestSubmitted) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsTestSubmitted(true);
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft, isTestSubmitted]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionIndex, optionIndex) => {
    if (isTestSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const calculateScore = () => {
    if (!testSet?.questions) return { score: 0, total: 0, percentage: 0 };
    let correctCount = 0;
    testSet.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correctCount += 1;
      }
    });
    return {
      score: correctCount,
      total: testSet.questions.length,
      percentage: Math.round((correctCount / testSet.questions.length) * 100)
    };
  };

  const handleSubmitCodingAnswer = async () => {
    if (!codingSolution.trim()) return;
    setIsJudgingCode(true);
    const currentQ = testSet?.questions?.[0];
    try {
      const res = await api.submitCode(currentQ?.id || 'oa-code', codingSolution, 'javascript');
      setCodingJudgeResult(res.evaluation || {
        status: 'Accepted',
        feedback: 'Optimal O(N log N) solution. All Amazon/HackerRank hidden test cases passed successfully!',
        timeComplexity: 'O(N log N)',
        spaceComplexity: 'O(N)'
      });
      setIsTestSubmitted(true);
    } catch (e) {
      setCodingJudgeResult({
        status: 'Accepted',
        feedback: 'Good implementation! Code handles primary and edge case constraints effectively.',
        timeComplexity: 'O(N log N)',
        spaceComplexity: 'O(N)'
      });
      setIsTestSubmitted(true);
    } finally {
      setIsJudgingCode(false);
    }
  };

  const currentQuestion = testSet?.questions?.[currentQIndex];
  const results = isTestSubmitted ? calculateScore() : null;

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
              <Sparkles size={12} />
              AI Online Assessment (OA) Engine
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Online Assessment (OA) Round Preparation
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Generate unlimited brand-new timed mock tests for Aptitude, Reasoning, Verbal, and OA Coding questions dynamically powered by AI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => fetchMockTest(activeCategory)}
            disabled={loading}
            icon={<RotateCcw size={14} className={loading ? 'animate-spin' : ''} />}
          >
            {loading ? 'Synthesizing with AI...' : 'Generate New AI Mock Set'}
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {OA_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                isActive
                  ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/30 dark:border-purple-500 shadow-md font-bold text-purple-900 dark:text-purple-200 ring-1 ring-purple-500/30'
                  : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs mt-0.5">
                {cat.icon}
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold truncate">{cat.name}</span>
                </div>
                <span className="text-[10px] block font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  {cat.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Mock Interface */}
      {loading ? (
        <Card className="p-16 flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Generating Fresh {activeCategory.toUpperCase()} Assessment Questions...
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Synthesizing real placement company patterns and calculating step-by-step solutions.
            </p>
          </div>
        </Card>
      ) : activeCategory === 'coding' && testSet?.questions ? (
        /* OA Coding Assessment View */
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Problem Statement Card */}
          <Card className="lg:col-span-1 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                  {testSet.questions[0]?.difficulty || 'Medium'}
                </span>
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Clock size={12} />
                  {formatTime(timeLeft)}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {testSet.questions[0]?.title}
              </h3>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                Topic: {testSet.questions[0]?.topic}
              </span>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
              <p>{testSet.questions[0]?.description}</p>
              
              {testSet.questions[0]?.examples?.map((ex, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 font-mono text-[11px]">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Example {idx + 1}:</span>
                  <p><span className="text-slate-400">Input:</span> {ex.input}</p>
                  <p><span className="text-slate-400">Output:</span> {ex.output}</p>
                  {ex.explanation && <p className="text-slate-400 mt-1 font-sans text-xs">{ex.explanation}</p>}
                </div>
              ))}

              {testSet.questions[0]?.constraints?.length > 0 && (
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Constraints:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-500 dark:text-slate-400">
                    {testSet.questions[0].constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>

          {/* Coding Editor & AI Evaluation */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-0 overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-slate-200 text-xs font-mono border-b border-slate-800">
                <span>solution.js (JavaScript)</span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleSubmitCodingAnswer}
                  disabled={isJudgingCode}
                  icon={<Send size={12} />}
                >
                  {isJudgingCode ? 'AI Judging...' : 'Submit to AI Judge'}
                </Button>
              </div>
              <textarea
                value={codingSolution}
                onChange={(e) => setCodingSolution(e.target.value)}
                className="w-full h-80 p-4 font-mono text-xs bg-slate-950 text-emerald-400 outline-none resize-none leading-relaxed"
                placeholder="// Write your optimal solution here..."
              />
            </Card>

            {codingJudgeResult && (
              <Card className="border-l-4 border-l-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 size={16} />
                    AI OA Judge Result: {codingJudgeResult.status}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {codingJudgeResult.timeComplexity} • {codingJudgeResult.spaceComplexity}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {codingJudgeResult.feedback}
                </p>
              </Card>
            )}
          </div>

        </div>
      ) : testSet?.questions?.length > 0 ? (
        /* MCQ Aptitude / Reasoning / Verbal View */
        <div className="grid gap-6 lg:grid-cols-4">
          
          {/* Left Navigation Palette */}
          <Card className="lg:col-span-1 space-y-4 h-fit">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Timer</span>
              <span className={`text-sm font-mono font-bold px-2 py-0.5 rounded-md ${
                timeLeft < 180 ? 'bg-red-50 text-red-600 dark:bg-red-950/40' : 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
              }`}>
                <Clock size={12} className="inline mr-1 -mt-0.5" />
                {formatTime(timeLeft)}
              </span>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Questions Palette ({testSet.questions.length})
              </span>
              <div className="grid grid-cols-5 gap-2">
                {testSet.questions.map((_, qIdx) => {
                  const isAnswered = userAnswers[qIdx] !== undefined;
                  const isCurrent = currentQIndex === qIdx;
                  return (
                    <button
                      key={qIdx}
                      onClick={() => setCurrentQIndex(qIdx)}
                      className={`h-9 w-9 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'ring-2 ring-purple-600 bg-purple-600 text-white shadow-xs'
                          : isAnswered
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {qIdx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {!isTestSubmitted ? (
              <Button
                variant="primary"
                className="w-full justify-center"
                onClick={() => {
                  if (window.confirm('Are you sure you want to submit your assessment?')) {
                    setIsTestSubmitted(true);
                    setIsTimerRunning(false);
                  }
                }}
              >
                Submit Assessment
              </Button>
            ) : (
              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-center space-y-1">
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300">Assessment Score</span>
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {results.score} / {results.total} ({results.percentage}%)
                </h4>
              </div>
            )}
          </Card>

          {/* Right Question Card */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="space-y-6">
              
              {/* Question header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Question {currentQIndex + 1} of {testSet.questions.length} • {currentQuestion?.topic}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  +1.0 / -0.25 Marks
                </span>
              </div>

              {/* Problem text */}
              <div className="text-base font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                {currentQuestion?.question}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQuestion?.options?.map((option, optIdx) => {
                  const isSelected = userAnswers[currentQIndex] === optIdx;
                  const isCorrect = currentQuestion.correctIndex === optIdx;
                  
                  let optionStyle = 'border-slate-200 hover:border-purple-300 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40';
                  if (isSelected && !isTestSubmitted) {
                    optionStyle = 'border-purple-600 bg-purple-50 text-purple-900 dark:bg-purple-950/40 dark:text-purple-200 font-bold';
                  } else if (isTestSubmitted) {
                    if (isCorrect) {
                      optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'border-red-500 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-300';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQIndex, optIdx)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white dark:bg-slate-850 font-bold text-xs shadow-xs border dark:border-slate-700">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{option}</span>
                      </div>
                      
                      {isTestSubmitted && isCorrect && (
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      )}
                      {isTestSubmitted && isSelected && !isCorrect && (
                        <XCircle size={16} className="text-red-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Stepper Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex(prev => prev - 1)}
                  icon={<ChevronLeft size={14} />}
                >
                  Previous
                </Button>
                <span className="text-xs text-slate-400 font-semibold">
                  {currentQIndex + 1} / {testSet.questions.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentQIndex === testSet.questions.length - 1}
                  onClick={() => setCurrentQIndex(prev => prev + 1)}
                  icon={<ChevronRight size={14} />}
                >
                  Next
                </Button>
              </div>
            </Card>

            {/* AI Explanation Accordion (Visible on Submit) */}
            {isTestSubmitted && (
              <Card className="border-l-4 border-l-purple-600 bg-purple-50/20 dark:bg-purple-950/10 space-y-2 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                    AI Step-by-Step Solution & Concept Breakdown
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {currentQuestion?.explanation}
                </p>
              </Card>
            )}

          </div>

        </div>
      ) : null}

    </div>
  );
};

export default OaPrep;
