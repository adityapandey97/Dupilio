import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Button from './common/Button';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Trophy,
  Calendar,
  ExternalLink,
  MessageSquare,
  Clock,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

export const AiHelper = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'contests'
  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! 👋 I'm your **Hierprep AI Copilot**.\n\nI can help you master DSA Patterns, explain Core CS subjects (OOPs, OS, DBMS), and keep you ahead on **upcoming Codeforces & LeetCode contests**. How can I help today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [contests, setContests] = useState([]);
  const [loadingContests, setLoadingContests] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      loadContests();
    }
  }, [isOpen, messages]);

  const loadContests = async () => {
    setLoadingContests(true);
    try {
      const data = await api.getContests();
      setContests(data || []);
    } catch (e) {
      console.error('Failed to load contests:', e);
    } finally {
      setLoadingContests(false);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || isTyping) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const res = await api.chatCopilot(messages, query, {
        name: user?.name,
        weakTopics: ['Dynamic Programming', 'Graph', 'Tree'],
        codingStats: user?.profile?.codingStats
      });

      setMessages(prev => [
        ...prev,
        {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          text: res.reply || 'Here is what I found for your prep!'
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'ai',
          text: '⚠️ Unable to connect to AI Assistant. Please check backend connection.'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    '🏆 What contests are this weekend?',
    '💡 Explain Sliding Window pattern',
    '⚡ Quick review for OOPs Polymorphism',
    '🎯 How to optimize Dynamic Programming space?'
  ];

  return (
    <>
      {/* Floating Action Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-600/30 hover:scale-105 transition-all duration-200 focus:outline-none"
        >
          {isOpen ? <X size={24} /> : <Bot size={26} className="group-hover:rotate-12 transition-transform" />}
          
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[9px] font-bold text-white items-center justify-center">
                AI
              </span>
            </span>
          )}
        </button>
      </div>

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-32px)] h-[560px] rounded-2xl bg-white shadow-2xl border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 flex flex-col overflow-hidden animate-fade-in text-left">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-none">Hierprep AI Copilot</h3>
                <span className="text-[10px] text-purple-200">Placement & Contest Assistant</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-purple-200 hover:text-white hover:bg-white/10"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'chat'
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <MessageSquare size={14} />
              AI Chat
            </button>
            <button
              onClick={() => setActiveTab('contests')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'contests'
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <Trophy size={14} />
              Contest Hub
              {contests.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 text-[10px]">
                  {contests.length}
                </span>
              )}
            </button>
          </div>

          {/* Body Area */}
          {activeTab === 'chat' ? (
            <div className="flex-1 flex flex-col overflow-hidden p-3 bg-slate-50/30 dark:bg-slate-950/20">
              
              {/* Messages scroll */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-purple-600 text-white rounded-br-xs'
                          : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 rounded-bl-xs shadow-xs'
                      }`}
                    >
                      <p className="whitespace-pre-line">{m.text}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-3 shadow-xs flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="pt-2 pb-1 overflow-x-auto flex gap-1.5 no-scrollbar shrink-0">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(qp)}
                    className="whitespace-nowrap text-[10px] font-semibold px-2 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-purple-400 hover:text-purple-600 transition-colors"
                  >
                    {qp}
                  </button>
                ))}
              </div>

              {/* Input row */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0"
              >
                <input
                  type="text"
                  placeholder="Ask DSA patterns, contests, or concepts..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 text-white disabled:opacity-50 hover:bg-purple-700 transition-colors shrink-0"
                >
                  <Send size={14} />
                </button>
              </form>

            </div>
          ) : (
            /* Contests Tab */
            <div className="flex-1 flex flex-col p-3 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Upcoming Coding Contests
                </span>
                <button
                  onClick={loadContests}
                  className="text-xs text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1 hover:underline"
                >
                  <RefreshCw size={12} className={loadingContests ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>

              <div className="space-y-2.5">
                {contests.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40 hover:border-purple-200 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.platform === 'Codeforces'
                          ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                          : c.platform === 'LeetCode'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      }`}>
                        {c.platform}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock size={11} />
                        {c.durationMinutes} mins
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                      {c.name}
                    </h4>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {c.startTime}
                      </span>
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400"
                      >
                        Register
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[11px] text-slate-400">
                  Tip: Ask the AI Copilot for speed strategies before participating!
                </p>
              </div>
            </div>
          )}

        </div>
      )}
    </>
  );
};

export default AiHelper;
