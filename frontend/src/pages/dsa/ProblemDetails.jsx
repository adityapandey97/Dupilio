import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { ArrowLeft, Play, Send, RefreshCw, Terminal, CheckCircle2, History, AlertCircle } from 'lucide-react';

export const ProblemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const loadProblem = async () => {
      try {
        const list = await api.getProblems();
        const p = list.find(prob => prob.id === id);
        if (!p) {
          navigate('/dsa/problems');
          return;
        }
        setProblem(p);
        setCode(p.starterCode[selectedLanguage] || '');
      } catch (err) {
        console.error('Failed to load problem details:', err);
      }
    };
    loadProblem();
    
    // Load existing mock submissions
    const storedSubs = JSON.parse(localStorage.getItem(`submissions_${id}`) || '[]');
    setSubmissions(storedSubs);
  }, [id, selectedLanguage, navigate]);

  if (!problem) return null;

  const handleResetCode = () => {
    if (window.confirm('Clear the code input?')) {
      setCode('');
    }
  };

  const handleSubmitCode = async () => {
    if (!code.trim()) {
      alert('Please paste your solution code first.');
      return;
    }

    setIsSubmitting(true);
    setConsoleLogs(['$ submitting code to AI Judge...', '$ analyzing correctness and complexity...']);
    
    try {
      const res = await api.submitCode(problem.id, code, selectedLanguage);
      setIsSubmitting(false);

      if (res.success && res.evaluation) {
        const { status, feedback, timeComplexity, spaceComplexity } = res.evaluation;
        
        if (status === 'Accepted') {
          setProblem(prev => ({ ...prev, isSolved: true }));

          // Add to submissions list
          const newSub = {
            id: `sub-${Date.now()}`,
            date: new Date().toLocaleString(),
            status: 'Accepted',
            runtime: timeComplexity || 'O(N)',
            memory: spaceComplexity || 'O(1)',
            language: selectedLanguage.toUpperCase()
          };
          const updatedSubs = [newSub, ...submissions];
          setSubmissions(updatedSubs);
          localStorage.setItem(`submissions_${id}`, JSON.stringify(updatedSubs));

          setConsoleLogs([
            '$ submitting code to AI Judge...',
            '$ analyzing correctness and complexity...',
            '---------------------------------------',
            '🎉 AI JUDGE RESULT: ACCEPTED',
            `Time/Space Complexity: ${timeComplexity || 'O(N)'} / ${spaceComplexity || 'O(1)'}`,
            '---------------------------------------',
            `💬 Feedback: ${feedback}`,
            '---------------------------------------',
            '✅ Problem marked as solved. Coding profile stats updated!'
          ]);
          
          setActiveTab('submissions');
        } else {
          setConsoleLogs([
            '$ submitting code to AI Judge...',
            '$ analyzing correctness and complexity...',
            '---------------------------------------',
            '❌ AI JUDGE RESULT: REJECTED',
            '---------------------------------------',
            `💬 Feedback: ${feedback}`,
            '---------------------------------------',
            '⚠️ Please correct your implementation and try again.'
          ]);
        }
      }
    } catch (err) {
      setIsSubmitting(false);
      setConsoleLogs([
        '$ submitting code to AI Judge...',
        '❌ Judging failed: ' + (err.response?.data?.message || err.message)
      ]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] min-h-[500px] gap-4 animate-fade-in text-left">
      
      {/* Top action bar */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            to="/dsa/problems"
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {problem.title}
              </h2>
              {problem.isSolved && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={12} />
                  Solved
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Language:</span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-250"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python 3</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
        </div>
      </div>

      {/* Main split workspace */}
      <div className="flex-1 grid gap-4 lg:grid-cols-2 overflow-hidden min-h-0">
        
        {/* Left Panel: Description and Tests */}
        <Card className="flex flex-col h-full p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800">
          
          {/* Tab selectors */}
          <div className="flex border-b border-slate-100 bg-slate-50/75 dark:border-slate-800 dark:bg-slate-900/40 shrink-0">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors focus:outline-none ${
                activeTab === 'description'
                  ? 'border-purple-600 text-purple-700 dark:border-purple-400 dark:text-purple-300'
                  : 'border-transparent text-slate-500 hover:text-slate-850 dark:text-slate-450 dark:hover:text-slate-200'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors focus:outline-none ${
                activeTab === 'submissions'
                  ? 'border-purple-600 text-purple-700 dark:border-purple-400 dark:text-purple-300'
                  : 'border-transparent text-slate-500 hover:text-slate-850 dark:text-slate-450 dark:hover:text-slate-200'
              }`}
            >
              Submissions ({submissions.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'description' && (
              <div className="space-y-6 text-sm text-slate-700 dark:text-slate-350 leading-relaxed">
                
                {/* Meta details and External Link */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-purple-50 dark:bg-purple-950/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      problem.difficulty === 'Easy'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-450'
                        : problem.difficulty === 'Medium'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-450'
                        : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-450'
                    }`}>
                      {problem.difficulty}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Topic: {problem.topic}</span>
                    <span className="text-xs text-slate-400 font-medium">Platform: {problem.platform || 'LeetCode'}</span>
                  </div>
                  {problem.externalUrl && (
                    <a
                      href={problem.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-all focus:outline-none shrink-0"
                    >
                      Solve on {problem.platform || 'LeetCode'} ↗
                    </a>
                  )}
                </div>

                {/* Problem Description text */}
                <div className="whitespace-pre-line font-normal">
                  {problem.description}
                </div>

                {/* Examples */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Examples</h3>
                  {problem.examples.map((ex, index) => (
                    <div key={index} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/20 font-mono text-xs space-y-1">
                      <p><span className="font-bold text-slate-500">Input:</span> {ex.input}</p>
                      <p><span className="font-bold text-slate-500">Output:</span> {ex.output}</p>
                      {ex.explanation && (
                        <p className="mt-1 text-slate-500 font-sans italic"><span className="font-bold font-sans not-italic text-slate-500">Explanation:</span> {ex.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Constraints</h3>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    {problem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Submission History</h3>
                {submissions.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-12">No submissions made yet for this problem.</p>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 dark:border-slate-800 dark:bg-slate-900/10">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle2 size={12} />
                              {sub.status}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">({sub.language})</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{sub.date}</span>
                        </div>
                        <div className="text-right text-xs font-mono text-slate-500 dark:text-slate-400">
                          <p>Runtime: {sub.runtime}</p>
                          <p>Memory: {sub.memory}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Right Panel: Editor and Logs Console */}
        <div className="flex flex-col h-full gap-4 overflow-hidden min-h-0">
          
          {/* Code Editor Body */}
          <Card className="flex-1 flex flex-col p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/75 px-4 py-2 dark:border-slate-800 dark:bg-slate-900/40 shrink-0">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Paste Solution Code</span>
              <button
                onClick={handleResetCode}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 focus:outline-none flex items-center gap-0.5"
              >
                <RefreshCw size={10} />
                Clear Code
              </button>
            </div>
            
            {/* Real Textarea Editor */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 w-full p-4 font-mono text-xs bg-slate-950 text-slate-200 border-none outline-none resize-none focus:ring-0 select-text dark:bg-slate-900"
              placeholder="Paste your solution code here after solving the problem on the external platform..."
              spellCheck="false"
            />
          </Card>

          {/* Console / Outputs panel */}
          <Card className="h-44 p-0 flex flex-col overflow-hidden border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/75 px-4 py-2 dark:border-slate-800 dark:bg-slate-900/40 shrink-0">
              <Terminal size={14} className="text-slate-500" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">AI Judge Console</span>
            </div>

            {/* Console Output Logs */}
            <div className="flex-1 p-3 overflow-y-auto bg-slate-950 font-mono text-[10px] text-slate-300 space-y-1 text-left dark:bg-slate-950">
              {consoleLogs.length === 0 ? (
                <span className="text-slate-500">Submit your solution to execute the remote AI judge evaluation...</span>
              ) : (
                consoleLogs.map((log, idx) => (
                  <p key={idx} className={
                    log.includes('SUCCESS') || log.includes('ACCEPTED') ? 'text-emerald-400 font-semibold' :
                    log.includes('ERROR') || log.includes('REJECTED') ? 'text-red-400 font-semibold' :
                    log.startsWith('$') ? 'text-slate-500' : 'text-slate-350'
                  }>
                    {log}
                  </p>
                ))
              )}
            </div>

            {/* Terminal Actions Bar */}
            <div className="flex justify-end gap-2 bg-slate-50 px-4 py-2 border-t border-slate-100 dark:border-slate-800 dark:bg-slate-900/40 shrink-0">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitCode}
                loading={isSubmitting}
                icon={<Send size={12} />}
              >
                Submit Code for AI Judge
              </Button>
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
};

export default ProblemDetails;
