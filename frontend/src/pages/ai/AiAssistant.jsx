import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import {
  Bot,
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  Calendar,
  ListTodo,
  Swords,
  Target,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ExternalLink,
  Code2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AiAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello ${user?.name?.split(' ')[0] || 'Coder'}! I'm your Dupilio AI Assistant. I can parse natural language commands, schedule contest reminders, build your daily study planner, or analyze your multi-platform profile ratings. What would you like to accomplish today?`,
      action: null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const quickPrompts = [
    {
      label: 'Contest Reminder',
      icon: <Swords size={13} />,
      prompt: 'Remind me 30 minutes before the next Codeforces contest via browser notification'
    },
    {
      label: 'Todo Practice Task',
      icon: <ListTodo size={13} />,
      prompt: 'Create a high priority task to solve 3 Dynamic Programming problems tomorrow'
    },
    {
      label: 'Weak Area Plan',
      icon: <Target size={13} />,
      prompt: 'Analyze my weak areas and plan a targeted preparation schedule'
    },
    {
      label: 'Upcoming Contests',
      icon: <Calendar size={13} />,
      prompt: 'What coding contests and hackathons are scheduled this week?'
    }
  ];

  const handleSend = async (customPrompt) => {
    const text = customPrompt || inputPrompt;
    if (!text || !text.trim() || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInputPrompt('');
    setLoading(true);

    try {
      // 1. Try action parser first to execute deterministic operations
      const actionRes = await api.executeAiAction(text.trim());
      
      let replyText = actionRes.reply || actionRes.message;
      let actionData = actionRes.action;
      let executionResult = actionRes.result;

      // 2. If it was purely conversational, fallback to copilot chat
      if (!replyText || actionData?.action === 'chat_fallback') {
        const chatRes = await api.chatCopilot(text.trim(), {
          user: user?.name,
          college: user?.college,
          role: user?.profile?.role
        });
        replyText = chatRes.reply || "I've analyzed your request. You can manage your tasks, upcoming contests, and preparation directly from the Dupilio dashboard.";
      }

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        action: actionData,
        result: executionResult,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('AI execution error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: "I processed your request, but hit a network issue reaching external services. You can also manually add tasks in the Todo Planner or set contest reminders in the Contests hub!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    if (!isListening) {
      recognition.start();
      setIsListening(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputPrompt(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleSpeak = (msgId, text) => {
    if (!('speechSynthesis' in window)) return;
    
    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white shadow-md shadow-indigo-500/20">
              <Bot size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Dupilio AI Copilot & Voice Agent
              </h1>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
            Execute real actions: schedule reminders, populate todo items, diagnose weak topics, and query contest calendars.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60 font-semibold">
          <Sparkles size={14} />
          <span>Backed by FastAPI & Deterministic Backend Validation</span>
        </div>
      </div>

      {/* Main Chat Container */}
      <Card className="flex flex-col h-[680px] overflow-hidden border-slate-200/80 dark:border-slate-800/80">
        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSpeaking = speakingMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                    isUser
                      ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                      : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
                  }`}
                >
                  {isUser ? user?.name?.[0] || 'U' : <Bot size={16} />}
                </div>

                {/* Message Body */}
                <div className="space-y-2">
                  <div
                    className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Action Executed Card (if any) */}
                    {msg.result && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 size={14} /> Action Executed in Node.js
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {msg.action?.action || 'platform_mutation'}
                          </span>
                        </div>

                        {msg.result.task && (
                          <div className="space-y-1">
                            <p className="font-bold text-slate-900 dark:text-white">
                              📝 {msg.result.task.title}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Category: {msg.result.task.category} • Priority: {msg.result.task.priority}
                            </p>
                            <Link
                              to="/todo"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-1 hover:underline"
                            >
                              Open Todo Planner <ArrowRight size={12} />
                            </Link>
                          </div>
                        )}

                        {msg.result.reminder && (
                          <div className="space-y-1">
                            <p className="font-bold text-slate-900 dark:text-white">
                              🔔 {msg.result.reminder.title}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Lead Time: {msg.result.reminder.leadTimeMinutes}m • Channel: {msg.result.reminder.channel}
                            </p>
                            <Link
                              to="/contests"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-1 hover:underline"
                            >
                              View in Contests Hub <ArrowRight size={12} />
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message timestamp and speak button */}
                  <div className={`flex items-center gap-2 text-[10px] text-slate-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleSpeak(msg.id, msg.text)}
                        className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${
                          isSpeaking ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''
                        }`}
                        title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                      >
                        <Volume2 size={12} className={isSpeaking ? 'animate-pulse' : ''} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-xl mr-auto">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                <Bot size={16} />
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-tl-none shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]"></div>
                  <span className="text-xs text-slate-400 ml-1">Executing action & synthesizing response...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick prompt suggestions */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
            <Lightbulb size={12} /> Prompts:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp.prompt)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-600 hover:text-indigo-600 whitespace-nowrap transition-all shadow-2xs"
            >
              <span className="text-indigo-500">{qp.icon}</span>
              <span>{qp.label}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-red-500 text-white border-red-600 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Click to speak'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <input
              type="text"
              placeholder={isListening ? 'Listening to voice...' : 'Type a command, e.g. "Remind me 30 mins before Codeforces contest" or ask a question...'}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />

            <Button
              type="submit"
              variant="primary"
              disabled={loading || !inputPrompt.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-500/20"
            >
              <Send size={16} />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default AiAssistant;
