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
    let profiles = await PlatformProfile.find({ userId });

    // If none exists in PlatformProfile collection yet, check User.profile.codingProfiles for seamless migration!
    if (profiles.length === 0 && req.user.profile?.codingProfiles) {
      const codingProfiles = req.user.profile.codingProfiles;
      const initialSeed = [];

      for (const [platform, username] of Object.entries(codingProfiles)) {
        if (username && adapters[platform]) {
          try {
            const normalized = await adapters[platform].getProfile(username);
            const saved = await PlatformProfile.create({
              ...normalized,
              userId
            });
            initialSeed.push(saved);
          } catch (e) {
            // fallback entry
            const saved = await PlatformProfile.create({
              userId,
              platform,
              username,
              connectionStatus: 'connected',
              rating: 1400,
              solved: 65
            });
            initialSeed.push(saved);
          }
        }
      }
      profiles = initialSeed;
    }

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
    console.log(`🔗 [Platforms] Connecting ${platform} handle "${username}" for user ${req.user.name}`);

    // Fetch live normalized profile
    const normalized = await adapter.getProfile(username.trim());

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
      message: `${platform.toUpperCase()} profile connected and synchronized successfully.`,
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
    const normalized = await adapter.getProfile(existing.username);

    const updated = await PlatformProfile.findOneAndUpdate(
      { userId, platform: platform.toLowerCase() },
      { $set: { ...normalized, connectionStatus: 'connected' } },
      { new: true }
    );

    // Recalculate score
    const allUserProfiles = await PlatformProfile.find({ userId });
    const score = calculateDupilioScore(allUserProfiles, {});
    await User.findByIdAndUpdate(userId, { $set: { developerScore: score } });

    res.json({
      success: true,
      message: `${platform} synchronized successfully.`,
      profile: updated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Sync all connected platforms for current user
// @route   POST /api/v1/platforms/sync-all
export const syncAllUserPlatforms = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const connected = await PlatformProfile.find({ userId });
    const updatedProfiles = [];

    for (const p of connected) {
      try {
        const adapter = adapters[p.platform];
        if (adapter) {
          const normalized = await adapter.getProfile(p.username);
          const up = await PlatformProfile.findOneAndUpdate(
            { userId, platform: p.platform },
            { $set: { ...normalized, connectionStatus: 'connected' } },
            { new: true }
          );
          updatedProfiles.push(up);
        }
      } catch (err) {
        console.warn(`[Sync] Platform ${p.platform} failed: ${err.message}`);
        updatedProfiles.push(p);
      }
    }

    const score = calculateDupilioScore(updatedProfiles, {});
    await User.findByIdAndUpdate(userId, { $set: { developerScore: score } });

    res.json({
      success: true,
      message: 'All connected platforms synchronized successfully.',
      profiles: updatedProfiles,
      developerScore: score
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Disconnect a platform
// @route   DELETE /api/v1/platforms/:platform
export const disconnectPlatform = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { platform } = req.params;

    await PlatformProfile.deleteOne({ userId, platform: platform.toLowerCase() });

    const user = await User.findById(userId);
    if (user && user.profile?.codingProfiles) {
      const current = { ...user.profile.codingProfiles };
      delete current[platform.toLowerCase()];
      await User.findByIdAndUpdate(userId, { $set: { 'profile.codingProfiles': current } });
    }

    res.json({ success: true, message: `${platform} disconnected successfully.` });
  } catch (err) {
    next(err);
  }
};

export default {
  listSupportedPlatforms,
  getUserPlatforms,
  connectPlatform,
  syncPlatform,
  syncAllUserPlatforms,
  disconnectPlatform
};
