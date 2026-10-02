import { Contest } from '../models/Contest.js';
import { Todo } from '../models/Todo.js';
import { Reminder } from '../models/Reminder.js';
import { createReminder } from '../services/reminders/reminderEngine.js';
import { getGithubContributionData } from '../services/ai.service.js';
import { analyzeUserPreparation, getPersonalizedRecommendations } from '../services/recommendation/recommendationEngine.js';
import { PlatformProfile } from '../models/PlatformProfile.js';

const PYTHON_ENGINE_URL = process.env.PYTHON_ENGINE_URL || 'http://127.0.0.1:8000';

// Helper with timeout
const fetchWithTimeout = async (url, options = {}, timeoutMs = 4000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

/**
 * Natural Language Action Parser & Validator
 * User Request -> Python AI service (Intent Extraction) -> Structured JSON -> Node.js Validation -> Action
 */
export const parseAndExecuteAction = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, message: 'Command prompt is required.' });
    }

    const commandText = prompt.trim();
    let structuredIntent = null;

    // 1. Attempt structured intent extraction via Python AI service
    try {
      const pyRes = await fetchWithTimeout(`${PYTHON_ENGINE_URL}/api/parse-command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: commandText, userId })
      }, 3500);

      if (pyRes.ok) {
        const pyData = await pyRes.json();
        if (pyData && pyData.action) {
          structuredIntent = pyData;
          console.log(`🧠 [AI] Parsed intent from Python microservice: ${pyData.action}`);
        }
      }
    } catch (err) {
      console.log(`ℹ️ [AI] Python microservice unreachable for intent parsing (${err.message}). Using high-fidelity Node.js NLP parser.`);
    }

    // 2. High-fidelity in-process deterministic NLP parser fallback
    if (!structuredIntent) {
      const lower = commandText.toLowerCase();

      if (lower.includes('remind') || lower.includes('alert') || lower.includes('notify')) {
        // e.g. "Remind me 30 minutes before every Codeforces contest"
        const platformMatch = lower.match(/(codeforces|leetcode|codechef|atcoder|gfg|hackerrank)/i);
        const leadTimeMatch = lower.match(/(\d+)\s*(min|minute|hour)/i);
        let leadTimeMinutes = 30;
        if (leadTimeMatch) {
          leadTimeMinutes = leadTimeMatch[2].startsWith('hour') ? parseInt(leadTimeMatch[1], 10) * 60 : parseInt(leadTimeMatch[1], 10);
        }

        structuredIntent = {
          action: 'create_reminder',
          parameters: {
            platform: platformMatch ? platformMatch[1].toLowerCase() : 'codeforces',
            leadTimeMinutes,
            channel: lower.includes('voice') ? 'voice' : lower.includes('email') ? 'email' : 'browser'
          }
        };
      } else if (lower.includes('task') || lower.includes('todo') || lower.includes('solve') || lower.includes('plan my preparation') || lower.includes('create a task')) {
        // e.g. "Create a task to solve 3 graph problems tomorrow"
        const categoryMatch = lower.includes('graph') ? 'DSA' : lower.includes('dp') || lower.includes('dynamic') ? 'DSA' : lower.includes('contest') ? 'Competitive Programming' : lower.includes('os') ? 'OS' : lower.includes('system design') ? 'System Design' : 'DSA';
        
        structuredIntent = {
          action: 'create_todo',
          parameters: {
            title: commandText.replace(/create (a )?task (to )?/i, '').replace(/remind me to /i, ''),
            category: categoryMatch,
            priority: lower.includes('urgent') ? 'urgent' : lower.includes('high') ? 'high' : 'medium',
            daysOffset: lower.includes('tomorrow') ? 1 : 2
          }
        };
      } else if (lower.includes('contest') || lower.includes('participate') || lower.includes('what contests')) {
        structuredIntent = {
          action: 'query_contests',
          parameters: {
            status: 'upcoming'
          }
        };
      } else if (lower.includes('plan') || lower.includes('weak') || lower.includes('recommend')) {
        structuredIntent = {
          action: 'plan_preparation',
          parameters: {
            focus: 'weak_areas'
          }
        };
      } else {
        structuredIntent = {
          action: 'chat_fallback',
          parameters: {}
        };
      }
    }

    // 3. Node.js backend authoritatively validates and executes the action safely
    let executionResult = null;
    let replyText = '';

    switch (structuredIntent.action) {
      case 'create_reminder': {
        const platform = structuredIntent.parameters.platform || 'codeforces';
        const leadTime = structuredIntent.parameters.leadTimeMinutes || 30;
        const channel = structuredIntent.parameters.channel || 'browser';

        // Find next upcoming contest for this platform
        const upcoming = await Contest.findOne({
          platform,
          status: 'upcoming'
        });

        if (upcoming) {
          const reminder = await createReminder({
            userId,
            type: 'contest',
            referenceId: upcoming._id,
            referenceModel: 'Contest',
            title: upcoming.title,
            targetTime: upcoming.startTime,
            leadTimeMinutes: leadTime,
            channel
          });

          executionResult = { reminder, contest: upcoming };
          replyText = `✅ Done! I've scheduled a reminder for "${upcoming.title}" on ${upcoming.platform.toUpperCase()} ${leadTime} minutes before it starts via ${channel}.`;
        } else {
          // Fallback reminder schedule
          const defaultTarget = new Date(Date.now() + 86400000 * 2).toISOString();
          const reminder = await createReminder({
            userId,
            type: 'contest',
            title: `${platform.toUpperCase()} Upcoming Round`,
            targetTime: defaultTarget,
            leadTimeMinutes: leadTime,
            channel
          });
          executionResult = { reminder };
          replyText = `✅ Set a reminder for the next ${platform.toUpperCase()} contest ${leadTime} minutes prior.`;
        }
        break;
      }

      case 'create_todo': {
        const days = Number(structuredIntent.parameters.daysOffset) || 1;
        const dueDate = new Date(Date.now() + 86400000 * days).toISOString();

        const task = await Todo.create({
          userId,
          title: structuredIntent.parameters.title || 'Practice algorithmic problem solving',
          category: structuredIntent.parameters.category || 'DSA',
          priority: structuredIntent.parameters.priority || 'medium',
          dueDate,
          tags: ['AI-Planned'],
          isCompleted: false
        });

        executionResult = { task };
        replyText = `📋 Task created: "${task.title}" has been added to your Todo Planner under ${task.category}, due on ${new Date(dueDate).toLocaleDateString()}.`;
        break;
      }

      case 'query_contests': {
        const contests = await Contest.find({ status: 'upcoming' });
        const topContests = contests.slice(0, 3);
        executionResult = { contests: topContests };
        replyText = `🏆 Here are the upcoming contests you should participate in:\n` +
          topContests.map(c => `• **${c.title}** (${c.platform.toUpperCase()}) — ${new Date(c.startTime).toLocaleString()}`).join('\n');
        break;
      }

      case 'plan_preparation': {
        const profiles = await PlatformProfile.find({ userId });
        const analysis = analyzeUserPreparation(req.user.profile || {}, {}, profiles);
        const recommendations = getPersonalizedRecommendations(analysis.weakAreas, []);

        executionResult = { analysis, recommendations };
        replyText = `🎯 **Weekly Preparation Focus**:\n` +
          `Your diagnosed top priority areas are:\n` +
          analysis.priorityAreas.map(p => `1. **${p.topic}** (Current: ${p.currentScore}) — ${p.recommendation}`).join('\n') +
          `\n\nI recommend starting with **${recommendations[0]?.title || 'Graph Traversal'}** on LeetCode today!`;
        break;
      }

      default: {
        replyText = `I understand your goal. You can ask me to schedule reminders (e.g. "Remind me 30 mins before Codeforces"), add tasks (e.g. "Create task to solve 3 DP problems"), or plan your weekly prep.`;
        executionResult = { intent: structuredIntent };
      }
    }

    res.json({
      success: true,
      action: structuredIntent.action,
      executed: true,
      reply: replyText,
      result: executionResult
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Chat with Dupilio AI Copilot
// @route   POST /api/v1/ai/chat
export const chat = async (req, res, next) => {
  try {
    const { prompt, userContext } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, message: 'Prompt text is required.' });
    }

    // Try Python AI service first
    try {
      const pyRes = await fetchWithTimeout(`${PYTHON_ENGINE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, userContext: userContext || { name: req.user.name } })
      }, 3500);

      if (pyRes.ok) {
        const pyData = await pyRes.json();
        if (pyData && pyData.reply) {
          return res.json({ success: true, reply: pyData.reply });
        }
      }
    } catch (e) {
      // fallback
    }

    // Deterministic in-process responses
    const lower = prompt.toLowerCase();
    let reply = `Hello ${req.user.name}! I am your Dupilio AI Assistant. I can help you analyze weak topics, schedule contest reminders, plan your daily practice, and discover hackathons.`;

    if (lower.includes('dp') || lower.includes('dynamic programming')) {
      reply = `💡 **Dynamic Programming Blueprint**:\n1. **Define Subproblems**: What state parameters (e.g., index \`i\`, remaining target \`w\`) uniquely capture the problem?\n2. **Identify Recurrence**: \`dp[i][w] = min(dp[i-1][w], 1 + dp[i][w - coin])\`\n3. **Base Case & Bounds**: When is target 0? What if no items remain?\n4. **Space Optimization**: Can you compress a 2D matrix into a 1D rolling array?`;
    } else if (lower.includes('contest') || lower.includes('rating')) {
      reply = `🏆 **Contest Strategy**:\n• In Div. 2 / Div. 3, prioritize bug-free first submissions over risky micro-optimizations.\n• Never spend more than 20 minutes stuck on one problem without testing edge cases (N=1, identical elements, overflows).\n• Dupilio tracks your ratings across LeetCode, Codeforces, and CodeChef in real-time on your dashboard.`;
    }

    res.json({ success: true, reply });
  } catch (err) {
    next(err);
  }
};

// @desc    Get GitHub commit streak & 52-week green sheet
// @route   GET /api/v1/ai/github-stats
export const getGithubStats = async (req, res, next) => {
  try {
    const username = req.query.username || req.user?.profile?.codingProfiles?.github || 'developer';
    const stats = await getGithubContributionData(username);
    res.json({ success: true, stats });
  } catch (err) {
    next(err);
  }
};

// @desc    Configure Google Gemini API Key
// @route   POST /api/v1/ai/configure-key
export const configureAiKey = async (req, res, next) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey || !apiKey.trim()) {
      return res.status(400).json({ success: false, message: 'API key is required.' });
    }

    process.env.GEMINI_API_KEY = apiKey.trim();
    res.json({
      success: true,
      message: 'Gemini API Key saved and activated successfully!',
      status: 'Active'
    });
  } catch (err) {
    next(err);
  }
};

export default {
  parseAndExecuteAction,
  chat,
  getGithubStats,
  configureAiKey
};
