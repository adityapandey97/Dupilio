import PlatformAdapter from '../PlatformAdapter.js';

export class GitHubAdapter extends PlatformAdapter {
  constructor() {
    super('github', 'https://github.com');
  }

  async getProfile(username) {
    if (!username || !username.trim()) {
      throw new Error('GitHub username is required');
    }

    const cleanUsername = username.trim();
    const headers = { 'User-Agent': 'Dupilio-Developer-Hub' };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    // 1. Fetch user basics
    const userRes = await this.fetchWithTimeout(`https://api.github.com/users/${cleanUsername}`, { headers }, 5000);
    if (userRes.status === 404) {
      throw new Error(`GitHub user "${cleanUsername}" does not exist.`);
    }

    if (!userRes.ok) {
      throw new Error(`GitHub request failed with HTTP ${userRes.status}`);
    }

    const u = await userRes.json();
    const totalRepos = u.public_repos || 0;
    const followers = u.followers || 0;

    let totalStars = 0;
    let languages = [];
    let topRepositories = [];
    let recentActivity = [];

    // 2. Fetch public repos to calculate total stars and language distribution
    try {
      const reposRes = await this.fetchWithTimeout(`https://api.github.com/users/${cleanUsername}/repos?sort=updated&per_page=100`, { headers }, 6000);
      if (reposRes.ok) {
        const repos = await reposRes.json();
        if (Array.isArray(repos)) {
          const langMap = {};

          repos.forEach(r => {
            totalStars += (r.stargazers_count || 0);
            if (r.language) {
              langMap[r.language] = (langMap[r.language] || 0) + 1;
            }
          });

          const totalLangRepos = Object.values(langMap).reduce((a, b) => a + b, 0) || 1;
          languages = Object.entries(langMap).map(([lang, count]) => ({
            language: lang,
            percentage: Math.round((count / totalLangRepos) * 100),
            repos: count
          })).sort((a, b) => b.percentage - a.percentage).slice(0, 5);

          topRepositories = repos
            .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
            .slice(0, 4)
            .map(r => ({
              name: r.name,
              description: r.description || 'Open source software project',
              language: r.language || 'Code',
              stars: r.stargazers_count || 0,
              url: r.html_url
            }));
        }
      }
    } catch (e) {
      console.warn(`[GitHubAdapter] Repos fetch warning for ${cleanUsername}: ${e.message}`);
    }

    // 3. Fetch public events
    try {
      const eventsRes = await this.fetchWithTimeout(`https://api.github.com/users/${cleanUsername}/events/public?per_page=10`, { headers }, 5000);
      if (eventsRes.ok) {
        const events = await eventsRes.json();
        if (Array.isArray(events)) {
          recentActivity = events.slice(0, 5).map(e => ({
            title: `${e.type ? e.type.replace('Event', '') : 'Activity'} on ${e.repo?.name || 'repo'}`,
            status: 'Committed',
            timestamp: e.created_at || new Date().toISOString()
          }));
        }
      }
    } catch (e) {
      // non-critical
    }

    const velocityScore = Math.min(100, Math.round(totalRepos * 3 + totalStars * 5 + followers * 2));

    return this.normalizeProfile({
      username: cleanUsername,
      rating: totalStars,
      rank: totalStars > 50 ? 'Featured Open Source Author' : totalRepos > 10 ? 'Active Builder' : 'Developer',
      solved: totalRepos,
      contests: 0,
      badges: totalStars >= 50 ? 4 : totalStars >= 10 ? 3 : totalRepos > 5 ? 2 : 1,
      streak: 0,
      profileUrl: `https://github.com/${cleanUsername}`,
      difficultyBreakdown: {
        easy: totalRepos,
        medium: totalStars,
        hard: followers
      },
      recentActivity,
      rawStats: {
        totalStars,
        followers,
        following: u.following || 0,
        languages,
        topRepositories,
        velocityScore
      }
    });
  }

  async getStats(username) {
    const profile = await this.getProfile(username);
    return {
      repos: profile.solved,
      stars: profile.rating,
      languages: profile.rawStats.languages
    };
  }

  async getContests() {
    return [];
  }
}

export default GitHubAdapter;
