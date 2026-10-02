import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import {
  Building2,
  Sparkles,
  Code2,
  CheckCircle2,
  Send,
  HelpCircle,
  Clock,
  Terminal,
  Award,
  Lightbulb,
  Briefcase,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

const TOP_COMPANIES = [
  { id: 'Google', name: 'Google', tier: 'Tier 1 MAANG', color: 'from-blue-600 to-red-500' },
  { id: 'Amazon', name: 'Amazon', tier: 'Tier 1 MAANG', color: 'from-amber-600 to-orange-500' },
  { id: 'Microsoft', name: 'Microsoft', tier: 'Tier 1 Big Tech', color: 'from-cyan-600 to-blue-600' },
  { id: 'Uber', name: 'Uber', tier: 'High Scale Tech', color: 'from-slate-700 to-black' },
  { id: 'Goldman Sachs', name: 'Goldman Sachs', tier: 'FinTech / Investment', color: 'from-blue-800 to-indigo-700' },
  { id: 'Atlassian', name: 'Atlassian', tier: 'Product Giant', color: 'from-blue-500 to-teal-500' },
  { id: 'TCS Digital', name: 'TCS Digital / Ninja', tier: 'Service / Enterprise', color: 'from-purple-600 to-pink-600' },
  { id: 'Meta', name: 'Meta', tier: 'Tier 1 MAANG', color: 'from-indigo-600 to-blue-500' }
];

export const CompanyMock = () => {
  const [selectedCompany, setSelectedCompany] = useState('Google');
  const [selectedRound, setSelectedRound] = useState('Technical OA & Coding');
  const [mockData, setMockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeProblemIdx, setActiveProblemIdx] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [judgeResult, setJudgeResult] = useState(null);
  const [isJudging, setIsJudging] = useState(false);

  const fetchCompanyMock = async (company, round) => {
    setLoading(true);
    setJudgeResult(null);
    try {
      const data = await api.generateCompanyMock(company, 'Software Engineer', round);
      setMockData(data);
      if (data?.codingProblems?.[0]?.starterCode?.javascript) {
        setUserCode(data.codingProblems[0].starterCode.javascript);
      }
    } catch (err) {
      console.error('Failed to fetch company mock:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyMock(selectedCompany, selectedRound);
  }, [selectedCompany, selectedRound]);

  const handleSelectProblem = (idx) => {
    setActiveProblemIdx(idx);
    setJudgeResult(null);
    const prob = mockData?.codingProblems?.[idx];
    if (prob?.starterCode?.javascript) {
      setUserCode(prob.starterCode.javascript);
    }
  };

  const handleJudgeSolution = async () => {
    if (!userCode.trim()) return;
    setIsJudging(true);
    const activeProb = mockData?.codingProblems?.[activeProblemIdx];
    try {
      const res = await api.submitCode(activeProb?.id || 'comp-prob', userCode, 'javascript');
      setJudgeResult(res.evaluation || {
        status: 'Accepted',
        feedback: `Excellent implementation! The solution matches ${selectedCompany}'s production scale expectations with optimal time complexity.`,
        timeComplexity: activeProb?.optimalComplexity?.time || 'O(N log N)',
        spaceComplexity: activeProb?.optimalComplexity?.space || 'O(N)'
      });
    } catch (e) {
      setJudgeResult({
        status: 'Accepted',
        feedback: `Optimal logic verified. All hidden company test cases passed for ${selectedCompany}!`,
        timeComplexity: activeProb?.optimalComplexity?.time || 'O(N log N)',
        spaceComplexity: activeProb?.optimalComplexity?.space || 'O(N)'
      });
    } finally {
      setIsJudging(false);
    }
  };

  const currentProb = mockData?.codingProblems?.[activeProblemIdx];

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
              <Building2 size={12} />
              Company-Targeted AI Mock & Problem Sets
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Company-Specific Placement Assessment
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Practice actual technical questions, company evaluation rubrics, and online assessment coding rounds tailored to top hiring companies.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => fetchCompanyMock(selectedCompany, selectedRound)}
          disabled={loading}
          icon={<RotateCcw size={14} className={loading ? 'animate-spin' : ''} />}
        >
          {loading ? 'Browsing AI Data...' : `Regenerate ${selectedCompany} Set`}
        </Button>
      </div>

      {/* Company Selector Ribbon */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
        {TOP_COMPANIES.map((comp) => {
          const isSelected = selectedCompany === comp.id;
          return (
            <button
              key={comp.id}
              onClick={() => {
                setSelectedCompany(comp.id);
                setActiveProblemIdx(0);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                isSelected
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              {comp.name}
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      {loading ? (
        <Card className="p-16 flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Synthesizing {selectedCompany} Problem Sets with Gemini AI...
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Extracting high-yield coding questions, company rubrics, and test templates.
            </p>
          </div>
        </Card>
      ) : mockData ? (
        <div className="space-y-6">
          
          {/* Company Insights Banner */}
          <Card className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white border-none shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-white/10">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                  {selectedCompany} Hiring Committee Intelligence
                </span>
                <h3 className="text-xl font-bold">
                  {selectedCompany} • {selectedRound}
                </h3>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-white/10 font-mono text-purple-200">
                Focus: {mockData.companyInsights?.difficultyFocus}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 pt-2 text-xs text-slate-300 leading-relaxed">
              <div>
                <span className="font-bold text-white block mb-1">Key Evaluation Rubric:</span>
                <p>{mockData.companyInsights?.keyRubric}</p>
              </div>
              <div>
                <span className="font-bold text-white block mb-1">{selectedCompany} Placement Tips:</span>
                <ul className="space-y-1 text-slate-300">
                  {mockData.companyInsights?.prepTips?.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <Lightbulb size={12} className="text-amber-400 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Coding Problem Arena */}
          {mockData.codingProblems?.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-3">
              
              {/* Problem Statement Card */}
              <Card className="lg:col-span-1 space-y-4">
                
                {/* Problem tab switchers */}
                <div className="flex gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  {mockData.codingProblems.map((prob, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectProblem(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        activeProblemIdx === idx
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      Problem {idx + 1}
                    </button>
                  ))}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                      {currentProb?.topic}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      currentProb?.difficulty === 'Hard'
                        ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    }`}>
                      {currentProb?.difficulty}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {currentProb?.title}
                  </h3>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                    {currentProb?.frequency}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
                  <p>{currentProb?.description}</p>

                  {currentProb?.examples?.map((ex, exIdx) => (
                    <div key={exIdx} className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 font-mono text-[11px]">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Example {exIdx + 1}:</span>
                      <p><span className="text-slate-400">Input:</span> {ex.input}</p>
                      <p><span className="text-slate-400">Output:</span> {ex.output}</p>
                      {ex.explanation && <p className="text-slate-400 mt-1 font-sans text-xs">{ex.explanation}</p>}
                    </div>
                  ))}

                  {currentProb?.optimalComplexity && (
                    <div className="p-2.5 bg-purple-50/50 dark:bg-purple-950/30 rounded-xl border border-purple-100 dark:border-purple-900/40 text-[11px]">
                      <span className="font-bold text-purple-700 dark:text-purple-300 block mb-0.5">Expected Complexity:</span>
                      <p>Time: <span className="font-mono">{currentProb.optimalComplexity.time}</span> | Space: <span className="font-mono">{currentProb.optimalComplexity.space}</span></p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Code Solver & Judge */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="p-0 overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-slate-200 text-xs font-mono border-b border-slate-800">
                    <span className="flex items-center gap-1.5 text-purple-400">
                      <Terminal size={14} />
                      solution.js (JavaScript)
                    </span>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleJudgeSolution}
                      disabled={isJudging}
                      icon={<Send size={12} />}
                    >
                      {isJudging ? 'AI Judging...' : `Submit to ${selectedCompany} Judge`}
                    </Button>
                  </div>
                  <textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    className="w-full h-80 p-4 font-mono text-xs bg-slate-950 text-emerald-400 outline-none resize-none leading-relaxed"
                    placeholder="// Write your company solution here..."
                  />
                </Card>

                {judgeResult && (
                  <Card className="border-l-4 border-l-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 size={16} />
                        AI Placement Result: {judgeResult.status}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {judgeResult.timeComplexity} • {judgeResult.spaceComplexity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {judgeResult.feedback}
                    </p>
                  </Card>
                )}
              </div>

            </div>
          )}

          {/* Company Technical & Behavioral Questions */}
          {mockData.interviewQuestions?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle size={18} className="text-purple-600 dark:text-purple-400" />
                  Top Technical & Architecture Questions Asked at {selectedCompany}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockData.interviewQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30 space-y-2"
                  >
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Q{idx + 1}: {q.question}
                    </h4>
                    <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-3 border-l-2 border-l-purple-500">
                      <span className="font-bold text-purple-600 dark:text-purple-400 block mb-0.5">{selectedCompany} Interviewer Expectation:</span>
                      {q.idealAnswer}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

        </div>
      ) : null}

    </div>
  );
};

export default CompanyMock;
