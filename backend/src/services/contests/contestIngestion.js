import { Contest } from '../../models/Contest.js';
import { SyncJob } from '../../models/SyncJob.js';
import { adapters } from '../platforms/index.js';

export const INITIAL_CONTESTS = [
  {
    title: 'Codeforces Round 976 (Div. 2)',
    platform: 'codeforces',
    externalContestId: 'cf-976',
    startTime: new Date(Date.now() + 86400000 * 1.2).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 1.2 + 7200000).toISOString(),
    durationMinutes: 120,
    registrationUrl: 'https://codeforces.com/contests',
    contestUrl: 'https://codeforces.com/contests',
    status: 'upcoming',
    ratingRange: 'Rating < 2100',
    description: 'Rated contest for Division 2 participants on Codeforces.'
  },
  {
    title: 'LeetCode Weekly Contest 442',
    platform: 'leetcode',
    externalContestId: 'lc-weekly-442',
    startTime: new Date(Date.now() + 86400000 * 2.8).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 2.8 + 5400000).toISOString(),
    durationMinutes: 90,
    registrationUrl: 'https://leetcode.com/contest/',
    contestUrl: 'https://leetcode.com/contest/',
    status: 'upcoming',
    ratingRange: 'All Ratings',
    description: '4 algorithmic questions: 1 Easy, 2 Medium, 1 Hard.'
  },
  {
    title: 'CodeChef Starters 154',
    platform: 'codechef',
    externalContestId: 'cc-starters-154',
    startTime: new Date(Date.now() + 86400000 * 3.5).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 3.5 + 7200000).toISOString(),
    durationMinutes: 120,
    registrationUrl: 'https://www.codechef.com/contests',
    contestUrl: 'https://www.codechef.com/contests',
    status: 'upcoming',
    ratingRange: 'Div 1, 2, 3, 4',
    description: 'Rated for all divisions. Wednesday 8:00 PM IST.'
  },
  {
    title: 'AtCoder Beginner Contest 373 (ABC)',
    platform: 'atcoder',
    externalContestId: 'atcoder-abc-373',
    startTime: new Date(Date.now() + 86400000 * 4.2).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 4.2 + 6000000).toISOString(),
    durationMinutes: 100,
    registrationUrl: 'https://atcoder.jp/contests/',
    contestUrl: 'https://atcoder.jp/contests/',
    status: 'upcoming',
    ratingRange: 'Rating < 2000',
    description: '6-8 problems ranging from basic arithmetic to advanced graphs and DP.'
  },
  {
    title: 'GeeksforGeeks Weekly Contest 172',
    platform: 'gfg',
    externalContestId: 'gfg-172',
    startTime: new Date(Date.now() + 86400000 * 5.0).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 5.0 + 5400000).toISOString(),
    durationMinutes: 90,
    registrationUrl: 'https://practice.geeksforgeeks.org/events',
    contestUrl: 'https://practice.geeksforgeeks.org/events',
    status: 'upcoming',
    ratingRange: 'Open to All',
    description: '3 DSA questions for campus placement & competitive programming prep.'
  },
  {
    title: 'Codeforces Round 975 (Div. 1 + Div. 2)',
    platform: 'codeforces',
    externalContestId: 'cf-975',
    startTime: new Date(Date.now() - 86400000 * 2).toISOString(),
    endTime: new Date(Date.now() - 86400000 * 2 + 7200000).toISOString(),
    durationMinutes: 120,
    registrationUrl: 'https://codeforces.com/contest/975',
    contestUrl: 'https://codeforces.com/contest/975',
    status: 'past',
    ratingRange: 'All Ratings',
    description: 'Combined round with 6 algorithmic challenges.'
  }
];

export const ingestContests = async () => {
  const startedAt = new Date().toISOString();
  console.log('🔄 [ContestIngestion] Ingesting upcoming contests across platforms...');

  let totalProcessed = 0;
  const now = new Date();

  // 1. Check if DB needs initial seed
  const existing = await Contest.find({});
  if (existing.length === 0) {
    for (const item of INITIAL_CONTESTS) {
      await Contest.create(item);
      totalProcessed++;
    }
  }

  // 2. Query platform adapters that provide contests
  const platformsWithContests = ['codeforces', 'leetcode', 'codechef', 'atcoder', 'gfg'];

  for (const plat of platformsWithContests) {
    try {
      const adapter = adapters[plat];
      if (adapter && typeof adapter.getContests === 'function') {
        const fetchedContests = await adapter.getContests();

        for (const item of fetchedContests) {
          const startTimeDate = new Date(item.startTime);
          const endTimeDate = new Date(item.endTime);

          let calculatedStatus = 'upcoming';
          if (now >= startTimeDate && now <= endTimeDate) {
            calculatedStatus = 'live';
          } else if (now > endTimeDate) {
            calculatedStatus = 'past';
          }

          const contestData = {
            ...item,
            status: calculatedStatus,
            lastSyncedAt: new Date().toISOString()
          };

          // Deduplicate by platform + externalContestId
          const existingContest = await Contest.findOne({
            platform: item.platform,
            externalContestId: item.externalContestId
          });

          if (existingContest) {
            await Contest.findByIdAndUpdate(existingContest._id, { $set: contestData });
          } else {
            await Contest.create(contestData);
          }
          totalProcessed++;
        }
      }
    } catch (err) {
      console.warn(`⚠️ [ContestIngestion] Ingestion for ${plat} experienced non-critical issue: ${err.message}`);
    }
  }

  // Record Sync Job
  await SyncJob.create({
    jobType: 'contests',
    status: 'completed',
    startedAt,
    completedAt: new Date().toISOString(),
    itemsProcessed: totalProcessed
  });

  console.log(`✅ [ContestIngestion] Successfully synchronized ${totalProcessed} contests.`);
  return { success: true, totalProcessed };
};

export default { ingestContests, INITIAL_CONTESTS };
