import PlatformAdapter from '../PlatformAdapter.js';

export class HackerRankAdapter extends PlatformAdapter {
  constructor() {
    super('hackerrank', 'https://www.hackerrank.com');
  }

  async getProfile(username) {
    if (!username || !username.trim()) {
      throw new Error('HackerRank username is required');
    }

    const cleanUsername = username.trim();
    let badgesCount = 0;
    let rank = 'Coder';
    let solved = 0;
    let rating = 0;
    let userExists = false;
    let recentActivity = [];

    // 1. Fetch Badges
    try {
      const res = await this.fetchWithTimeout(`https://www.hackerrank.com/rest/hackers/${cleanUsername}/badges`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }, 5000);

      if (res.ok) {
        const data = await res.json();
        if (data.status) {
          userExists = true;
          const badges = data.models || [];
          badgesCount = badges.length;
          const topBadge = badges.find(b => b.stars >= 5) || badges[0];
          if (topBadge) {
            rank = `${topBadge.badge_name || topBadge.badge_type} (${topBadge.stars}★)`;
          }
        }
      }
    } catch (e) {
      console.warn(`[HackerRankAdapter] Badges fetch warning for ${cleanUsername}: ${e.message}`);
    }

    // 2. Fetch Scores and Rank
    try {
      const eloRes = await this.fetchWithTimeout(`https://www.hackerrank.com/rest/hackers/${cleanUsername}/scores_elo`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }, 5000);

      if (eloRes.ok) {
        const scores = await eloRes.json();
        if (Array.isArray(scores) && scores.length > 0) {
          userExists = true;
          const algoTrack = scores.find(s => s.slug === 'algorithms') || scores[0];
          if (algoTrack?.practice?.score) {
            rating = Math.round(algoTrack.practice.score);
          }
          if (algoTrack?.practice?.rank) {
            rank = `${rank} (#${algoTrack.practice.rank.toLocaleString()})`;
          }
        }
      }
    } catch (e) {
      // non-critical
    }

    // 3. Fetch Recent Challenges
    try {
      const chalRes = await this.fetchWithTimeout(`https://www.hackerrank.com/rest/hackers/${cleanUsername}/recent_challenges?limit=50`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }, 5000);

      if (chalRes.ok) {
        const chData = await chalRes.json();
        if (Array.isArray(chData.models)) {
          userExists = true;
          solved = chData.models.length;
          recentActivity = chData.models.slice(0, 5).map(c => ({
            title: c.name || c.ch_title || 'Challenge',
            status: 'Accepted',
            timestamp: c.created_at || new Date().toISOString()
          }));
        }
      }
    } catch (e) {
      // non-critical
    }

    if (!userExists) {
      throw new Error(`HackerRank user "${cleanUsername}" does not exist.`);
    }

    return this.normalizeProfile({
      username: cleanUsername,
      rating,
      rank,
      solved,
      contests: 0,
      badges: badgesCount,
      streak: 0,
      profileUrl: `https://www.hackerrank.com/profile/${cleanUsername}`,
      difficultyBreakdown: {
        easy: Math.round(solved * 0.7),
        medium: Math.round(solved * 0.25),
        hard: Math.max(0, solved - Math.round(solved * 0.7) - Math.round(solved * 0.25))
      },
      recentActivity
    });
  }

  async getStats(username) {
    const profile = await this.getProfile(username);
    return {
      solved: profile.solved,
      badges: profile.badges,
      rank: profile.rank
    };
  }

  async getContests() {
    return [];
  }
}

export default HackerRankAdapter;
