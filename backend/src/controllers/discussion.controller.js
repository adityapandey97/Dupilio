import { Discussion } from '../models/Discussion.js';

const INITIAL_DISCUSSIONS = [
  {
    title: 'How I reached 1900+ Rating on Codeforces (Roadmap & Speed Tips)',
    content: `Here is the practical roadmap to break into Candidate Master on Codeforces:
1. **Speed on Div 2 A and B**: You must solve A and B within the first 15-20 minutes. Practice implementation speed on 800-1100 rated problems.
2. **Greedy & Constructive Algorithms**: Div 2 C is almost always greedy, constructive algorithms, or prefix sums. Prove your invariant rather than guessing.
3. **Number Theory & Binary Search on Answer**: Div 2 D frequently combines binary search with checking functions or modular arithmetic.
4. **Never skip virtual contests**: Treat virtual contests exactly like live contests without looking at solutions until time expires.`,
    author: { name: 'Aditya Pandey', email: 'aditya@example.com', college: 'NIT' },
    category: 'Competitive Programming',
    company: 'General',
    tags: ['Codeforces', 'CompetitiveProgramming', 'RatingGuide', 'Algorithms'],
    upvotes: 248,
    upvotedBy: [],
    views: 1420,
    bookmarksCount: 64,
    bookmarkedBy: [],
    reportsCount: 0,
    aiSummary: 'Practical strategy for reaching Candidate Master: optimize Div 2 A/B speed to under 20 mins, focus on constructive greedy patterns for C, and commit to unpaused virtual contests.',
    comments: [
      {
        id: 'c1',
        author: 'Siddharth Sharma',
        text: 'The advice on proving the invariant before writing code on Problem C changed my contest trajectory completely.',
        createdAt: '2 days ago'
      }
    ]
  },
  {
    title: 'Top Open Source Programs for College Students in 2026 (GSoC, LFX, MLH)',
    content: `If you want to build exceptional real-world software engineering depth and earn valuable stipends, open source is unmatched.
- **GSoC (Google Summer of Code)**: Organizations announce in February. Start communicating on their mailing lists/Slack now! Pick small "good-first-issue" PRs.
- **LFX Mentorship**: Offered three times a year by Linux Foundation (Cloud Native, Kubernetes, Prometheus). High stipend and direct mentorship.
- **MLH Fellowship**: Excellent 12-week remote fellowship focusing on open-source contributions with top tech companies.`,
    author: { name: 'Ananya Iyer', email: 'ananya@example.com', college: 'BITS Pilani' },
    category: 'Hackathons',
    company: 'Open Source',
    tags: ['GSoC', 'LFX', 'OpenSource', 'Mentorship', 'Students'],
    upvotes: 312,
    upvotedBy: [],
    views: 2150,
    bookmarksCount: 95,
    bookmarkedBy: [],
    reportsCount: 0,
    aiSummary: 'Overview of premier student open source programs including GSoC, LFX Mentorship, and MLH Fellowship. Key recommendation is early community engagement on good-first-issues.',
    comments: []
  },
  {
    title: 'Graph Traversal Traps: When Dijkstra Fails and BFS is Sufficient',
    content: `A recurring mistake in online assessments and contests is applying Dijkstra on unweighted or unit-weight graphs.
1. **Unit Weight**: Always use standard BFS with an ordinary Queue. O(V + E) beats O((V + E) log V) and avoids priority queue overhead.
2. **0-1 Weights**: Use 0-1 BFS with a deque (\`std::deque\` or two pointers). Push 0-weight edges to the front, 1-weight edges to the back. Strict O(V + E) runtime!
3. **Negative Weights**: Dijkstra will give wrong answers or enter infinite cycles. Use Bellman-Ford or SPFA.`,
    author: { name: 'Rohan Mehta', email: 'rohan@example.com', college: 'NIT Trichy' },
    category: 'DSA',
    company: 'General',
    tags: ['Graphs', 'Dijkstra', 'BFS', '01BFS', 'Optimization'],
    upvotes: 189,
    upvotedBy: [],
    views: 980,
    bookmarksCount: 42,
    bookmarkedBy: [],
    reportsCount: 0,
    aiSummary: 'Algorithmic performance guidelines for shortest path problems: use 0-1 BFS with a double-ended queue for 0/1 graphs, standard BFS for unit weights, and avoid Dijkstra on negative edges.',
    comments: []
  }
];

