import cron from 'node-cron';
import { ingestContests } from '../contests/contestIngestion.js';
import { processDueReminders } from '../reminders/reminderEngine.js';
import { User } from '../../models/User.js';
import { PlatformProfile } from '../../models/PlatformProfile.js';
import { adapters } from '../platforms/index.js';
import { calculateDupilioScore } from '../score/scoreEngine.js';

let isInitialized = false;

export const syncAllActiveProfiles = async () => {
  console.log('🔄 [SyncEngine] Starting periodic profile sync for active users...');
  try {
    const users = await User.find({});
    for (const user of users) {
      const codingProfiles = user.profile?.codingProfiles || {};
      const updatedProfilesList = [];

      for (const [plat, username] of Object.entries(codingProfiles)) {
        if (username && adapters[plat]) {
          try {
            const normalized = await adapters[plat].getProfile(username);
            const savedProfile = await PlatformProfile.findOneAndUpdate(
              { userId: user._id, platform: plat },
              { $set: { ...normalized, userId: user._id } },
              { upsert: true, new: true }
            );
            updatedProfilesList.push(savedProfile);
          } catch (platErr) {
            console.warn(`[SyncEngine] Skip ${plat} for ${username}: ${platErr.message}`);
          }
        }
      }

      // Recompute Dupilio Developer Score
      if (updatedProfilesList.length > 0) {
        const scoreData = calculateDupilioScore(updatedProfilesList, {});
        await User.findByIdAndUpdate(user._id, {
          $set: { developerScore: scoreData }
        });
      }
    }
    console.log('✅ [SyncEngine] Periodic profile synchronization complete.');
  } catch (err) {
    console.error(`❌ [SyncEngine] Profile sync failed: ${err.message}`);
  }
};

export const initSyncCron = () => {
  if (isInitialized) return;
  isInitialized = true;
  console.log('⏱️  [SyncEngine] Initializing background cron jobs...');

  // 1. Process due reminders every minute
  cron.schedule('* * * * *', async () => {
    try {
      await processDueReminders();
    } catch (e) {
      console.warn(`[SyncEngine] Reminder cron error: ${e.message}`);
    }
  });

  // 2. Refresh contests every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      await ingestContests();
    } catch (e) {
      console.warn(`[SyncEngine] Contest cron error: ${e.message}`);
    }
  });

  // 3. Periodic profile sync every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    try {
      await syncAllActiveProfiles();
    } catch (e) {
      console.warn(`[SyncEngine] Profile sync cron error: ${e.message}`);
    }
  });

  // Initial immediate lightweight ingestion
  setTimeout(async () => {
    try {
      await ingestContests();
    } catch (e) {
      console.log('Initial contest ingestion handled safely.');
    }
  }, 2000);
};

export default { initSyncCron, syncAllActiveProfiles };
