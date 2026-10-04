import { Contest } from '../../models/Contest.js';
import { SyncJob } from '../../models/SyncJob.js';
import { adapters } from '../platforms/index.js';

/**
 * Real-Time Multi-Platform Contest Ingestion Engine
 * Queries official live APIs for Codeforces, LeetCode, CodeChef, and AtCoder
 */
export const ingestContests = async () => {
  const startedAt = new Date().toISOString();
  console.log('🔄 [ContestIngestion] Ingesting REAL-TIME upcoming contests across platforms...');

  let totalProcessed = 0;
  const now = new Date();

  // Ingest from each platform adapter that supports contest discovery
  const platformsToQuery = ['codeforces', 'leetcode', 'codechef', 'atcoder'];

  for (const platformName of platformsToQuery) {
    const adapter = adapters[platformName];
    if (!adapter || typeof adapter.getContests !== 'function') continue;

    try {
      const realContests = await adapter.getContests();
      console.log(`[ContestIngestion] Fetched ${realContests.length} real contests from ${platformName.toUpperCase()}`);

      for (const contestData of realContests) {
        const start = new Date(contestData.startTime);
        const end = new Date(contestData.endTime);

        let status = 'upcoming';
        if (now >= start && now <= end) {
          status = 'live';
        } else if (now > end) {
          status = 'past';
        }

        const existing = await Contest.findOne({
          platform: contestData.platform,
          externalContestId: contestData.externalContestId
        });

        if (existing) {
          await Contest.findOneAndUpdate(
            { _id: existing._id },
            {
              $set: {
                title: contestData.title,
                url: contestData.contestUrl || contestData.registrationUrl,
                startTime: contestData.startTime,
                endTime: contestData.endTime,
                durationSeconds: (contestData.durationMinutes || 120) * 60,
                status,
                ratingRange: contestData.ratingRange || 'All Ratings',
                phase: contestData.phase || 'BEFORE'
              }
            }
          );
        } else {
          await Contest.create({
            title: contestData.title,
            platform: contestData.platform,
            externalContestId: contestData.externalContestId,
            url: contestData.contestUrl || contestData.registrationUrl,
            startTime: contestData.startTime,
            endTime: contestData.endTime,
            durationSeconds: (contestData.durationMinutes || 120) * 60,
            status,
            difficulty: contestData.ratingRange?.includes('Div 3')
              ? 'Div 3'
              : contestData.ratingRange?.includes('Div 2')
              ? 'Div 2'
              : contestData.ratingRange?.includes('Div 1')
              ? 'Div 1'
              : 'All Ratings',
            phase: contestData.phase || 'BEFORE'
          });
        }
        totalProcessed++;
      }
    } catch (err) {
      console.error(`[ContestIngestion] Error ingesting ${platformName} contests: ${err.message}`);
    }
  }

  // Update status of existing contests
  try {
    const allContests = await Contest.find({});
    for (const c of allContests) {
      const start = new Date(c.startTime);
      const end = new Date(c.endTime);
      let newStatus = c.status;

      if (now >= start && now <= end) {
        newStatus = 'live';
      } else if (now > end) {
        newStatus = 'past';
      } else if (now < start) {
        newStatus = 'upcoming';
      }

      if (newStatus !== c.status) {
        await Contest.findOneAndUpdate({ _id: c._id }, { $set: { status: newStatus } });
      }
    }
  } catch (err) {
    // non-blocking
  }

  // Record SyncJob
  await SyncJob.create({
    jobType: 'CONTEST_INGESTION',
    status: 'SUCCESS',
    details: {
      totalSynchronized: totalProcessed,
      startedAt,
      completedAt: new Date().toISOString()
    }
  });

  console.log(`✅ [ContestIngestion] Successfully synchronized ${totalProcessed} real contests.`);
  return { totalProcessed };
};

export default ingestContests;
