import { Todo } from '../models/Todo.js';

// @desc    Get all user todos with category, priority, and date filters
// @route   GET /api/v1/todos
export const getTodos = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { category, priority, view } = req.query;

    let query = { userId };
    if (category && category !== 'All') {
      query.category = category;
    }
    if (priority && priority !== 'All') {
      query.priority = priority.toLowerCase();
    }

    let todos = await Todo.find(query);

    // Initial starter todos if user has none
    if (todos.length === 0 && !category && !priority) {
      const sampleTodos = [
        {
          userId,
          title: 'Solve 3 Dynamic Programming problems (Coin Change & LIS)',
          description: 'Focus on identifying optimal substructure and state formulation.',
          priority: 'high',
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          category: 'DSA',
          tags: ['DP', 'Placement', 'Medium'],
          isCompleted: false
        },
        {
          userId,
          title: 'Register & participate in Codeforces Round 976',
          description: 'Solve first 3 problems within 45 minutes.',
          priority: 'urgent',
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
          category: 'Competitive Programming',
          tags: ['Contest', 'Codeforces'],
          isCompleted: false
        },
        {
          userId,
          title: 'Review Operating System Virtual Memory & Paging',
          description: 'Understand TLB hit/miss and Page Replacement Algorithms (LRU, FIFO).',
          priority: 'medium',
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          category: 'OS',
          tags: ['CoreCS', 'Revision'],
          isCompleted: false
        },
        {
          userId,
          title: 'Push Dupilio portfolio updates to GitHub repository',
          description: 'Document architecture and update project README.',
          priority: 'low',
          dueDate: new Date(Date.now() + 86400000 * 4).toISOString(),
          category: 'GitHub',
          tags: ['OpenSource', 'Portfolio'],
          isCompleted: true,
          completedAt: new Date().toISOString()
        }
      ];

      for (const t of sampleTodos) {
        await Todo.create(t);
      }
      todos = await Todo.find(query);
    }

    // Apply view filters
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (view === 'today') {
      todos = todos.filter(t => t.dueDate?.startsWith(todayStr));
    } else if (view === 'overdue') {
      todos = todos.filter(t => !t.isCompleted && new Date(t.dueDate) < now && !t.dueDate?.startsWith(todayStr));
    } else if (view === 'upcoming') {
      todos = todos.filter(t => !t.isCompleted && new Date(t.dueDate) > now);
    } else if (view === 'completed') {
      todos = todos.filter(t => t.isCompleted);
    }

    // Sort by dueDate
    todos.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    const allUserTodos = await Todo.find({ userId });
    const stats = {
      total: allUserTodos.length,
      completed: allUserTodos.filter(t => t.isCompleted).length,
      pending: allUserTodos.filter(t => !t.isCompleted).length,
      overdue: allUserTodos.filter(t => !t.isCompleted && new Date(t.dueDate) < now && !t.dueDate?.startsWith(todayStr)).length,
      today: allUserTodos.filter(t => t.dueDate?.startsWith(todayStr)).length
    };

    res.json({
      success: true,
      count: todos.length,
      todos,
      stats
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new task
// @route   POST /api/v1/todos
export const createTodo = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { title, description, priority, dueDate, category, tags, isRecurring, recurringInterval } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }

    const todo = await Todo.create({
      userId,
      title: title.trim(),
      description: description || '',
      priority: priority || 'medium',
      dueDate: dueDate || new Date(Date.now() + 86400000).toISOString(),
      category: category || 'DSA',
      tags: Array.isArray(tags) ? tags : [],
      isRecurring: !!isRecurring,
      recurringInterval: recurringInterval || 'none',
      isCompleted: false
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      todo
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a task
// @route   PUT /api/v1/todos/:id
export const updateTodo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const existing = await Todo.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    if (existing.userId !== userId && req.user.profile?.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this task.' });
    }

    const updated = await Todo.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    res.json({ success: true, message: 'Task updated successfully.', todo: updated });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle complete status
// @route   PUT /api/v1/todos/:id/toggle
export const toggleComplete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Todo.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const nextCompleted = !existing.isCompleted;
    const updated = await Todo.findByIdAndUpdate(id, {
      $set: {
        isCompleted: nextCompleted,
        completedAt: nextCompleted ? new Date().toISOString() : null
      }
    }, { new: true });

    res.json({ success: true, isCompleted: updated.isCompleted, todo: updated });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a task
// @route   DELETE /api/v1/todos/:id
export const deleteTodo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Todo.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await Todo.findByIdAndDelete(id);
    res.json({ success: true, message: 'Task removed successfully.' });
  } catch (err) {
    next(err);
  }
};

export default {
  getTodos,
  createTodo,
  updateTodo,
  toggleComplete,
  deleteTodo
};
