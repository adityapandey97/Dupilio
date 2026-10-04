import PlatformAdapter from '../PlatformAdapter.js';

export class LeetCodeAdapter extends PlatformAdapter {
  constructor() {
    super('leetcode', 'https://leetcode.com');
  }

  async getProfile(username) {
    if (!username || !username.trim()) {
      throw new Error('LeetCode username is required');
    }

    const cleanUsername = username.trim();
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            ranking
            reputation
            userAvatar
            realName
            aboutMe
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          badges {
            id
            displayName
            icon
          }
        }
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
          globalRanking
          totalParticipants
          topPercentage
          badge {
            name
          }
        }
        recentSubmissionList(username: $username, limit: 10) {
          title
          titleSlug
          statusDisplay
          timestamp
        }
      }
    `;

    let data = null;

    // 1. Fetch live data from LeetCode official GraphQL API
    try {
      const res = await this.fetchWithTimeout('https://leetcode.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': 'https://leetcode.com'
        },
        body: JSON.stringify({ query, variables: { username: cleanUsername } })
      }, 6000);

      if (res.ok) {
        const json = await res.json();
        if (json.errors && json.errors.length > 0) {
          const errMsg = json.errors[0].message || '';
          if (errMsg.toLowerCase().includes('not exist') || errMsg.toLowerCase().includes('cannot find')) {
            throw new Error(`LeetCode user "${cleanUsername}" does not exist.`);
          }
        }
        if (json.data && json.data.matchedUser) {
          data = json.data;
        }
      }
    } catch (err) {
      if (err.message.includes('does not exist')) {
        throw err;
      }
      console.warn(`[LeetCodeAdapter] Primary GraphQL request failed: ${err.message}. Trying backup public API...`);
    }

    // 2. Backup check via Alfa LeetCode API if primary GraphQL had transient network timeout
    if (!data) {
      try {
        const backupRes = await this.fetchWithTimeout(`https://alfa-leetcode-api.onrender.com/userProfile/${cleanUsername}`, {}, 5000);
        if (backupRes.ok) {
          const backupJson = await backupRes.json();
          if (backupJson.totalSolved !== undefined) {
            const easy = (backupJson.totalSubmissions || []).find(s => s.difficulty === 'Easy')?.count || 0;
            const medium = (backupJson.totalSubmissions || []).find(s => s.difficulty === 'Medium')?.count || 0;
            const hard = (backupJson.totalSubmissions || []).find(s => s.difficulty === 'Hard')?.count || 0;
            
            return this.normalizeProfile({
              username: cleanUsername,
              rating: backupJson.ranking ? Math.max(0, Math.round(2500 - Math.min(backupJson.ranking / 100, 1500))) : 0,
              rank: backupJson.ranking ? `#${backupJson.ranking.toLocaleString()}` : 'Unranked',
              solved: backupJson.totalSolved || 0,
              contests: 0,
              badges: 0,
              streak: 0,
              profileUrl: `https://leetcode.com/u/${cleanUsername}/`,
              difficultyBreakdown: { easy, medium, hard },
              recentActivity: [],
              rawStats: backupJson
            });
          }
        }
      } catch (backupErr) {
        // backup failed
      }

      throw new Error(`Failed to verify LeetCode profile for "${cleanUsername}". Please verify the username exists on LeetCode.`);
    }

    const user = data.matchedUser;
    const contest = data.userContestRanking;
    const acList = user.submitStatsGlobal?.acSubmissionNum || [];

    const totalSolved = acList.find(a => a.difficulty === 'All')?.count || 0;
    const easySolved = acList.find(a => a.difficulty === 'Easy')?.count || 0;
    const mediumSolved = acList.find(a => a.difficulty === 'Medium')?.count || 0;
    const hardSolved = acList.find(a => a.difficulty === 'Hard')?.count || 0;

    const contestRating = contest?.rating ? Math.round(contest.rating) : 0;
    const globalRank = contest?.globalRanking 
      ? `#${contest.globalRanking.toLocaleString()}` 
      : user.profile?.ranking 
      ? `#${user.profile.ranking.toLocaleString()}` 
      : 'Unranked';

    const badgesCount = (user.badges || []).length;
    const contestCount = contest?.attendedContestsCount || 0;

    const recentSubmissions = (data.recentSubmissionList || []).map(sub => ({
      title: sub.title || 'Coding Problem',
      status: sub.statusDisplay || 'Accepted',
      timestamp: sub.timestamp ? new Date(Number(sub.timestamp) * 1000).toISOString() : new Date().toISOString()
    }));

    return this.normalizeProfile({
      username: cleanUsername,
      rating: contestRating,
      rank: contest?.badge?.name ? `${contest.badge.name} (${globalRank})` : globalRank,
      solved: totalSolved,
      contests: contestCount,
      badges: badgesCount,
      streak: 0,
      profileUrl: `https://leetcode.com/u/${cleanUsername}/`,
      difficultyBreakdown: {
        easy: easySolved,
        medium: mediumSolved,
        hard: hardSolved
      },
      recentActivity: recentSubmissions,
      rawStats: {
        reputation: user.profile?.reputation || 0,
        topPercentage: contest?.topPercentage || null,
        badgeName: contest?.badge?.name || null
      }
    });
  }

  async getStats(username) {
    const profile = await this.getProfile(username);
    return {
      solved: profile.solved,
      rating: profile.rating,
      rank: profile.rank,
      difficultyBreakdown: profile.difficultyBreakdown
    };
  }

  async getContests() {
    try {
      const q = `query {
        allContests {
          title
          titleSlug
          startTime
          duration
        }
      }`;

      const res = await this.fetchWithTimeout('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      }, 5000);

      if (res.ok) {
        const json = await res.json();
        const contests = json.data?.allContests || [];
        const nowSec = Math.floor(Date.now() / 1000);

        return contests
          .filter(c => c.startTime > nowSec)
          .map(c => ({
            title: c.title,
            platform: 'leetcode',
            externalContestId: `lc-${c.titleSlug}`,
            startTime: new Date(c.startTime * 1000).toISOString(),
            endTime: new Date((c.startTime + c.duration) * 1000).toISOString(),
            durationMinutes: Math.round(c.duration / 60),
            registrationUrl: `https://leetcode.com/contest/${c.titleSlug}`,
            contestUrl: `https://leetcode.com/contest/${c.titleSlug}`,
            status: 'upcoming',
            ratingRange: 'All Ratings'
          }));
      }
    } catch (e) {
      console.warn(`[LeetCodeAdapter] Failed to fetch real upcoming contests: ${e.message}`);
    }
    return [];
  }
}

export default LeetCodeAdapter;
