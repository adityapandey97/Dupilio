import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to automatically add the bearer token if it exists in local storage
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dupilio_token') || localStorage.getItem('hireprep_token');
    config.headers.Authorization = `Bearer ${token || 'preview-token'}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export const api = {
  // Authentication endpoints
  login: async (email, password) => {
    const res = await client.post('/auth/login', { email, password });
    if (res.data.success && res.data.token) {
      localStorage.setItem('dupilio_token', res.data.token);
      localStorage.setItem('dupilio_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  register: async (name, email, password, college, department, batch) => {
    const res = await client.post('/auth/register', { name, email, password, college, department, batch });
    if (res.data.success && res.data.token) {
      localStorage.setItem('dupilio_token', res.data.token);
      localStorage.setItem('dupilio_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  logout: async () => {
    try {
      await client.post('/auth/logout');
    } catch (e) {
      // ignore logout failures
    }
    localStorage.removeItem('dupilio_token');
    localStorage.removeItem('dupilio_user');
    localStorage.removeItem('hireprep_token');
    localStorage.removeItem('hireprep_current_user');
  },

  getMe: async () => {
    const res = await client.get('/users/me');
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await client.put('/users/profile', profileData);
    return res.data;
  },

  // Dashboard endpoints
  getDashboardData: async () => {
    const res = await client.get('/dashboard');
    return res.data;
  },

  // Platforms endpoints
  getSupportedPlatforms: async () => {
    const res = await client.get('/platforms/supported');
    return res.data.platforms;
  },

  getPlatforms: async () => {
    const res = await client.get('/platforms');
    return res.data.profiles;
  },

  connectPlatform: async (platform, username) => {
    const res = await client.post('/platforms/connect', { platform, username });
    return res.data;
  },

  syncPlatform: async (platform) => {
    const res = await client.post(`/platforms/${platform}/sync`);
    return res.data;
  },

  syncAllPlatforms: async () => {
    const res = await client.post('/platforms/sync-all');
    return res.data;
  },

  disconnectPlatform: async (platform) => {
    const res = await client.delete(`/platforms/${platform}`);
    return res.data;
  },

  // Contests endpoints
  getContests: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await client.get(`/contests${query ? `?${query}` : ''}`);
    return res.data.contests || [];
  },

  getContestById: async (id) => {
    const res = await client.get(`/contests/${id}`);
    return res.data.contest;
  },

  syncContests: async () => {
    const res = await client.post('/contests/sync');
    return res.data;
  },

  // Events & Hackathons endpoints
  getEvents: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await client.get(`/events${query ? `?${query}` : ''}`);
    return res.data.events || [];
  },

  getEventById: async (id) => {
    const res = await client.get(`/events/${id}`);
    return res.data.event;
  },

  // Problems / DSA endpoints
  getProblems: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await client.get(`/problems${query ? `?${query}` : ''}`);
    return (res.data.problems || []).map(p => ({ ...p, id: p._id || p.id }));
  },

  getProblemById: async (id) => {
    const res = await client.get(`/problems/${id}`);
    return res.data.problem;
  },

  toggleProblemSolve: async (id, isSolved) => {
    const res = await client.put(`/problems/${id}/solve`, { isSolved });
    return res.data;
  },

  toggleProblemBookmark: async (id) => {
    const res = await client.put(`/problems/${id}/bookmark`);
    return res.data;
  },

  addProblemToTodo: async (id) => {
    const res = await client.post(`/problems/${id}/add-to-todo`);
    return res.data;
  },

  submitCode: async (problemId, code, language) => {
    const res = await client.post(`/problems/${problemId}/submit`, { code, language });
    return res.data;
  },

  // Todo Planner endpoints
  getTodos: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await client.get(`/todos${query ? `?${query}` : ''}`);
    return res.data;
  },

  createTodo: async (todoData) => {
    const res = await client.post('/todos', todoData);
    return res.data;
  },

  updateTodo: async (id, todoData) => {
    const res = await client.put(`/todos/${id}`, todoData);
    return res.data;
  },

  toggleTodo: async (id) => {
    const res = await client.put(`/todos/${id}/toggle`);
    return res.data;
  },

  deleteTodo: async (id) => {
    const res = await client.delete(`/todos/${id}`);
    return res.data;
  },

  // Reminders endpoints
  getReminders: async () => {
    const res = await client.get('/reminders');
    return res.data.reminders || [];
  },

  createReminder: async (reminderData) => {
    const res = await client.post('/reminders', reminderData);
    return res.data;
  },

  cancelReminder: async (id) => {
    const res = await client.delete(`/reminders/${id}`);
    return res.data;
  },

  // Preparation & Recommendations
  getPreparationData: async () => {
    const res = await client.get('/preparation');
    return res.data;
  },

  getRecommendations: async () => {
    const res = await client.get('/preparation/recommendations');
    return res.data.recommendations || [];
  },

  // Global College Leaderboard
  getLeaderboard: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await client.get(`/leaderboard${query ? `?${query}` : ''}`);
    return res.data.leaderboard || [];
  },

  // Discussions Community endpoints
  getDiscussions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await client.get(`/discussions${query ? `?${query}` : ''}`);
    return res.data.discussions || [];
  },

  getDiscussionById: async (id) => {
    const res = await client.get(`/discussions/${id}`);
    return res.data.discussion;
  },

  createDiscussion: async (data) => {
    const res = await client.post('/discussions', data);
    return res.data;
  },

  upvoteDiscussion: async (id) => {
    const res = await client.post(`/discussions/${id}/upvote`);
    return res.data;
  },

  bookmarkDiscussion: async (id) => {
    const res = await client.post(`/discussions/${id}/bookmark`);
    return res.data;
  },

  addDiscussionComment: async (id, text) => {
    const res = await client.post(`/discussions/${id}/comment`, { text });
    return res.data;
  },

  deleteDiscussion: async (id) => {
    const res = await client.delete(`/discussions/${id}`);
    return res.data;
  },

  // AI Assistant & Copilot endpoints
  executeAiAction: async (prompt) => {
    const res = await client.post('/ai/parse-action', { prompt });
    return res.data;
  },

  chatCopilot: async (prompt, userContext = {}) => {
    const res = await client.post('/ai/chat', { prompt, userContext });
    return res.data;
  },

  getGithubStats: async (username) => {
    const res = await client.get(`/ai/github-stats${username ? `?username=${username}` : ''}`);
    return res.data.stats;
  },

  configureAiKey: async (apiKey) => {
    const res = await client.post('/ai/configure-key', { apiKey });
    return res.data;
  }
};

export default api;
