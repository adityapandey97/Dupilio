import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '../../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import {
  ShieldAlert,
  Users,
  Code2,
  Trash2,
  Plus,
  TrendingUp,
  Award,
  Video,
  FileText,
  CheckCircle,
  X,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

// Schema validation for adding a new problem
const problemSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  topic: z.string().min(1, 'Topic is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  constraints: z.string().min(2, 'Please add at least one constraint'),
  examples: z.array(
    z.object({
      input: z.string().min(1, 'Example input is required'),
      output: z.string().min(1, 'Example output is required'),
      explanation: z.string().optional()
    })
  ).min(1, 'Add at least one example')
});

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [users, setUsers] = useState([]);
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: '',
      difficulty: 'Easy',
      topic: 'Array',
      description: '',
      constraints: '1 <= nums.length <= 10^5',
      examples: [{ input: '', output: '', explanation: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'examples'
  });

  const loadData = async () => {
    try {
      const listUsers = await api.getAllUsers();
      const listProblems = await api.getProblems();
      const dashboardStats = await api.getDashboardStats();
      
      setUsers(listUsers);
      setProblems(listProblems);

      // Calculate admin stats
      const avgScore = dashboardStats.averageScore || 82;
      const solvedCount = listProblems.filter(p => p.isSolved).length;

      setStats({
        totalUsers: listUsers.length,
        totalProblems: listProblems.length,
        solvedProblems: solvedCount,
        averageScore: avgScore,
        totalInterviews: dashboardStats.interviewsCompleted || 12
      });
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onDeleteUser = async (email) => {
    if (email === 'aditya@example.com') {
      alert('Cannot delete the default developer test account.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete user: ${email}?`)) {
      try {
        await api.deleteUser(email);
        loadData();
        setSelectedUser(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const onDeleteProblem = async (id) => {
    if (window.confirm('Are you sure you want to delete this coding problem?')) {
      try {
        await api.deleteProblem(id);
        loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const onAddProblemSubmit = async (data) => {
    // Convert comma separated constraints text to array
    const constraintsArray = data.constraints
      .split('\n')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const fullProblem = {
      title: data.title,
      difficulty: data.difficulty,
      topic: data.topic,
      description: data.description,
      constraints: constraintsArray.length ? constraintsArray : [data.constraints],
      examples: data.examples
    };

    try {
      await api.addProblem(fullProblem);
      loadData();
      setIsAddModalOpen(false);
      reset();
    } catch (err) {
      console.error(err);
    }
  };

  if (!stats) return null;

  // Chart data calculations
  const difficultyCounts = [
    { name: 'Easy', count: problems.filter(p => p.difficulty === 'Easy').length },
    { name: 'Medium', count: problems.filter(p => p.difficulty === 'Medium').length },
    { name: 'Hard', count: problems.filter(p => p.difficulty === 'Hard').length }
  ];

  const topicCounts = {};
  problems.forEach(p => {
    topicCounts[p.topic] = (topicCounts[p.topic] || 0) + 1;
  });
  const topicChartData = Object.keys(topicCounts).map(topic => ({
    name: topic,
    value: topicCounts[topic]
  }));

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert size={28} className="text-purple-600 dark:text-purple-400" />
            Administration Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage practice questions, view global metrics, and inspect system user databases.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 shrink-0">
        {[
          { id: 'analytics', label: 'Platform Analytics', icon: <TrendingUp size={16} /> },
          { id: 'questions', label: 'Question Management', icon: <Code2 size={16} /> },
          { id: 'users', label: 'User Directory', icon: <Users size={16} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-150 focus:outline-none ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-700 dark:border-purple-400 dark:text-purple-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-slate-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-6">
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Overview cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: 'Total Registered Users', value: stats.totalUsers, icon: <Users size={20} />, color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300' },
                { title: 'Total SDE Challenges', value: stats.totalProblems, icon: <Code2 size={20} />, color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300' },
                { title: 'AI Interview Sessions', value: stats.totalInterviews, icon: <Video size={20} />, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300' },
                { title: 'Average Interview Score', value: `${stats.averageScore}%`, icon: <Award size={20} />, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300' }
              ].map((c, idx) => (
                <Card hoverEffect key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {c.title}
                    </p>
                    <h3 className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-100">
                      {c.value}
                    </h3>
                  </div>
                  <div className={`rounded-xl p-3 ${c.color}`}>
                    {c.icon}
                  </div>
                </Card>
              ))}
            </div>

            {/* Charts section */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Problems by Difficulty</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={difficultyCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(30, 41, 59, 0.9)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '11px'
                        }}
                      />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Problems by Topic Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topicChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {topicChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(30, 41, 59, 0.9)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '11px'
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Active Question Pool</h3>
              <Button
                variant="primary"
                onClick={() => setIsAddModalOpen(true)}
                icon={<Plus size={16} />}
              >
                Add Coding Problem
              </Button>
            </div>

            <Card className="overflow-hidden p-0 border border-slate-200/80 dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                  <thead className="bg-slate-50/75 dark:bg-slate-900/40">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Topic</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Difficulty</th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-950 dark:divide-slate-800">
                    {problems.map((problem) => (
                      <tr key={problem.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/25 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500">
                          {problem.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800 dark:text-slate-200">
                          {problem.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                          {problem.topic}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            problem.difficulty === 'Easy'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-450'
                              : problem.difficulty === 'Medium'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-450'
                              : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-450'
                          }`}>
                            {problem.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => onDeleteProblem(problem.id)}
                            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors focus:outline-none"
                            title="Delete problem"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Registered Users Database</h3>

            <Card className="overflow-hidden p-0 border border-slate-200/80 dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                  <thead className="bg-slate-50/75 dark:bg-slate-900/40">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Designated Role</th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-950 dark:divide-slate-800">
                    {users.map((item) => (
                      <tr key={item.email} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/25 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-750 dark:bg-purple-950 dark:text-purple-300">
                              {item.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-sm font-bold text-slate-850 dark:text-slate-200">
                              {item.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-550 dark:text-slate-400">
                          {item.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.profile?.role === 'ADMIN' || item.email === 'aditya@example.com'
                              ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400'
                          }`}>
                            {item.email === 'aditya@example.com' ? 'ADMIN' : (item.profile?.role?.toUpperCase() || 'CANDIDATE')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedUser(item)}
                              className="rounded-lg p-1.5 text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                            >
                              <Info size={16} />
                            </button>
                            <button
                              onClick={() => onDeleteUser(item.email)}
                              disabled={item.email === 'aditya@example.com'}
                              className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors focus:outline-none disabled:opacity-35"
                              title="Delete user"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Add Problem Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Placement Coding Problem"
      >
        <form className="space-y-4 max-h-[75vh] overflow-y-auto pr-1" onSubmit={handleSubmit(onAddProblemSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Problem Title"
              placeholder="e.g. Reverse Linked List"
              required
              error={errors.title}
              {...register('title')}
            />
            <div className="text-left">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Topic Category
              </label>
              <select
                {...register('topic')}
                className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-850 focus:border-purple-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-250"
              >
                <option value="Array">Array</option>
                <option value="String">String</option>
                <option value="Linked List">Linked List</option>
                <option value="Tree">Tree</option>
                <option value="Graph">Graph</option>
                <option value="DP">DP</option>
              </select>
            </div>
          </div>

          <div className="text-left">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Difficulty Tier
            </label>
            <div className="flex gap-4">
              {['Easy', 'Medium', 'Hard'].map((diff) => (
                <label key={diff} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    value={diff}
                    {...register('difficulty')}
                    className="h-4 w-4 border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span>{diff}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="text-left">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Problem Description (Markdown Supported)
            </label>
            <textarea
              {...register('description')}
              placeholder="Describe the problem, input format, return constraints..."
              className="w-full h-32 p-3 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50/50 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-200"
            />
            {errors.description && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.description.message}</p>}
          </div>

          <div className="text-left">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Constraints (One per line)
            </label>
            <textarea
              {...register('constraints')}
              placeholder="e.g. 1 <= s.length <= 10^5"
              className="w-full h-20 p-3 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50/50 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-200"
            />
            {errors.constraints && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.constraints.message}</p>}
          </div>

          {/* Examples array */}
          <div className="text-left space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Test Case Examples
              </label>
              <button
                type="button"
                onClick={() => append({ input: '', output: '', explanation: '' })}
                className="text-[10px] font-bold text-purple-600 hover:text-purple-500 flex items-center gap-0.5 focus:outline-none"
              >
                + Add Example
              </button>
            </div>

            {fields.map((field, idx) => (
              <div key={field.id} className="relative rounded-xl border border-slate-200 dark:border-slate-850 p-4 bg-slate-50/30 space-y-3">
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  disabled={fields.length === 1}
                  className="absolute top-2 right-2 rounded p-1 text-slate-400 hover:text-red-500 disabled:opacity-30 focus:outline-none"
                >
                  <X size={14} />
                </button>
                <p className="text-[11px] font-bold text-slate-400">Example {idx + 1}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    label="Input parameters"
                    placeholder="e.g. s = 'abc'"
                    required
                    error={errors.examples?.[idx]?.input}
                    {...register(`examples.${idx}.input`)}
                  />
                  <Input
                    label="Output value"
                    placeholder="e.g. 'cba'"
                    required
                    error={errors.examples?.[idx]?.output}
                    {...register(`examples.${idx}.output`)}
                  />
                </div>
                <Input
                  label="Explanation (Optional)"
                  placeholder="e.g. Reversing the character order gives cba."
                  error={errors.examples?.[idx]?.explanation}
                  {...register(`examples.${idx}.explanation`)}
                />
              </div>
            ))}
            {errors.examples?.root && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.examples.root.message}</p>}
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Publish Challenge
            </Button>
          </div>
        </form>
      </Modal>

      {/* User Info Details Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`${selectedUser.name} Details`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b pb-3 mb-2 dark:border-slate-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-lg font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                {selectedUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">{selectedUser.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedUser.email}</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400 uppercase tracking-wider">Assigned Role:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedUser.profile?.role || 'Candidate Developer'}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 dark:border-slate-850">
                <span className="font-semibold text-slate-400 uppercase tracking-wider">Interviews Tracked:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Yes</span>
              </div>
              <div className="flex justify-between border-t pt-2 dark:border-slate-850">
                <span className="font-semibold text-slate-400 uppercase tracking-wider">Placement Status:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Active preparation</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4 dark:border-slate-800">
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDeleteUser(selectedUser.email)}
                disabled={selectedUser.email === 'aditya@example.com'}
                icon={<Trash2 size={12} />}
              >
                Delete User
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminDashboard;
