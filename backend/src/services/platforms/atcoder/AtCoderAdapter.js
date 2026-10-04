import PlatformAdapter from '../PlatformAdapter.js';

export class AtCoderAdapter extends PlatformAdapter {
  constructor() {
    super('atcoder', 'https://atcoder.jp');
  }

  async getProfile(username) {
    if (!username || !username.trim()) {
      throw new Error('AtCoder username is required');
    }

    const cleanUsername = username.trim();

    let rating = 0;
    let rank = 'Unrated';
    let contests = 0;
    let solved = 0;
    let maxRating = 0;
    let userExists = false;

    // 1. Fetch user contest history from official AtCoder endpoint
    try {
      const res = await this.fetchWithTimeout(`https://atcoder.jp/users/${cleanUsername}/history/json`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      }, 5000);

      if (res.ok) {
        const history = await res.json();
        if (Array.isArray(history)) {
          userExists = true;
          if (history.length > 0) {
            contests = history.length;
            const last = history[history.length - 1];
            rating = last.NewRating || 0;
            maxRating = Math.max(...history.map(h => h.NewRating || 0));

            // AtCoder Rating Colors
            if (rating >= 2800) rank = 'Red';
            else if (rating >= 2400) rank = 'Orange';
            else if (rating >= 2000) rank = 'Yellow';
            else if (rating >= 1600) rank = 'Blue';
            else if (rating >= 1200) rank = 'Cyan';
            else if (rating >= 800) rank = 'Green';
            else if (rating >= 400) rank = 'Brown';
            else if (rating > 0) rank = 'Gray';
          }
        }
      } else if (res.status === 404) {
        // May still check Kenkoooo
      }
    } catch (err) {
      console.warn(`[AtCoderAdapter] Contest history fetch warning for ${cleanUsername}: ${err.message}`);
    }

    // 2. Fetch problems solved from Kenkoooo API
    try {
      const kenkoRes = await this.fetchWithTimeout(`https://kenkoooo.com/atcoder/atcoder-api/v2/user_info?user=${cleanUsername}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }, 5000);

      if (kenkoRes.ok) {
        const info = await kenkoRes.json();
        if (info && info.user_id) {
          userExists = true;
          solved = info.accepted_count || 0;
          if (info.accepted_count_rank) {
            rank = `${rank} (#${info.accepted_count_rank.toLocaleString()})`;
          }
        }
      }
    } catch (e) {
      // non-critical
    }

    if (!userExists) {
      throw new Error(`AtCoder user "${cleanUsername}" does not exist.`);
    }

    return this.normalizeProfile({
      username: cleanUsername,
      rating,
      rank,
      solved,
      contests,
      badges: rating >= 2000 ? 4 : rating >= 1600 ? 3 : rating >= 1200 ? 2 : rating > 0 ? 1 : 0,
      streak: 0,
      profileUrl: `https://atcoder.jp/users/${cleanUsername}`,
      difficultyBreakdown: {
        easy: Math.round(solved * 0.5),
        medium: Math.round(solved * 0.35),
        hard: Math.max(0, solved - Math.round(solved * 0.5) - Math.round(solved * 0.35))
      },
      recentActivity: [],
      rawStats: {
        maxRating
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
      const res = await this.fetchWithTimeout('https://atcoder.jp/contests/', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      }, 5000);

      if (res.ok) {
        const html = await res.text();
        const upcomingMatch = html.match(/id="contest-table-upcoming"([\s\S]*?)<\/table>/);
        if (upcomingMatch) {
          const rows = upcomingMatch[1].match(/<tr[\s\S]*?<\/tr>/g) || [];
          const contests = [];

          rows.slice(1).forEach(r => {
            const titleMatch = r.match(/<a href="\/contests\/([^"]+)">([^<]+)<\/a>/);
            const timeMatch = r.match(/<time[^>]*>([^<]+)<\/time>/);
            const durationMatch = r.match(/<td>([0-9]{2}):([0-9]{2})<\/td>/);

            if (titleMatch && timeMatch) {
              const slug = titleMatch[1];
              const title = titleMatch[2].trim();
              const startTimeStr = timeMatch[1].trim();
              const startTime = new Date(startTimeStr).toISOString();

              let durationMinutes = 100;
              if (durationMatch) {
                durationMinutes = parseInt(durationMatch[1], 10) * 60 + parseInt(durationMatch[2], 10);
              }

              const endTime = new Date(new Date(startTime).getTime() + durationMinutes * 60000).toISOString();

              contests.push({
                title,
                platform: 'atcoder',
                externalContestId: `atcoder-${slug}`,
                startTime,
                endTime,
                durationMinutes,
                registrationUrl: `https://atcoder.jp/contests/${slug}`,
                contestUrl: `https://atcoder.jp/contests/${slug}`,
                status: 'upcoming',
                ratingRange: title.includes('Beginner') ? 'Rating < 2000' : title.includes('Regular') ? 'All Ratings' : 'Open to All'
              });
            }
          });

          return contests;
        }
      }
    } catch (err) {
      console.warn(`[AtCoderAdapter] Failed to fetch real upcoming contests: ${err.message}`);
    }
    return [];
  }
}

export default AtCoderAdapter;
