/**
 * Base PlatformAdapter for Dupilio
 * All external platform integrations extend this adapter to provide normalized developer data.
 */

export class PlatformAdapter {
  constructor(platformName, baseUrl = '') {
    this.platform = platformName;
    this.baseUrl = baseUrl;
  }

  /**
   * Safe fetch with configurable timeout and abort controller
   */
  async fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'User-Agent': 'Dupilio-Developer-Hub/1.0',
          Accept: 'application/json',
          ...(options.headers || {})
        }
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Fetch full user profile & stats normalized into Dupilio standard structure
   * @param {string} username
   * @returns {Promise<NormalizedProfile>}
   */
  async getProfile(username) {
    throw new Error(`getProfile() not implemented for platform ${this.platform}`);
  }

  /**
   * Fetch standalone statistics for lightweight sync
   * @param {string} username
   */
  async getStats(username) {
    throw new Error(`getStats() not implemented for platform ${this.platform}`);
  }

  /**
   * Fetch live/upcoming contests hosted on this platform
   * @returns {Promise<Array<NormalizedContest>>}
   */
  async getContests() {
    return [];
  }

  /**
   * Fetch recent submission/commit activity
   * @param {string} username
   */
  async getRecentActivity(username) {
    return [];
  }

  /**
   * Normalize into standard Dupilio profile object
   */
  normalizeProfile({
    username,
    rating = 0,
    rank = 'Unranked',
    solved = 0,
    contests = 0,
    badges = 0,
    streak = 0,
    profileUrl = '',
    recentActivity = [],
    difficultyBreakdown = { easy: 0, medium: 0, hard: 0 },
    rawStats = {}
  }) {
    return {
      platform: this.platform,
      username,
      rating: Number(rating) || 0,
      rank: rank || 'Unranked',
      solved: Number(solved) || 0,
      contests: Number(contests) || 0,
      badges: Number(badges) || 0,
      streak: Number(streak) || 0,
      profileUrl: profileUrl || `${this.baseUrl}/${username}`,
      recentActivity: Array.isArray(recentActivity) ? recentActivity : [],
      difficultyBreakdown: {
        easy: Number(difficultyBreakdown?.easy) || 0,
        medium: Number(difficultyBreakdown?.medium) || 0,
        hard: Number(difficultyBreakdown?.hard) || 0
      },
      rawStats,
      connectionStatus: 'connected',
      lastSyncedAt: new Date().toISOString()
    };
  }
}

export default PlatformAdapter;
