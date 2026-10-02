import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import {
  Mic,
  Video,
  VideoOff,
  Clock,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
  AlertCircle,
  HelpCircle,
  Volume2,
  User
} from 'lucide-react';

export const InterviewRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakText, setSpeakText] = useState('');
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState(false);
  const [report, setReport] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiSpeechActive, setAiSpeechActive] = useState(false);

  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Fetch module metadata
  useEffect(() => {
    const loadRoomData = async () => {
      try {
        const list = await api.getInterviews();
        const m = list.find(item => item.id === id);
        if (!m) {
          navigate('/interview');
          return;
        }
        setModule(m);
        setTimeRemaining(m.duration * 60);

        // Default answers mock
        const initialAnswers = {};
        m.questions.forEach(q => {
          initialAnswers[q.id] = '';
        });
        setUserAnswers(initialAnswers);
      } catch (err) {
        console.error('Failed to load interview room details:', err);
      }
    };
    loadRoomData();
  }, [id, navigate]);

  // Countdown timer
  useEffect(() => {
    let interval;
    if (module && !report && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [module, report, timeRemaining]);

  // Handle webcam toggle
  useEffect(() => {
    if (isWebcamActive) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          setWebcamError(true);
          setIsWebcamActive(false);
        });
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isWebcamActive]);

  // Trigger brief wave animation when moving to a new question
  useEffect(() => {
    if (module) {
      setAiSpeechActive(true);
      const timer = setTimeout(() => setAiSpeechActive(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [currentIdx, module]);

  if (!module) return null;

  const currentQuestion = module.questions[currentIdx];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMicToggle = () => {
    if (isSpeaking) {
      // Finished speaking, append text
      if (speakText.trim()) {
        setUserAnswers(prev => ({
          ...prev,
          [currentQuestion.id]: speakText.trim()
        }));
      }
      setIsSpeaking(false);
      setSpeakText('');
    } else {
      setIsSpeaking(true);
      setSpeakText(userAnswers[currentQuestion.id] || '');
    }
  };

  const handleNext = () => {
    if (currentIdx < module.questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const handleFinishInterview = async () => {
    // Check if any answers are empty
    const unanswered = Object.values(userAnswers).some(val => !val.trim());
    if (unanswered) {
      if (!window.confirm('You have unanswered questions. Are you sure you want to finish the interview?')) {
        return;
      }
    }

    setIsEvaluating(true);

    try {
      const answersPayload = module.questions.map(q => ({
        questionId: q.id,
        questionText: q.questionText,
        answerText: userAnswers[q.id] || ''
      }));

      const res = await api.submitInterview(module.id, answersPayload);
      setReport(res.report);
    } catch (err) {
      alert('AI evaluation failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsEvaluating(false);
    }
  };

  if (isEvaluating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 text-center animate-pulse">
        <Sparkles size={48} className="text-purple-600 animate-spin" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Evaluating Performance...</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          Our placement AI is analyzing your verbal inputs, checking keywords, and compiling feedback logs. This will take a moment.
        </p>
      </div>
    );
  }

  if (report) {
    return (
      <div className="space-y-8 animate-fade-in text-left">
        {/* Report Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Interview Evaluation Report
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {report.interviewName} completed on {report.date}
            </p>
          </div>
          <Link to="/interview">
            <Button variant="outline">Done & Exit</Button>
          </Link>
        </div>

        {/* Score and summary grid */}
        <div className="grid gap-6 md:grid-cols-3">
          
          <Card className="flex flex-col items-center justify-center text-center p-8 bg-purple-50/40 border-purple-200/50 dark:border-purple-900/40 dark:bg-purple-950/20">
            <Trophy size={48} className="text-purple-600 dark:text-purple-400 mb-3" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300">
              Overall AI Score
            </h3>
            <h1 className="text-5xl font-extrabold text-slate-800 dark:text-white my-3">
              {report.score}%
            </h1>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Score beats 82% of SDE candidates
            </span>
          </Card>

          <Card className="md:col-span-2">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-3">General Feedback</h3>
            <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed">
              {report.generalFeedback}
            </p>
          </Card>

        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid gap-6 md:grid-cols-2">
          
          <Card className="border-l-4 border-l-emerald-500">
            <h3 className="text-base font-bold text-emerald-700 dark:text-emerald-450 mb-3">Key Strengths</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-350 list-disc list-inside">
              {report.strengths.map((str, idx) => (
                <li key={idx}>{str}</li>
              ))}
            </ul>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <h3 className="text-base font-bold text-amber-700 dark:text-amber-450 mb-3">Suggested Improvements</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-350 list-disc list-inside">
              {report.weaknesses.map((weak, idx) => (
                <li key={idx}>{weak}</li>
              ))}
            </ul>
          </Card>

        </div>

        {/* Detailed Question Review */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b pb-2">Questions Review</h3>
          {report.answers.map((ans, idx) => (
            <Card key={ans.questionId} className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 mb-2 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Question {idx + 1}: {ans.questionText}
                </h4>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  ans.score >= 80 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' :
                  ans.score >= 60 ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' :
                  'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                }`}>
                  Score: {ans.score}%
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">Your Spoken Answer</p>
                  <p className="text-sm text-slate-600 dark:text-slate-350 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border dark:border-slate-800/80 leading-relaxed font-sans italic">
                    "{ans.answerText}"
                  </p>
                </div>

                <div>
                  <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">Feedback</p>
                  <p className="text-sm text-slate-600 dark:text-slate-350">
                    {ans.feedback}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">Evaluated Answer Requirements</p>
                  {ans.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2 text-sm">
                      <span className={`h-4 w-4 shrink-0 rounded-full mt-0.5 flex items-center justify-center font-bold text-[9px] ${
                        pt.matched ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                      }`}>
                        {pt.matched ? '✓' : '✗'}
                      </span>
                      <span className={pt.matched ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-450 dark:text-slate-500 line-through'}>
                        {pt.pointText}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] min-h-[500px] gap-4 animate-fade-in text-left">
      
      {/* Top action bar */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            to="/interview"
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              {module.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold rounded-lg bg-purple-50 dark:bg-purple-950/40 px-3 py-1.5 text-purple-700 dark:text-purple-300">
            <Clock size={16} />
            <span>Time Remaining: {formatTime(timeRemaining)}</span>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={handleFinishInterview}
          >
            Finish Interview
          </Button>
        </div>
      </div>

      {/* Main split grid */}
      <div className="flex-1 grid gap-4 lg:grid-cols-2 overflow-hidden min-h-0">
        
        {/* Left Pane: AI Interviewer */}
        <Card className="flex flex-col h-full border border-slate-200/80 dark:border-slate-800 dark:bg-slate-900/60 p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/75 px-4 py-2 dark:border-slate-800 dark:bg-slate-900/40 shrink-0">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">AI Interviewer Avatar</span>
            <span className="h-2 w-2 rounded-full bg-purple-500 animate-ping"></span>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center p-6 space-y-6 overflow-y-auto">
            
            {/* Waveform indicator */}
            <div className="flex items-center justify-center gap-1.5 h-16 shrink-0">
              {[...Array(9)].map((_, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-full bg-purple-600 dark:bg-purple-400 transition-all duration-300 ${
                    aiSpeechActive 
                      ? 'animate-bounce' 
                      : 'h-4'
                  }`}
                  style={{
                    animationDelay: `${i * 150}ms`,
                    height: aiSpeechActive ? `${Math.floor(Math.random() * 40) + 12}px` : '16px'
                  }}
                ></span>
              ))}
            </div>

            <div className="max-w-md text-center space-y-4">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-purple-600 dark:text-purple-400">
                <Volume2 size={12} />
                AI speaking question
              </span>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-relaxed">
                {currentQuestion.questionText}
              </h3>
            </div>
            
          </div>

          {/* Answer Area */}
          <div className="border-t border-slate-100 p-4 dark:border-slate-800 shrink-0 bg-slate-50/30">
            {isSpeaking ? (
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-purple-600 uppercase tracking-wider">
                  Dictating Response (Simulated)
                </label>
                <textarea
                  value={speakText}
                  onChange={(e) => setSpeakText(e.target.value)}
                  placeholder="Type your response speech here... (e.g. 'A tree is a hierarchical data structure with nodes...')"
                  className="w-full h-24 p-3 text-sm border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-900 dark:border-slate-850 dark:text-slate-200"
                  autoFocus
                />
              </div>
            ) : (
              <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-850/80 min-h-[64px] mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Your Transcript</p>
                <p className="text-sm text-slate-650 dark:text-slate-350 italic">
                  {userAnswers[currentQuestion.id] 
                    ? `"${userAnswers[currentQuestion.id]}"`
                    : 'No transcript recorded yet. Click "Speak Response" below to answer.'}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                  icon={<ChevronLeft size={14} />}
                >
                  Prev
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleNext}
                  disabled={currentIdx === module.questions.length - 1}
                  icon={<ChevronRight size={14} />}
                >
                  Next
                </Button>
              </div>

              <Button
                variant={isSpeaking ? 'primary' : 'outline'}
                onClick={handleMicToggle}
                icon={<Mic size={14} className={isSpeaking ? 'animate-pulse' : ''} />}
              >
                {isSpeaking ? 'Submit Voice Speech' : 'Speak Response'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Right Pane: Candidate Camera feed */}
        <Card className="flex flex-col h-full border border-slate-200/80 dark:border-slate-800 dark:bg-slate-900/60 p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/75 px-4 py-2 dark:border-slate-800 dark:bg-slate-900/40 shrink-0">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Candidate Webcam Feed</span>
            <button
              onClick={() => setIsWebcamActive(!isWebcamActive)}
              className="text-[10px] font-bold text-purple-600 hover:text-purple-500 focus:outline-none flex items-center gap-1"
            >
              {isWebcamActive ? (
                <>
                  <VideoOff size={12} />
                  Turn Camera Off
                </>
              ) : (
                <>
                  <Video size={12} />
                  Enable Camera
                </>
              )}
            </button>
          </div>

          <div className="flex-1 relative bg-slate-950 flex items-center justify-center">
            
            {/* Real Webcam video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 ${
                isWebcamActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            />

            {/* Webcam Fallback / Placeholder */}
            {!isWebcamActive && (
              <div className="flex flex-col items-center justify-center text-center space-y-3 z-10 p-6">
                <div className="h-16 w-16 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400">
                  <User size={32} />
                </div>
                <p className="text-sm font-semibold text-slate-250">Camera Feed Idle</p>
                <p className="text-xs text-slate-500 max-w-[200px]">
                  Turn on your camera for a more realistic mock environment.
                </p>
                {webcamError && (
                  <p className="text-[10px] text-red-400 flex items-center gap-1 bg-red-950/20 px-2 py-1 rounded border border-red-900/40">
                    <AlertCircle size={10} />
                    Camera access denied or unavailable.
                  </p>
                )}
                <Button size="sm" variant="outline" className="border-slate-700 hover:bg-slate-900 text-slate-300" onClick={() => setIsWebcamActive(true)}>
                  Enable Webcam
                </Button>
              </div>
            )}

            {/* Speaking level indicators */}
            {isSpeaking && (
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/70 border border-slate-800/60 px-4 py-2.5 rounded-xl backdrop-blur-md flex items-center gap-3">
                <Mic size={14} className="text-purple-500 animate-pulse shrink-0" />
                <div className="flex-1 flex gap-1 h-3 items-center">
                  {[...Array(12)].map((_, i) => (
                    <span
                      key={i}
                      className="w-1 bg-purple-500 rounded-full transition-all duration-150"
                      style={{
                        height: `${Math.floor(Math.random() * 10) + 2}px`
                      }}
                    ></span>
                  ))}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 animate-pulse shrink-0">
                  Recording Speech
                </span>
              </div>
            )}

          </div>

          <div className="bg-slate-50 border-t border-slate-100 p-4 dark:bg-slate-900/40 dark:border-slate-800 shrink-0 text-center">
            <p className="text-xs text-slate-400">
              Adjust your volume and position. AI evaluates answer scripts dynamically.
            </p>
          </div>
        </Card>

      </div>

    </div>
  );
};

export default InterviewRoom;