export const getDiscussions = async (req, res, next) => {
  try {
    const { category, search, sortBy } = req.query;
    let posts = await Discussion.find({});

    if (posts.length === 0) {
      for (const item of INITIAL_DISCUSSIONS) {
        await Discussion.create(item);
      }
      posts = await Discussion.find({});
    }

    let filtered = [...posts];

    if (category && category !== 'All') {
      filtered = filtered.filter(p => p.category === category);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        (p.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else {
      filtered.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    }

    res.json({
      success: true,
      count: filtered.length,
      discussions: filtered.map(d => ({ ...d, id: d._id }))
    });
  } catch (err) {
    next(err);
  }
};

export const getDiscussionById = async (req, res, next) => {
  try {
    const post = await Discussion.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Discussion post not found.' });
    }

    await Discussion.findByIdAndUpdate(req.params.id, { $set: { views: (post.views || 0) + 1 } });
    res.json({ success: true, discussion: { ...post, id: post._id, views: (post.views || 0) + 1 } });
  } catch (err) {
    next(err);
  }
};

export const createDiscussion = async (req, res, next) => {
  try {
    const { title, content, category, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const post = await Discussion.create({
      title,
      content,
      category: category || 'General',
      tags: Array.isArray(tags) ? tags : ['Discussion'],
      author: {
        userId: req.user?._id || '',
        name: req.user?.name || 'Developer',
        email: req.user?.email || '',
        college: req.user?.college || 'Engineering Institute'
      },
      upvotes: 1,
      upvotedBy: [String(req.user?._id || 'author')],
      views: 1,
      bookmarksCount: 0,
      bookmarkedBy: [],
      reportsCount: 0,
      comments: []
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully.',
      discussion: { ...post, id: post._id }
    });
  } catch (err) {
    next(err);
  }
};

export const upvoteDiscussion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = String(req.user?._id || 'anon');
    const post = await Discussion.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Discussion not found.' });
    }

    let upvotedBy = Array.isArray(post.upvotedBy) ? [...post.upvotedBy] : [];
    let upvotes = post.upvotes || 0;

    if (upvotedBy.includes(userId)) {
      upvotedBy = upvotedBy.filter(u => u !== userId);
      upvotes = Math.max(0, upvotes - 1);
    } else {
      upvotedBy.push(userId);
      upvotes += 1;
    }

    const updated = await Discussion.findByIdAndUpdate(id, { $set: { upvotes, upvotedBy } }, { new: true });
    res.json({ success: true, upvotes: updated.upvotes, hasUpvoted: upvotedBy.includes(userId) });
  } catch (err) {
    next(err);
  }
};

export const bookmarkDiscussion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = String(req.user?._id || 'anon');
    const post = await Discussion.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Discussion not found.' });
    }

    let bookmarkedBy = Array.isArray(post.bookmarkedBy) ? [...post.bookmarkedBy] : [];
    let bookmarksCount = post.bookmarksCount || 0;

    if (bookmarkedBy.includes(userId)) {
      bookmarkedBy = bookmarkedBy.filter(u => u !== userId);
      bookmarksCount = Math.max(0, bookmarksCount - 1);
    } else {
      bookmarkedBy.push(userId);
      bookmarksCount += 1;
    }

    const updated = await Discussion.findByIdAndUpdate(id, { $set: { bookmarksCount, bookmarkedBy } }, { new: true });
    res.json({ success: true, bookmarksCount: updated.bookmarksCount, hasBookmarked: bookmarkedBy.includes(userId) });
  } catch (err) {
    next(err);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required.' });
    }

    const post = await Discussion.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Discussion not found.' });
    }

    const comment = {
      id: `comm-${Date.now()}`,
      author: req.user?.name || 'Developer',
      college: req.user?.college || '',
      text: text.trim(),
      createdAt: 'Just now'
    };

    const comments = [...(post.comments || []), comment];
    await Discussion.findByIdAndUpdate(id, { $set: { comments } });

    res.json({ success: true, comment, commentsCount: comments.length });
  } catch (err) {
    next(err);
  }
};

export const deleteDiscussion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Discussion.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    if (post.author?.userId && String(post.author.userId) !== String(req.user._id) && req.user.profile?.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this post.' });
    }

    await Discussion.findByIdAndDelete(id);
    res.json({ success: true, message: 'Post removed successfully.' });
  } catch (err) {
    next(err);
  }
};

export default {
  getDiscussions,
  getDiscussionById,
  createDiscussion,
  upvoteDiscussion,
  bookmarkDiscussion,
  addComment,
  deleteDiscussion
};
