import PlatformAdapter from '../PlatformAdapter.js';

export class GFGAdapter extends PlatformAdapter {
  constructor() {
    super('gfg', 'https://www.geeksforgeeks.org/profile');
  }

  async getProfile(username) {
    if (!username || !username.trim()) {
      throw new Error('GeeksforGeeks username is required');
    }

    const cleanUsername = username.trim();

    // 1. Fetch public profile from GeeksforGeeks
    const res = await this.fetchWithTimeout(`https://www.geeksforgeeks.org/profile/${cleanUsername}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    }, 6000);

    if (res.status === 404) {
      throw new Error(`GeeksforGeeks user "${cleanUsername}" does not exist.`);
    }

    const html = await res.text();
    if (html.includes('Page Not Found') || html.includes('User Not Found') || html.includes('404')) {
      throw new Error(`GeeksforGeeks user "${cleanUsername}" does not exist.`);
    }

    let solved = 0;
    let score = 0;
    let rank = 'Coder';

    // Extract coding score
    const scoreMatch = html.match(/Coding Score:?[\s\S]*?>\s*([0-9]+)\s*</i) || html.match(/scoreCard_card_value[^>]*>\s*([0-9]+)\s*</);
    if (scoreMatch) {
      score = parseInt(scoreMatch[1], 10);
    }

    // Extract problems solved
    const solvedMatch = html.match(/Problems? Solved:?[\s\S]*?>\s*([0-9]+)\s*</i) || html.match(/total_problem_solved[^>]*>\s*([0-9]+)\s*</);
    if (solvedMatch) {
      solved = parseInt(solvedMatch[1], 10);
    }

    // Extract institute rank if available
    const instRankMatch = html.match(/Institute Rank:?[\s\S]*?>\s*([0-9]+)\s*</i);
    if (instRankMatch) {
      rank = `Campus Rank #${instRankMatch[1]}`;
    }

    return this.normalizeProfile({
      username: cleanUsername,
      rating: score,
      rank,
      solved,
      contests: 0,
      badges: score > 500 ? 3 : score > 100 ? 2 : score > 0 ? 1 : 0,
      streak: 0,
      profileUrl: `https://www.geeksforgeeks.org/profile/${cleanUsername}`,
      difficultyBreakdown: {
        easy: Math.round(solved * 0.55),
        medium: Math.round(solved * 0.35),
        hard: Math.max(0, solved - Math.round(solved * 0.55) - Math.round(solved * 0.35))
      },
      recentActivity: []
    });
  }

  async getStats(username) {
    const profile = await this.getProfile(username);
    return {
      solved: profile.solved,
      rating: profile.rating,
      rank: profile.rank
    };
  }

  async getContests() {
    return [];
  }
}

export default GFGAdapter;
