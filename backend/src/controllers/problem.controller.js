import { Problem } from '../models/Problem.js';
import { ProblemProgress } from '../models/ProblemProgress.js';
import { Todo } from '../models/Todo.js';
import { mockProblems } from '../../../frontend/src/data/problems.js';

// Seed problems if pool is empty
export const seedProblemsIfEmpty = async () => {
  try {
    const list = await Problem.find({});
    if (list.length === 0) {
      console.log('🌱 Seeding default Dupilio problem catalog...');
      for (const p of mockProblems) {
        await Problem.create({
          _id: p.id,
          title: p.title,
          difficulty: p.difficulty,
          topic: p.topic,
          description: p.description,
          constraints: p.constraints || [],
          examples: p.examples || [],
          starterCode: p.starterCode || {},
          isSolved: false,
          platform: p.platform || 'LeetCode',
          externalUrl: p.externalUrl || `https://leetcode.com/problemset/all/?search=${encodeURIComponent(p.title)}`,
          companyTags: p.companyTags || ['Amazon', 'Google', 'Microsoft'],
          acceptanceRate: Math.round(45 + Math.random() * 35)
        });
      }
    }
  } catch (e) {
    console.error('⚠️ Problem seeding failed: ', e.message);
  }
};

// @desc    Get All Problems with topic, difficulty, platform, status filters
// @route   GET /api/v1/problems
// @access  Public / Private
export const getProblems = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { topic, difficulty, platform, status, search } = req.query;

    let query = {};
    if (topic && topic !== 'All') query.topic = topic;
    if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
    if (platform && platform !== 'All') query.platform = platform;

    let problems = await Problem.find(query);

    // Fetch user progress if user is authenticated
    let progressMap = new Map();
    if (userId) {
      const progresses = await ProblemProgress.find({ userId });
      progresses.forEach(pr => {
        progressMap.set(pr.problemId, pr);
      });
    }

    let enriched = problems.map(p => {
      const pr = progressMap.get(p._id) || progressMap.get(String(p._id));
      return {
        ...p,
        id: p._id,
        isSolved: pr ? pr.isSolved : false,
        isBookmarked: pr ? pr.isBookmarked : false,
        addedToTodo: pr ? pr.addedToTodo : false
      };
    });

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      enriched = enriched.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.topic.toLowerCase().includes(q) ||
        (p.companyTags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    if (status === 'solved') {
      enriched = enriched.filter(p => p.isSolved);
    } else if (status === 'unsolved') {
      enriched = enriched.filter(p => !p.isSolved);
    } else if (status === 'bookmarked') {
      enriched = enriched.filter(p => p.isBookmarked);
    }

    res.json({
      success: true,
      count: enriched.length,
      problems: enriched
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Single Problem
// @route   GET /api/v1/problems/:id
export const getProblem = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found.' });
    }

    let isSolved = false;
    let isBookmarked = false;

    if (userId) {
      const pr = await ProblemProgress.findOne({ userId, problemId: problem._id });
      if (pr) {
        isSolved = pr.isSolved;
        isBookmarked = pr.isBookmarked;
      }
    }

    res.json({
      success: true,
      problem: {
        ...problem,
        id: problem._id,
        isSolved,
        isBookmarked
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle solve state for current user
// @route   PUT /api/v1/problems/:id/solve
export const updateProblemState = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { isSolved } = req.body;

    const progress = await ProblemProgress.findOneAndUpdate(
      { userId, problemId: id },
      {
        $set: {
          isSolved: !!isSolved,
          solvedAt: isSolved ? new Date().toISOString() : null
        }
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      problemId: id,
      isSolved: progress.isSolved
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle bookmark state
// @route   PUT /api/v1/problems/:id/bookmark
export const toggleBookmark = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const existing = await ProblemProgress.findOne({ userId, problemId: id });
    const nextBookmarked = existing ? !existing.isBookmarked : true;

    const progress = await ProblemProgress.findOneAndUpdate(
      { userId, problemId: id },
      { $set: { isBookmarked: nextBookmarked } },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      problemId: id,
      isBookmarked: progress.isBookmarked
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add problem to Todo planner
// @route   POST /api/v1/problems/:id/add-to-todo
export const addProblemToTodo = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found.' });
    }

    const todo = await Todo.create({
      userId,
      title: `Practice: ${problem.title} (${problem.difficulty})`,
      description: `Solve ${problem.title} on ${problem.platform}. Topic: ${problem.topic}. Link: ${problem.externalUrl || ''}`,
      category: 'DSA',
      priority: problem.difficulty === 'Hard' ? 'urgent' : problem.difficulty === 'Medium' ? 'high' : 'medium',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      tags: [problem.topic, problem.difficulty, problem.platform],
      isCompleted: false
    });

    await ProblemProgress.findOneAndUpdate(
      { userId, problemId: id },
      { $set: { addedToTodo: true } },
      { upsert: true }
    );

    res.status(201).json({
      success: true,
      message: `"${problem.title}" added to your Todo Planner!`,
      todo
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit code solution for AI verification
// @route   POST /api/v1/problems/:id/submit
export const submitCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, language } = req.body;

    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found.' });
    }

    const { judgeCode } = await import('../services/ai.service.js');
    const evaluation = await judgeCode(problem.title, problem.topic, code, language);

    if (evaluation.status === 'Accepted') {
      await ProblemProgress.findOneAndUpdate(
        { userId: req.user._id, problemId: id },
        { $set: { isSolved: true, solvedAt: new Date().toISOString() } },
        { upsert: true }
      );
    }

    res.json({ success: true, evaluation });
  } catch (err) {
    next(err);
  }
};

export default {
  seedProblemsIfEmpty,
  getProblems,
  getProblem,
  updateProblemState,
  toggleBookmark,
  addProblemToTodo,
  submitCode
};
