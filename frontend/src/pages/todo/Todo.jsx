import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import {
  ListTodo,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  AlertCircle,
  Tag,
  Trash2,
  Edit2,
  Sparkles,
  Filter,
  CheckSquare,
  Flame,
  ArrowRight
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'DSA',
  'Competitive Programming',
  'Development',
  'Projects',
  'DBMS',
  'OS',
  'CN',
  'OOP',
  'System Design',
  'GitHub',
  'Career'
];

const PRIORITIES = ['All', 'Urgent', 'High', 'Medium', 'Low'];

export const Todo = () => {
  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, overdue: 0, today: 0 });
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('all'); // all, today, upcoming, overdue, completed
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'DSA',
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    tags: '',
    recurringInterval: 'none'
  });
  const [submitting, setSubmitting] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeView !== 'all') params.view = activeView;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedPriority !== 'All') params.priority = selectedPriority;

      const data = await api.getTodos(params);
      if (data && data.todos) {
        setTodos(data.todos);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load todos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [activeView, selectedCategory, selectedPriority]);

  const handleToggle = async (id) => {
    try {
      // Optimistic update
      setTodos(prev => prev.map(t => {
        if ((t._id || t.id) === id) {
          const isDone = !t.isCompleted;
          return { ...t, isCompleted: isDone, completedAt: isDone ? new Date().toISOString() : null };
        }
        return t;
      }));
      await api.toggleTodo(id);
      fetchTodos();
    } catch (err) {
      console.error('Failed to toggle todo:', err);
      fetchTodos();
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this task?')) return;
    try {
      setTodos(prev => prev.filter(t => (t._id || t.id) !== id));
      await api.deleteTodo(id);
      fetchTodos();
    } catch (err) {
      console.error('Failed to delete todo:', err);
      fetchTodos();
    }
  };

  const openCreateModal = () => {
    setEditingTodo(null);
    setFormData({
      title: '',
      description: '',
      category: 'DSA',
      priority: 'medium',
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      tags: '',
      recurringInterval: 'none'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (todo, e) => {
    e.stopPropagation();
    setEditingTodo(todo);
    setFormData({
      title: todo.title || '',
      description: todo.description || '',
      category: todo.category || 'DSA',
      priority: todo.priority || 'medium',
      dueDate: todo.dueDate ? todo.dueDate.split('T')[0] : '',
      tags: Array.isArray(todo.tags) ? todo.tags.join(', ') : '',
      recurringInterval: todo.recurringInterval || 'none'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority.toLowerCase(),
        dueDate: new Date(formData.dueDate).toISOString(),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        isRecurring: formData.recurringInterval !== 'none',
        recurringInterval: formData.recurringInterval
      };

      if (editingTodo) {
        await api.updateTodo(editingTodo._id || editingTodo.id, payload);
      } else {
        await api.createTodo(payload);
      }

      setIsModalOpen(false);
      fetchTodos();
    } catch (err) {
      console.error('Failed to save todo:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAiSuggest = async () => {
    try {
      setAiGenerating(true);
      await api.executeAiAction('Plan my preparation tasks for graph algorithms and contest practice');
      await fetchTodos();
    } catch (err) {
      console.error('Failed to generate AI tasks:', err);
    } finally {
      setAiGenerating(false);
    }
  };

  const priorityColors = {
    urgent: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50',
    high: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
    medium: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
    low: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800'
  };

  const categoryColors = {
    DSA: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/50',
    'Competitive Programming': 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/50',
    Development: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/50',
    Projects: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200/50',
    DBMS: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/50',
    OS: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/50',
    CN: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200/50',
    OOP: 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200/50',
    'System Design': 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200/50',
    GitHub: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
    Career: 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200/50'
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
              <ListTodo size={24} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Personal Todo Planner
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
            Organize CP contests, DSA drills, system design revisions, and hackathon milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleAiSuggest}
            disabled={aiGenerating}
            className="flex items-center gap-2 border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
          >
            <Sparkles size={16} className={aiGenerating ? 'animate-spin' : 'text-indigo-500'} />
            {aiGenerating ? 'Generating...' : 'AI Suggest Tasks'}
          </Button>
          <Button
            variant="primary"
            onClick={openCreateModal}
            className="flex items-center gap-2 shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus size={16} />
            New Task
          </Button>
        </div>
      </div>

      {/* Progress & Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-900 dark:to-indigo-950/20">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Tasks</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</p>
          <div className="mt-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-50/50 to-white dark:from-slate-900 dark:to-emerald-950/20">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{stats.completed}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">{completionRate}% completion rate</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50/50 to-white dark:from-slate-900 dark:to-blue-950/20">
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Due Today</p>
          <p className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">{stats.today}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Daily commitment</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-50/50 to-white dark:from-slate-900 dark:to-amber-950/20">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">{stats.pending}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Active roadmap</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-red-50/50 to-white dark:from-slate-900 dark:to-red-950/20 col-span-2 md:col-span-1">
          <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">Overdue</p>
          <p className="text-2xl font-black text-red-700 dark:text-red-400 mt-1">{stats.overdue}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Needs immediate catchup</p>
        </Card>
      </div>

      {/* View Tabs & Filters */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
          {/* View Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All Tasks', count: stats.total },
              { id: 'today', label: 'Today', count: stats.today },
              { id: 'upcoming', label: 'Upcoming', count: stats.pending - stats.overdue },
              { id: 'overdue', label: 'Overdue', count: stats.overdue },
              { id: 'completed', label: 'Completed', count: stats.completed }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                  activeView === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeView === tab.id ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {Math.max(0, tab.count || 0)}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-medium rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-xs font-medium rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Priorities</option>
              {PRIORITIES.filter(p => p !== 'All').map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading planner tasks...</p>
          </div>
        ) : todos.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-3">
              <CheckSquare size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No tasks found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {activeView === 'completed'
                ? 'No completed tasks yet. Check off items as you finish your practice drills!'
                : 'Your planner is all clear. Add a new task or generate one with the AI assistant!'}
            </p>
            <Button
              variant="outline"
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-2 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
            >
              <Plus size={16} />
              Add First Task
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todos.map((todo) => {
              const id = todo._id || todo.id;
              const isOverdue = !todo.isCompleted && new Date(todo.dueDate) < new Date() && !todo.dueDate?.startsWith(new Date().toISOString().split('T')[0]);
              const isToday = todo.dueDate?.startsWith(new Date().toISOString().split('T')[0]);

              return (
                <div
                  key={id}
                  onClick={() => handleToggle(id)}
                  className={`group relative flex items-start gap-3.5 rounded-xl border p-3.5 transition-all duration-150 cursor-pointer ${
                    todo.isCompleted
                      ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/50 opacity-75'
                      : isOverdue
                      ? 'bg-red-50/20 dark:bg-red-950/10 border-red-200/70 dark:border-red-900/40 hover:border-red-300'
                      : 'bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-xs'
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(id);
                    }}
                    className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {todo.isCompleted ? (
                      <CheckCircle2 size={20} className="text-emerald-500 fill-emerald-50 dark:fill-emerald-950/50" />
                    ) : (
                      <Circle size={20} />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-sm font-bold tracking-tight ${
                        todo.isCompleted
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {todo.title}
                      </span>

                      {/* Category Badge */}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${categoryColors[todo.category] || categoryColors.DSA}`}>
                        {todo.category}
                      </span>

                      {/* Priority Badge */}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${priorityColors[todo.priority] || priorityColors.medium}`}>
                        {todo.priority}
                      </span>
                    </div>

                    {todo.description && (
                      <p className={`text-xs mt-1 line-clamp-2 ${
                        todo.isCompleted ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-400'
                      }`}>
                        {todo.description}
                      </p>
                    )}

                    {/* Metadata footer */}
                    <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] text-slate-400 dark:text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={13} />
                        <span className={isOverdue ? 'text-red-500 font-semibold' : isToday ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''}>
                          {isOverdue ? 'Overdue: ' : isToday ? 'Due Today: ' : 'Due: '}
                          {new Date(todo.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      {todo.isRecurring && todo.recurringInterval !== 'none' && (
                        <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                          <Flame size={12} />
                          Repeats {todo.recurringInterval}
                        </span>
                      )}

                      {Array.isArray(todo.tags) && todo.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag size={12} />
                          <span>{todo.tags.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => openEditModal(todo, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit task"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                      title="Delete task"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add / Edit Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTodo ? 'Edit Task' : 'Create New Preparation Task'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Master Binary Search on Answer & 2D Arrays"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Specific focus areas, problem links, or core takeaways..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                {CATEGORIES.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
                Recurrence
              </label>
              <select
                value={formData.recurringInterval}
                onChange={(e) => setFormData({ ...formData, recurringInterval: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="none">One-time Task</option>
                <option value="daily">Daily Habit</option>
                <option value="weekly">Weekly Drill</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              placeholder="DP, LeetCode, Placement, Hard"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
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
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {submitting ? 'Saving...' : editingTodo ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Todo;
