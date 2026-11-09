import { getDashboardData } from './src/controllers/dashboard.controller.js';
import { getLeaderboard } from './src/controllers/leaderboard.controller.js';
import { getContests } from './src/controllers/contest.controller.js';
import {
  getSelfTestContestProblems,
  evaluateSelfTestCode,
  submitSelfTestContest,
  getSelfTestMcq,
  evaluateSelfTestMcq
} from './src/controllers/ai.controller.js';
import { getEvents } from './src/controllers/event.controller.js';
import { getDiscussions } from './src/controllers/discussion.controller.js';

// Mock Response Helper
const createMockRes = (name, resolve) => {
  return {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      resolve({ name, status: this.statusCode, data });
    }
  };
};

const mockUser = {
  _id: 'guest-preview',
  name: 'Aditya Pandey',
  email: 'aditya@example.com',
  college: 'National Institute of Technology',
  department: 'Computer Science',
  batch: '2026',
  country: 'India',
  developerScore: { overall: 76 }
};

async function runAllTests() {
  console.log('🚀 Running Unit & Functional Test Suite for HierPrep Controllers...\n');

  // Test 1: Dashboard Controller
  const dashPromise = new Promise((resolve, reject) => {
    const req = { user: mockUser, query: {} };
    const res = createMockRes('Dashboard', resolve);
    getDashboardData(req, res, reject);
  });
  const dashRes = await dashPromise;
  console.log('1. Dashboard Controller:');
  console.log('   - Success:', dashRes.data.success);
  console.log('   - Total Solved:', dashRes.data.summaryCards?.problemsSolved);
  console.log('   - Monthly Heatmap Days:', dashRes.data.monthlyHeatmap?.length);
  console.log('   - GitHub Telemetry Repos:', dashRes.data.githubTelemetry?.totalRepositories);
  console.log('   - Side Leaderboard Scopes:', Object.keys(dashRes.data.sideLeaderboard || {}));

  if (!dashRes.data.monthlyHeatmap || dashRes.data.monthlyHeatmap.length === 0) {
    throw new Error('Dashboard monthlyHeatmap is missing!');
  }
  if (!dashRes.data.githubTelemetry) {
    throw new Error('Dashboard githubTelemetry is missing!');
  }
  if (!dashRes.data.sideLeaderboard?.global || !dashRes.data.sideLeaderboard?.college || !dashRes.data.sideLeaderboard?.country) {
    throw new Error('Side leaderboard scopes missing!');
  }

  // Test 2: Leaderboard Controller with scopes (Global, College, Country)
  for (const scope of ['global', 'college', 'country']) {
    const lbPromise = new Promise((resolve, reject) => {
      const req = { user: mockUser, query: { scope } };
      const res = createMockRes(`Leaderboard-${scope}`, resolve);
      getLeaderboard(req, res, reject);
    });
    const lbRes = await lbPromise;
    console.log(`2. Leaderboard (${scope}): Count = ${lbRes.data.count}`);
    if (!lbRes.data.success || lbRes.data.count === 0) {
      throw new Error(`Leaderboard for scope ${scope} failed!`);
    }
  }

  // Test 3: Contests Controller
  const contestPromise = new Promise((resolve, reject) => {
    const req = { query: {} };
    const res = createMockRes('Contests', resolve);
    getContests(req, res, reject);
  });
  const contestRes = await contestPromise;
  console.log(`3. Contests Controller: Count = ${contestRes.data.contests?.length}`);
  if (!contestRes.data.success || contestRes.data.contests?.length === 0) {
    throw new Error('Contests retrieval failed!');
  }

  // Test 4: Events & Hackathons Controller
  const eventPromise = new Promise((resolve, reject) => {
    const req = { query: {} };
    const res = createMockRes('Events', resolve);
    getEvents(req, res, reject);
  });
  const eventRes = await eventPromise;
  console.log(`4. Events Controller: Count = ${eventRes.data.events?.length}`);
  if (!eventRes.data.success || eventRes.data.events?.length === 0) {
    throw new Error('Events retrieval failed!');
  }

  // Test 5: Section 4 - 4-Problem Coding Contest
  const p4Promise = new Promise((resolve, reject) => {
    const req = {};
    const res = createMockRes('Contest-4-Problems', resolve);
    getSelfTestContestProblems(req, res, reject);
  });
  const p4Res = await p4Promise;
  console.log(`5. Section 4 - 4-Problem Contest: Problem Count = ${p4Res.data.problems?.length}`);
  if (p4Res.data.problems?.length !== 4) {
    throw new Error('Expected exactly 4 problems in contest arena!');
  }

  // Test 6: Section 4 - AI Code Judge Evaluation
  const evalPromise = new Promise((resolve, reject) => {
    const req = {
      body: {
        problemId: 'hierprep-p1',
        language: 'javascript',
        code: `function findPairs(nums, k) {
          const map = new Map();
          for (const n of nums) map.set(n, (map.get(n) || 0) + 1);
          let count = 0;
          for (const [val, freq] of map.entries()) {
            if (k === 0) { if (freq > 1) count++; }
            else { if (map.has(val + k)) count++; }
          }
          return count;
        }`
      }
    };
    const res = createMockRes('Evaluate-Code', resolve);
    evaluateSelfTestCode(req, res, reject);
  });
  const evalRes = await evalPromise;
  console.log(`6. Section 4 - AI Code Evaluation: Verdict = ${evalRes.data.verdict}, Score = ${evalRes.data.score}, Time = ${evalRes.data.timeComplexity}`);
  if (evalRes.data.verdict !== 'Accepted') {
    throw new Error('Expected Accepted verdict for correct solution!');
  }

  // Test 7: Section 4 - Contest Submission & Elo Rating Calculation
  const subContestPromise = new Promise((resolve, reject) => {
    const req = {
      user: mockUser,
      body: {
        solvedProblemIds: ['hierprep-p1', 'hierprep-p2', 'hierprep-p3', 'hierprep-p4'],
        totalSeconds: 3600,
        penalties: 0
      }
    };
    const res = createMockRes('Submit-Contest', resolve);
    submitSelfTestContest(req, res, reject);
  });
  const subContestRes = await subContestPromise;
  console.log('7. Section 4 - Contest Submission & Rating Delta:');
  console.log('   - Solved Count:', subContestRes.data.contestSummary?.solvedCount);
  console.log('   - Points:', subContestRes.data.contestSummary?.totalPointsEarned);
  console.log('   - Rating Delta:', subContestRes.data.contestSummary?.ratingDelta);
  console.log('   - New Rating:', subContestRes.data.contestSummary?.newRating);
  console.log('   - Rank:', subContestRes.data.contestSummary?.rank);
  if (subContestRes.data.contestSummary?.solvedCount !== 4) {
    throw new Error('Contest submission solved count mismatch!');
  }

  // Test 8: Section 4 - MCQ Generation (Core CS & Aptitude)
  const mcqCorePromise = new Promise((resolve, reject) => {
    const req = { query: { track: 'core_cs', count: 10 } };
    const res = createMockRes('MCQ-CoreCS', resolve);
    getSelfTestMcq(req, res, reject);
  });
  const mcqCoreRes = await mcqCorePromise;
  console.log(`8a. Section 4 - Core CS MCQ: Questions = ${mcqCoreRes.data.questions?.length}`);
  if (mcqCoreRes.data.questions?.length !== 10) {
    throw new Error('Expected 10 Core CS questions!');
  }

  const mcqAptiPromise = new Promise((resolve, reject) => {
    const req = { query: { track: 'aptitude_reasoning', count: 8 } };
    const res = createMockRes('MCQ-Aptitude', resolve);
    getSelfTestMcq(req, res, reject);
  });
  const mcqAptiRes = await mcqAptiPromise;
  console.log(`8b. Section 4 - Aptitude MCQ: Questions = ${mcqAptiRes.data.questions?.length}`);
  if (mcqAptiRes.data.questions?.length !== 8) {
    throw new Error('Expected 8 Aptitude questions!');
  }

  // Test 9: Section 4 - MCQ Evaluation & Subject Breakdown
  const mcqEvalPromise = new Promise((resolve, reject) => {
    const req = {
      body: {
        track: 'core_cs',
        answers: { 'cs-os-1': 1, 'cs-os-2': 2, 'cs-db-1': 1, 'cs-sql-1': 1 }
      }
    };
    const res = createMockRes('Evaluate-MCQ', resolve);
    evaluateSelfTestMcq(req, res, reject);
  });
  const mcqEvalRes = await mcqEvalPromise;
  console.log(`9. Section 4 - MCQ Evaluation: Score = ${mcqEvalRes.data.score}/${mcqEvalRes.data.totalQuestions}, Subject Breakdown count = ${mcqEvalRes.data.subjectBreakdown?.length}`);
  if (mcqEvalRes.data.score < 1) {
    throw new Error('MCQ Evaluation score mismatch!');
  }

  // Test 10: Section 5 - Tech Discussions
  const discPromise = new Promise((resolve, reject) => {
    const req = { query: {} };
    const res = createMockRes('Discussions', resolve);
    getDiscussions(req, res, reject);
  });
  const discRes = await discPromise;
  console.log(`10. Section 5 - Discussions Controller: Count = ${discRes.data.discussions?.length}`);
  if (!discRes.data.success || discRes.data.discussions?.length === 0) {
    throw new Error('Discussions retrieval failed!');
  }

  console.log('\n🌟 100% OF TESTS PASSED WITH ZERO FAILURES! All 5 Sections fully verified.');
  process.exit(0);
}

runAllTests().catch(err => {
  console.error('\n❌ Test execution failed:', err);
  process.exit(1);
});

