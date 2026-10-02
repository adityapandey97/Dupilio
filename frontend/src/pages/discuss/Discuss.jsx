import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { api } from '../../services/api';
import {
  MessageSquare,
  ThumbsUp,
  Eye,
  Plus,
  Search,
  Sparkles,
  Building2,
  Tag,
  Clock,
  User,
  Filter,
  Share2,
  ChevronRight,
  Flame,
  Send,
  HelpCircle
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'OA Leaks',
  'Interview Experience',
  'DSA Solutions',
  'System Design',
  'General Doubt'
];

const COMPANIES = [
  'All',
  'Amazon',
  'Google',
  'Microsoft',
  'Uber',
  'Goldman Sachs',
  'Atlassian',
  'TCS'
];

export const Discuss = () => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDiscussion, setActiveDiscussion] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');
  
  // Create Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('OA Leaks');
  const [newCompany, setNewCompany] = useState('Amazon');
  const [newTags, setNewTags] = useState('');
  
  // AI Summary Modal states
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [activeSummary, setActiveSummary] = useState('');
  const [summarizing, setSummarizing] = useState(false);

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedCompany !== 'All') params.company = selectedCompany;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.getDiscussions(params);
      if (res.discussions) {
        setDiscussions(res.discussions);
      }
    } catch (err) {
      console.error('Failed to fetch discussions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, [selectedCategory, selectedCompany]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDiscussions();
  };

  const handleUpvote = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await api.upvoteDiscussion(id);
      if (res.upvotes !== undefined) {
        setDiscussions(prev => prev.map(d => d.id === id ? { ...d, upvotes: res.upvotes } : d));
        if (activeDiscussion && activeDiscussion.id === id) {
          setActiveDiscussion(prev => ({ ...prev, upvotes: res.upvotes }));
        }
      }
    } catch (err) {
      console.error('Upvote failed:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeDiscussion) return;

    try {
      const res = await api.addDiscussionComment(activeDiscussion.id, newCommentText.trim());
      if (res.success && res.comment) {
        const updatedComments = [...(activeDiscussion.comments || []), res.comment];
        setActiveDiscussion(prev => ({ ...prev, comments: updatedComments }));
        setDiscussions(prev => prev.map(d => d.id === activeDiscussion.id ? { ...d, comments: updatedComments } : d));
        setNewCommentText('');
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const tagsArray = newTags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    try {
      const res = await api.createDiscussion({
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        company: newCompany,
        tags: tagsArray.length ? tagsArray : ['Placement']
      });

      if (res.success && res.discussion) {
        setDiscussions(prev => [res.discussion, ...prev]);
        setIsCreateModalOpen(false);
        setNewTitle('');
        setNewContent('');
        setNewTags('');
      }
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const handleOpenSummary = async (disc, e) => {
    e.stopPropagation();
    setActiveSummary('');
    setSummaryModalOpen(true);
    setSummarizing(true);
    try {
      const res = await api.summarizeDiscussion(disc.id);
      setActiveSummary(res.summary || disc.aiSummary);
    } catch (err) {
      setActiveSummary(disc.aiSummary || 'Summary: Discussion covers key algorithmic strategies and OA traps.');
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Title & Post Trigger */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
              <MessageSquare size={12} />
              Community Knowledge Hub
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Community Discuss & Leaked OA Rounds
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Live candidate interview debriefs, leaked company OA patterns from Reddit/LeetCode, solution analyses, and peer questions.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          icon={<Plus size={16} />}
        >
          New Discussion Post
        </Button>
      </div>

      {/* Filter Bar: Category Tabs + Search + Company Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {CATEGORIES.map((cat) => {
            const isCatActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  isCatActive
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Company Filter & Search */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 outline-none"
          >
            {COMPANIES.map(c => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Companies' : c}
              </option>
            ))}
          </select>

          <form onSubmit={handleSearchSubmit} className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 outline-none w-44 focus:w-56 transition-all"
            />
          </form>
        </div>

      </div>

      {/* Main Content: Discussion Posts List */}
      <div className="grid gap-4">
        {loading ? (
          <Card className="p-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
            <p className="text-xs text-slate-400">Loading live community threads...</p>
          </Card>
        ) : discussions.length === 0 ? (
          <Card className="p-12 text-center space-y-3">
            <MessageSquare size={32} className="mx-auto text-slate-400" />
            <h3 className="font-bold text-slate-700 dark:text-slate-200">No discussions match your filter</h3>
            <p className="text-xs text-slate-400">Be the first to post an OA report or question in this topic!</p>
          </Card>
        ) : (
          discussions.map((disc) => (
            <Card
              key={disc.id}
              onClick={() => setActiveDiscussion(disc)}
              className="cursor-pointer hover:border-purple-500/50 hover:shadow-md transition-all p-5 space-y-3"
            >
              {/* Header meta */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md font-bold text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    {disc.category}
                  </span>
                  {disc.company && disc.company !== 'General' && (
                    <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                      <Building2 size={12} className="text-slate-400" />
                      {disc.company}
                    </span>
                  )}
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">Posted by @{disc.author?.name || 'Candidate'}</span>
                </div>

                {/* AI Summary button */}
                <button
                  type="button"
                  onClick={(e) => handleOpenSummary(disc, e)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 transition-colors"
                >
                  <Sparkles size={12} />
                  AI Summary
                </button>
              </div>

              {/* Title & Preview */}
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  {disc.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {disc.content}
                </p>
              </div>

              {/* Tags & Action Metrics */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-850 text-xs text-slate-500">
                <div className="flex flex-wrap gap-1.5">
                  {disc.tags?.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={(e) => handleUpvote(disc.id, e)}
                    className="flex items-center gap-1 hover:text-purple-600 transition-colors font-bold"
                  >
                    <ThumbsUp size={13} />
                    <span>{disc.upvotes || 0}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <MessageSquare size={13} />
                    <span>{disc.comments?.length || 0} comments</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-70">
                    <Eye size={13} />
                    <span>{disc.views || 0}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Discussion Details & Comments Modal */}
      {activeDiscussion && (
        <Modal
          isOpen={Boolean(activeDiscussion)}
          onClose={() => setActiveDiscussion(null)}
          title={activeDiscussion.title}
        >
          <div className="space-y-6 text-left">
            {/* Meta tags */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  {activeDiscussion.category}
                </span>
                <span>•</span>
                <span>Company: {activeDiscussion.company || 'General'}</span>
                <span>•</span>
                <span className="text-slate-400">Author: {activeDiscussion.author?.name}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handleUpvote(activeDiscussion.id, e)}
                icon={<ThumbsUp size={12} />}
              >
                Upvote ({activeDiscussion.upvotes || 0})
              </Button>
            </div>

            {/* Content Body */}
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              {activeDiscussion.content}
            </div>

            {/* AI Summary Highlight */}
            {activeDiscussion.aiSummary && (
              <div className="p-3.5 rounded-xl bg-purple-50 text-purple-900 dark:bg-purple-950/40 dark:text-purple-200 border border-purple-200 dark:border-purple-850 text-xs">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-purple-700 dark:text-purple-300">
                  <Sparkles size={14} />
                  AI Discussion Takeaways:
                </div>
                <p>{activeDiscussion.aiSummary}</p>
              </div>
            )}

            {/* Comments Thread */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Community Comments ({activeDiscussion.comments?.length || 0})
              </h4>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {activeDiscussion.comments?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No comments yet. Share your experience or thoughts below!</p>
                ) : (
                  activeDiscussion.comments?.map((c) => (
                    <div key={c.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span>@{c.author}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{c.createdAt}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Join the discussion or ask a doubt..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Button type="submit" size="sm" icon={<Send size={12} />}>
                  Reply
                </Button>
              </form>
            </div>
          </div>
        </Modal>
      )}

      {/* AI Summary Modal */}
      <Modal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        title="AI Discussion Intelligence & Takeaways"
      >
        <div className="space-y-4 text-left text-xs">
          {summarizing ? (
            <div className="p-8 text-center space-y-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-200 border-t-purple-600 mx-auto"></div>
              <p className="text-slate-400">Synthesizing discussion points & OA traps with AI...</p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-850 space-y-2 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 text-purple-700 dark:text-purple-300">
                <Sparkles size={14} />
                Key Discussion Takeaways:
              </div>
              <p>{activeSummary}</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Create New Discussion Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Share an Interview Experience or OA Round Question"
      >
        <form onSubmit={handleCreatePost} className="space-y-4 text-left">
          <Input
            label="Post Title"
            placeholder="e.g. Amazon 2026 SDE-1 OA Experience & Sliding Window Trap"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
              >
                {CATEGORIES.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Company Tag
              </label>
              <select
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
              >
                {COMPANIES.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Discussion Content (Markdown & Code Supported)
            </label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Describe the interview questions, difficulty, edge cases, or your doubt in detail..."
              className="w-full h-36 p-3 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200"
              required
            />
          </div>

          <Input
            label="Tags (Comma separated)"
            placeholder="e.g. Amazon, MonotonicQueue, OA-2026"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3 border-t dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Publish Post
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Discuss;
