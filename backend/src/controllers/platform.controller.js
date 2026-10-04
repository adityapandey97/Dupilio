import { PlatformProfile } from '../models/PlatformProfile.js';
import { User } from '../models/User.js';
import { adapters, getAdapter, getSupportedPlatforms } from '../services/platforms/index.js';
import { calculateDupilioScore } from '../services/score/scoreEngine.js';

// @desc    Get all supported platforms
// @route   GET /api/v1/platforms/supported
export const listSupportedPlatforms = async (req, res, next) => {
  try {
    const platforms = getSupportedPlatforms();
    res.json({ success: true, platforms });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's connected platforms
// @route   GET /api/v1/platforms
export const getUserPlatforms = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const profiles = await PlatformProfile.find({ userId });
    res.json({ success: true, count: profiles.length, profiles });
  } catch (err) {
    next(err);
  }
};

// @desc    Connect or update a coding platform profile
// @route   POST /api/v1/platforms/connect
export const connectPlatform = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { platform, username } = req.body;

    if (!platform || !username || !username.trim()) {
      return res.status(400).json({ success: false, message: 'Platform name and username are required.' });
    }

    const adapter = getAdapter(platform);
    if (!adapter) {
      return res.status(400).json({ success: false, message: `Platform "${platform}" is not supported.` });
    }

    console.log(`🔗 [Platforms] Connecting ${platform} handle "${username}" for user ${req.user.name}`);

    // Fetch live normalized profile directly from platform
    let normalized = null;
    try {
      normalized = await adapter.getProfile(username.trim());
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || `Failed to verify ${platform.toUpperCase()} username "${username}". Please check the handle.`
      });
    }

    // Upsert into PlatformProfile
    const profile = await PlatformProfile.findOneAndUpdate(
      { userId, platform: platform.toLowerCase() },
      { $set: { ...normalized, userId, connectionStatus: 'connected' } },
      { upsert: true, new: true }
    );

    // Keep User model in sync
    const user = await User.findById(userId);
    if (user) {
      const currentProfiles = user.profile?.codingProfiles || {};
      currentProfiles[platform.toLowerCase()] = username.trim();
      
      const allUserProfiles = await PlatformProfile.find({ userId });
      const score = calculateDupilioScore(allUserProfiles, {});

      await User.findByIdAndUpdate(userId, {
        $set: {
          'profile.codingProfiles': currentProfiles,
          developerScore: score
        }
      });
    }

    res.json({
      success: true,
      message: `${platform.toUpperCase()} profile connected and synchronized with live data.`,
      profile
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Sync a single connected platform
// @route   POST /api/v1/platforms/:platform/sync
export const syncPlatform = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { platform } = req.params;

    const existing = await PlatformProfile.findOne({ userId, platform: platform.toLowerCase() });
    if (!existing) {
      return res.status(404).json({ success: false, message: `Platform ${platform} is not connected.` });
    }

    const adapter = getAdapter(platform);
    let normalized = null;
    try {
      normalized = await adapter.getProfile(existing.username);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: `Failed to refresh ${platform.toUpperCase()} live data: ${err.message}`
      });
    }

    const updated = await PlatformProfile.findOneAndUpdate(
      { userId, platform: platform.toLowerCase() },
      { $set: { ...normalized, connectionStatus: 'connected' } },
      { new: true }
    );

    // Recalculate Dupilio Score
    const allUserProfiles = await PlatformProfile.find({ userId });
    const score = calculateDupilioScore(allUserProfiles, {});
    await User.findByIdAndUpdate(userId, { $set: { developerScore: score } });

    res.json({
      success: true,
      message: `${platform.toUpperCase()} profile refreshed with real-time stats.`,
      profile: updated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Sync all connected platforms for user
// @route   POST /api/v1/platforms/sync-all
export const syncAllPlatforms = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const profiles = await PlatformProfile.find({ userId });

    const results = [];
    for (const p of profiles) {
      const adapter = adapters[p.platform];
      if (adapter) {
        try {
          const normalized = await adapter.getProfile(p.username);
          const updated = await PlatformProfile.findOneAndUpdate(
            { _id: p._id },
            { $set: { ...normalized, connectionStatus: 'connected' } },
            { new: true }
          );
          results.push(updated);
        } catch (err) {
          results.push(p);
        }
      }
    }

    const updatedProfiles = await PlatformProfile.find({ userId });
    const score = calculateDupilioScore(updatedProfiles, {});
    await User.findByIdAndUpdate(userId, { $set: { developerScore: score } });

    res.json({
      success: true,
      message: `Synchronized ${results.length} connected platforms in real time.`,
      profiles: results,
      developerScore: score
    });
  } catch (err) {
    next(err);
  }
};

export const syncAllUserPlatforms = syncAllPlatforms;

// @desc    Disconnect a platform profile
// @route   DELETE /api/v1/platforms/:platform
export const disconnectPlatform = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { platform } = req.params;

    await PlatformProfile.deleteMany({ userId, platform: platform.toLowerCase() });

    const user = await User.findById(userId);
    if (user && user.profile?.codingProfiles) {
      delete user.profile.codingProfiles[platform.toLowerCase()];
      const allUserProfiles = await PlatformProfile.find({ userId });
      const score = calculateDupilioScore(allUserProfiles, {});
      await User.findByIdAndUpdate(userId, {
        $set: {
          'profile.codingProfiles': user.profile.codingProfiles,
          developerScore: score
        }
      });
    }

    res.json({ success: true, message: `${platform.toUpperCase()} disconnected.` });
  } catch (err) {
    next(err);
  }
};

export default {
  listSupportedPlatforms,
  getUserPlatforms,
  connectPlatform,
  syncPlatform,
  syncAllPlatforms,
  disconnectPlatform
};
