import PlatformAdapter from '../PlatformAdapter.js';

export class CodeChefAdapter extends PlatformAdapter {
  constructor() {
    super('codechef', 'https://www.codechef.com');
  }

  async getProfile(username) {
    if (!username || !username.trim()) {
      throw new Error('CodeChef username is required');
    }

    const cleanUsername = username.trim();

    // 1. Fetch public profile from CodeChef
    const res = await this.fetchWithTimeout(`https://www.codechef.com/users/${cleanUsername}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    }, 6000);

    if (res.status === 404) {
      throw new Error(`CodeChef user "${cleanUsername}" does not exist.`);
    }

    if (!res.ok) {
      throw new Error(`CodeChef profile request returned HTTP ${res.status}`);
    }

    const html = await res.text();

    // Check if user page actually exists (CodeChef sometimes returns 200 with "User not found")
    if (html.includes('User not found') || html.includes('Could not find user')) {
      throw new Error(`CodeChef user "${cleanUsername}" does not exist.`);
    }

    // Extract exact rating
    const ratingMatch = html.match(/class="rating-number"[^>]*>\s*([0-9]+)\s*<\/div>/);
    const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : 0;

    // Extract exact star rating (e.g. 1★ to 7★)
    let rank = 'Unrated';
    const starMatches = html.match(/&#9733;/g);
    if (starMatches && starMatches.length > 0) {
      rank = `${starMatches.length}★`;
    } else if (rating > 0) {
      const calcStars = rating < 1400 ? '1★' : rating < 1600 ? '2★' : rating < 1800 ? '3★' : rating < 2000 ? '4★' : rating < 2200 ? '5★' : rating < 2500 ? '6★' : '7★';
      rank = calcStars;
    }

    // Extract problems solved
    let solved = 0;
    const fullySolvedMatch = html.match(/Fully Solved\s*\(([0-9]+)\)/i);
    const totalSolvedMatch = html.match(/Total Problems Solved:\s*([0-9]+)/i);
    const problemsSolvedSpan = html.match(/<h5>Problems Solved:\s*<\/h5>\s*<span>([0-9]+)<\/span>/i);

    if (fullySolvedMatch) {
      solved = parseInt(fullySolvedMatch[1], 10);
    } else if (totalSolvedMatch) {
      solved = parseInt(totalSolvedMatch[1], 10);
    } else if (problemsSolvedSpan) {
      solved = parseInt(problemsSolvedSpan[1], 10);
    }

    // Extract global rank
    const globalRankMatch = html.match(/Global Rank:[^<]*<strong>\s*([0-9]+)\s*<\/strong>/i);
    const globalRank = globalRankMatch ? `#${parseInt(globalRankMatch[1], 10).toLocaleString()}` : null;

    // Extract contests attended count from rating graph script or estimate from history
    const contestMatches = html.match(/"code":"[^"]*","rating":/g);
    const contests = contestMatches ? contestMatches.length : (rating > 0 ? 1 : 0);

    return this.normalizeProfile({
      username: cleanUsername,
      rating,
      rank: globalRank ? `${rank} (${globalRank})` : rank,
      solved,
      contests,
      badges: starMatches ? starMatches.length : 0,
      streak: 0,
      profileUrl: `https://www.codechef.com/users/${cleanUsername}`,
      difficultyBreakdown: {
        easy: Math.round(solved * 0.6),
        medium: Math.round(solved * 0.3),
        hard: Math.max(0, solved - Math.round(solved * 0.6) - Math.round(solved * 0.3))
      },
      recentActivity: [],
      rawStats: {
        globalRank,
        starsCount: starMatches ? starMatches.length : 0
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
      const res = await this.fetchWithTimeout('https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=all', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      }, 5000);

      if (res.ok) {
        const data = await res.json();
        const future = data.future_contests || [];

        return future.map(c => {
          const startIso = c.contest_start_date_iso || new Date(c.contest_start_date).toISOString();
          const durationMins = parseInt(c.contest_duration || '120', 10);
          const endIso = c.contest_end_date_iso || new Date(new Date(startIso).getTime() + durationMins * 60000).toISOString();

          return {
            title: c.contest_name,
            platform: 'codechef',
            externalContestId: `cc-${c.contest_code}`,
            startTime: startIso,
            endTime: endIso,
            durationMinutes: durationMins,
            registrationUrl: `https://www.codechef.com/${c.contest_code}`,
            contestUrl: `https://www.codechef.com/${c.contest_code}`,
            status: 'upcoming',
            ratingRange: 'All Divisions (Div 1, 2, 3, 4)'
          };
        });
      }
    } catch (e) {
      console.warn(`[CodeChefAdapter] Failed to fetch real upcoming contests: ${e.message}`);
    }
    return [];
  }
}

export default CodeChefAdapter;
