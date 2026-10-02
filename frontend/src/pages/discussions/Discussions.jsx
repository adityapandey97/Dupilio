import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import {
  MessageSquare,
  Plus,
  ThumbsUp,
  Bookmark,
  MessageCircle,
  Search,
  Sparkles,
  Tag,
  Share2,
  ChevronDown,
  ChevronUp,
  Send,
  User,
  Flame,
  Clock,
  Trash2
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Competitive Programming',
  'DSA',
  'Hackathons',
  'Development',
  'Interview Experience',
  'System Design',
  'General'
];

export const Discussions = () => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('trending'); // trending, newest
  const [searchQuery, setSearchQuery] = useState('');
  
  // Expanded post for comments / full view
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});

  // Create post modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Competitive Programming');
  const [newTags, setNewTags] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const data = await api.getDiscussions({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        sortBy,
        search: searchQuery
      });
      setDiscussions(data || []);
    } catch (err) {
      console.error('Failed to load discussions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, [selectedCategory, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDiscussions();
  };

  const handleUpvote = async (id, e) => {
    e.stopPropagation();
    try {
      // Optimistic update
      setDiscussions(prev => prev.map(p => {
        if ((p._id || p.id) === id) {
          const hasUpvoted = (p.upvotedBy || []).includes(user?._id || 'guest');
          const newUpvotes = hasUpvoted ? p.upvotes - 1 : p.upvotes + 1;
          const newUpvotedBy = hasUpvoted
            ? (p.upvotedBy || []).filter(u => u !== (user?._id || 'guest'))
            : [...(p.upvotedBy || []), user?._id || 'guest'];
          return { ...p, upvotes: newUpvotes, upvotedBy: newUpvotedBy };
        }
        return p;
      }));
      await api.upvoteDiscussion(id);
    } catch (err) {
      console.error('Failed to upvote discussion:', err);
      fetchDiscussions();
    }
  };

  const handleBookmark = async (id, e) => {
    e.stopPropagation();
    try {
      setDiscussions(prev => prev.map(p => {
        if ((p._id || p.id) === id) {
          const hasBookmarked = (p.bookmarkedBy || []).includes(user?._id || 'guest');
          const newCount = hasBookmarked ? (p.bookmarksCount || 1) - 1 : (p.bookmarksCount || 0) + 1;
          const newBookmarkedBy = hasBookmarked
            ? (p.bookmarkedBy || []).filter(u => u !== (user?._id || 'guest'))
            : [...(p.bookmarkedBy || []), user?._id || 'guest'];
          return { ...p, bookmarksCount: Math.max(0, newCount), bookmarkedBy: newBookmarkedBy };
        }
        return p;
      }));
      await api.bookmarkDiscussion(id);
    } catch (err) {
      console.error('Failed to bookmark discussion:', err);
    }
  };

  const handleAddComment = async (id) => {
    const text = commentInputs[id];
    if (!text || !text.trim()) return;

    try {
      setSubmittingComment(prev => ({ ...prev, [id]: true }));
      const res = await api.addDiscussionComment(id, text.trim());
      
      setDiscussions(prev => prev.map(p => {
        if ((p._id || p.id) === id) {
          const updatedComments = res.discussion?.comments || [
            ...(p.comments || []),
            { author: user?.name || 'You', text: text.trim(), createdAt: 'Just now' }
          ];
          return { ...p, comments: updatedComments };
        }
        return p;
      }));

      setCommentInputs(prev => ({ ...prev, [id]: '' }));
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setSubmittingComment(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      setSubmittingPost(true);
      await api.createDiscussion({
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        tags: newTags.split(',').map(t => t.trim()).filter(Boolean)
      });

      setIsModalOpen(false);
      setNewTitle('');
      setNewContent('');
      setNewTags('');
      fetchDiscussions();
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setSubmittingPost(false);
    }
  };

  const categoryBadgeColors = {
    'Competitive Programming': 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/50',
    DSA: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/50',
    Hackathons: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/50',
    Development: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/50',
    'Interview Experience': 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/50',
    'System Design': 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200/50',
    General: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
              <MessageSquare size={24} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Community Discussions
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
            Share competitive programming techniques, open source grants, and algorithm strategies.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus size={16} />
          Start Discussion
        </Button>
      </div>

      {/* Categories Bar & Search */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Categories pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort & Search */}
          <div className="flex items-center gap-2.5">
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-900 text-xs">
              <button
                onClick={() => setSortBy('trending')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all ${
                  sortBy === 'trending' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                <Flame size={13} />
                Trending
              </button>
              <button
                onClick={() => setSortBy('newest')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all ${
                  sortBy === 'newest' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                <Clock size={13} />
                Newest
              </button>
            </div>

            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search topics or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-44"
              />
            </form>
          </div>
        </div>
      </Card>

      {/* Discussion Posts */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading discussions...</p>
        </div>
      ) : discussions.length === 0 ? (
        <div className="py-16 text-center">
          <MessageSquare size={36} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No discussions found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Be the first to start a conversation in this topic!
          </p>
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            className="mt-4 text-xs py-2 bg-indigo-600 text-white"
          >
            Start Discussion
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {discussions.map((post) => {
            const id = post._id || post.id;
            const isExpanded = expandedPostId === id;
            const hasUpvoted = (post.upvotedBy || []).includes(user?._id || 'guest');
            const hasBookmarked = (post.bookmarkedBy || []).includes(user?._id || 'guest');

            return (
              <Card
                key={id}
                className="p-5 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700"
              >
                {/* Author & Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {(post.author?.name || 'User').split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          {post.author?.name || 'Community Member'}
                        </span>
                        {post.author?.college && (
                          <span className="text-[11px] text-slate-400">
                            • {post.author.college}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently'}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${categoryBadgeColors[post.category] || categoryBadgeColors.General}`}>
                    {post.category}
                  </span>
                </div>

                {/* Title */}
                <h2
                  onClick={() => setExpandedPostId(isExpanded ? null : id)}
                  className="text-base font-extrabold text-slate-900 dark:text-white mt-3 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {post.title}
                </h2>

                {/* AI Summary Banner (if present) */}
                {post.aiSummary && (
                  <div className="mt-2.5 p-3 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-200/50 dark:border-indigo-800/40 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300 mb-1">
                      <Sparkles size={14} className="text-indigo-500" />
                      <span>AI Key Insights</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      {post.aiSummary}
                    </p>
                  </div>
                )}

                {/* Post Content */}
                <div className={`mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line ${
                  !isExpanded ? 'line-clamp-3' : ''
                }`}>
                  {post.content}
                </div>

                {post.content && post.content.length > 250 && (
                  <button
                    onClick={() => setExpandedPostId(isExpanded ? null : id)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1 hover:underline"
                  >
                    {isExpanded ? (
                      <>Show less <ChevronUp size={13} /></>
                    ) : (
                      <>Read full post <ChevronDown size={13} /></>
                    )}
                  </button>
                )}

                {/* Tags */}
                {Array.isArray(post.tags) && post.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-800/70">
                  <div className="flex items-center gap-3">
                    {/* Upvote Button */}
                    <button
                      onClick={(e) => handleUpvote(id, e)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        hasUpvoted
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <ThumbsUp size={13} />
                      <span>{post.upvotes || 0}</span>
                    </button>

                    {/* Bookmark Button */}
                    <button
                      onClick={(e) => handleBookmark(id, e)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        hasBookmarked
                          ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Bookmark size={13} className={hasBookmarked ? 'fill-amber-500' : ''} />
                      <span>{post.bookmarksCount || 0}</span>
                    </button>

                    {/* Comments Toggle */}
                    <button
                      onClick={() => setExpandedPostId(isExpanded ? null : id)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <MessageCircle size={13} />
                      <span>{(post.comments || []).length} Replies</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {post.views || 0} views
                  </span>
                </div>

                {/* Comments Section (Expanded) */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Discussion Thread ({(post.comments || []).length})
                    </h4>

                    {/* Comment list */}
                    {(post.comments || []).length === 0 ? (
                      <p className="text-xs text-slate-400 py-2">No comments yet. Start the discussion!</p>
                    ) : (
                      <div className="space-y-2">
                        {post.comments.map((comm, idx) => (
                          <div
                            key={comm.id || idx}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs"
                          >
                            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                              <span className="font-bold text-slate-700 dark:text-slate-300">
                                {comm.author || 'User'}
                              </span>
                              <span>{comm.createdAt || 'Just now'}</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300">{comm.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add comment input */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Add a constructive insight or query..."
                        value={commentInputs[id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(id);
                        }}
                        className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                      <Button
                        variant="primary"
                        onClick={() => handleAddComment(id)}
                        disabled={submittingComment[id] || !commentInputs[id]?.trim()}
                        className="text-xs py-1.5 px-3 bg-indigo-600 text-white flex items-center gap-1.5"
                      >
                        <Send size={13} />
                        Reply
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* New Discussion Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Start a Community Discussion"
      >
        <form onSubmit={handleCreatePost} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
              Topic Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Optimal strategies to master Dynamic Programming on trees"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                {CATEGORIES.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="Trees, DP, Algorithms"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
              Content / Experience / Strategy *
            </label>
            <textarea
              rows={6}
              required
              placeholder="Share concrete steps, code patterns, contest learnings, or interview reflections..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white font-mono text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submittingPost}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {submittingPost ? 'Publishing...' : 'Publish Discussion'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Discussions;
