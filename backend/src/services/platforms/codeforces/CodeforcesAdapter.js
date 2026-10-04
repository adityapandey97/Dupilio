import PlatformAdapter from '../PlatformAdapter.js';

export class CodeforcesAdapter extends PlatformAdapter {
  constructor() {
    super('codeforces', 'https://codeforces.com');
  }

  async getProfile(username) {
    if (!username || !username.trim()) {
      throw new Error('Codeforces username is required');
    }

    const cleanUsername = username.trim();

    // 1. Fetch user info
    const infoRes = await this.fetchWithTimeout(`https://codeforces.com/api/user.info?handles=${cleanUsername}`, {}, 5000);
    if (!infoRes.ok) {
      throw new Error(`Codeforces request failed with status ${infoRes.status}`);
    }

    const infoData = await infoRes.json();
    if (infoData.status !== 'OK' || !Array.isArray(infoData.result) || !infoData.result[0]) {
      throw new Error(`Codeforces user "${cleanUsername}" does not exist.`);
    }

    const user = infoData.result[0];
    const rating = user.rating || 0;
    const maxRating = user.maxRating || rating;
    const rank = user.rank ? (user.rank.charAt(0).toUpperCase() + user.rank.slice(1)) : (rating === 0 ? 'Unrated' : 'Newbie');

    // 2. Fetch rating history for exact contest count
    let contestsCount = 0;
    try {
      const ratingRes = await this.fetchWithTimeout(`https://codeforces.com/api/user.rating?handle=${cleanUsername}`, {}, 5000);
      if (ratingRes.ok) {
        const ratingData = await ratingRes.json();
        if (ratingData.status === 'OK' && Array.isArray(ratingData.result)) {
          contestsCount = ratingData.result.length;
        }
      }
    } catch (e) {
      // non-critical
    }

    // 3. Fetch submissions for exact problems solved and difficulty breakdown
    let solvedCount = 0;
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;
    let recentActivity = [];

    try {
      const statusRes = await this.fetchWithTimeout(`https://codeforces.com/api/user.status?handle=${cleanUsername}&from=1&count=2000`, {}, 6000);
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        if (statusData.status === 'OK' && Array.isArray(statusData.result)) {
          const solvedSet = new Set();

          statusData.result.forEach(sub => {
            if (sub.verdict === 'OK' && sub.problem) {
              const pId = `${sub.problem.contestId || ''}${sub.problem.index || ''}`;
              if (!solvedSet.has(pId)) {
                solvedSet.add(pId);
                const probRating = sub.problem.rating || 1000;
                if (probRating < 1300) easyCount++;
                else if (probRating < 1800) mediumCount++;
                else hardCount++;
              }
            }

            if (recentActivity.length < 5 && sub.problem) {
              recentActivity.push({
                title: `${sub.problem.index} - ${sub.problem.name}`,
                status: sub.verdict === 'OK' ? 'Accepted' : sub.verdict,
                timestamp: new Date(sub.creationTimeSeconds * 1000).toISOString()
              });
            }
          });

          solvedCount = solvedSet.size;
        }
      }
    } catch (e) {
      console.warn(`[CodeforcesAdapter] Status fetch warning for ${cleanUsername}: ${e.message}`);
    }

    return this.normalizeProfile({
      username: cleanUsername,
      rating,
      rank,
      solved: solvedCount,
      contests: contestsCount,
      badges: rating >= 2400 ? 5 : rating >= 1900 ? 4 : rating >= 1600 ? 3 : rating >= 1400 ? 2 : rating > 0 ? 1 : 0,
      streak: 0,
      profileUrl: `https://codeforces.com/profile/${cleanUsername}`,
      difficultyBreakdown: {
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount
      },
      recentActivity,
      rawStats: {
        maxRating,
        contribution: user.contribution || 0,
        friendOfCount: user.friendOfCount || 0
      }
    });
  }

  async getStats(username) {
    const profile = await this.getProfile(username);
    return {
      rating: profile.rating,
      rank: profile.rank,
      solved: profile.solved,
      contests: profile.contests
    };
  }

  async getContests() {
    try {
      const res = await this.fetchWithTimeout('https://codeforces.com/api/contest.list?gym=false', {}, 5000);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'OK' && Array.isArray(data.result)) {
          const upcoming = data.result
            .filter(c => c.phase === 'BEFORE')
            .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);

          return upcoming.map(c => ({
            title: c.name,
            platform: 'codeforces',
            externalContestId: `cf-${c.id}`,
            startTime: new Date(c.startTimeSeconds * 1000).toISOString(),
            endTime: new Date((c.startTimeSeconds + c.durationSeconds) * 1000).toISOString(),
            durationMinutes: Math.round(c.durationSeconds / 60),
            registrationUrl: `https://codeforces.com/contestRegistration/${c.id}`,
            contestUrl: `https://codeforces.com/contest/${c.id}`,
            status: 'upcoming',
            ratingRange: c.name.includes('Div. 1') && c.name.includes('Div. 2')
              ? 'All Ratings'
              : c.name.includes('Div. 3')
              ? 'Rating < 1600'
              : c.name.includes('Div. 4')
              ? 'Rating < 1400'
              : c.name.includes('Div. 2')
              ? 'Rating < 2100'
              : 'Div. 1 (Rating >= 1900)',
            phase: c.phase
          }));
        }
      }
    } catch (err) {
      console.warn(`[CodeforcesAdapter] Failed to fetch real upcoming contests: ${err.message}`);
    }
    return [];
  }
}

export default CodeforcesAdapter;
