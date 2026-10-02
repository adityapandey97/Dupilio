import PlatformAdapter from '../PlatformAdapter.js';

export class GFGAdapter extends PlatformAdapter {
  constructor() {
    super('gfg', 'https://auth.geeksforgeeks.org/user');
  }

  async getProfile(username) {
    if (!username) throw new Error('GeeksforGeeks username is required');

    let solved = 85;
    let score = 240;

    return this.normalizeProfile({
      username,
      rating: score,
      rank: 'Campus Top 10%',
      solved,
      contests: 6,
      badges: 3,
      streak: 8,
      profileUrl: `https://auth.geeksforgeeks.org/user/${username}`,
      difficultyBreakdown: {
        easy: 45,
        medium: 32,
        hard: 8
      },
      recentActivity: [
        { title: 'Detect cycle in an undirected graph', status: 'Accepted', timestamp: new Date(Date.now() - 3600000 * 18).toISOString() },
        { title: 'Subarray with given sum', status: 'Accepted', timestamp: new Date(Date.now() - 3600000 * 42).toISOString() }
      ]
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
    return [
      {
        title: 'GFG Weekly Coding Contest',
        platform: 'gfg',
        externalContestId: 'gfg-weekly',
        startTime: new Date(Date.now() + 86400000 * 2.5).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 2.5 + 5400000).toISOString(),
        durationMinutes: 90,
        registrationUrl: 'https://practice.geeksforgeeks.org/events',
        contestUrl: 'https://practice.geeksforgeeks.org/events',
        status: 'upcoming',
        ratingRange: 'All Experience Levels'
      }
    ];
  }
}

export default GFGAdapter;
