import { User } from '../models/User.js';
import { PlatformProfile } from '../models/PlatformProfile.js';

export const getLeaderboard = async (req, res, next) => {
  try {
    const { scope = 'global', search = '' } = req.query;
    const currentUser = req.user;

    const allUsers = await User.find({});
    const allProfiles = await PlatformProfile.find({});

    // Filter by scope and privacy settings
    let candidates = allUsers.filter(u => {
      if (u.privacySettings?.showInLeaderboard === false) return false;
      if (u.privacySettings?.profileVisibility === 'private') return false;

      if (scope === 'college' && currentUser?.college) {
        return (u.college || '').toLowerCase() === currentUser.college.toLowerCase();
      }
      if (scope === 'department' && currentUser?.department) {
        return (u.department || '').toLowerCase() === currentUser.department.toLowerCase();
      }
      if (scope === 'batch' && currentUser?.batch) {
        return (u.batch || '').toLowerCase() === currentUser.batch.toLowerCase();
      }
      return true;
    });

    // Curate leaderboard entries using purely real profile data
    const entries = candidates.map(user => {
      const userProfiles = allProfiles.filter(p => String(p.userId) === String(user._id));
      const lc = userProfiles.find(p => p.platform === 'leetcode');
      const cf = userProfiles.find(p => p.platform === 'codeforces');
      const gh = userProfiles.find(p => p.platform === 'github');

      const totalSolved = userProfiles.reduce((acc, p) => p.platform !== 'github' ? acc + (Number(p.solved) || 0) : acc, 0);
      const maxRating = Math.max(Number(cf?.rating) || 0, Number(lc?.rating) || 0);
      const score = user.developerScore?.overall || 0;

      return {
        id: user._id,
        name: user.name,
        college: user.college || 'University',
        department: user.department || 'Computer Science',
        batch: user.batch || '2026',
        score,
        problemsSolved: totalSolved,
        rating: maxRating,
        githubStars: gh?.rawStats?.totalStars || 0,
        streak: Number(lc?.streak) || Number(cf?.streak) || 0,
        isCurrentUser: String(user._id) === String(currentUser?._id)
      };
    });

    // Sort by Dupilio Developer Score descending
    entries.sort((a, b) => b.score - a.score || b.problemsSolved - a.problemsSolved || b.rating - a.rating);

    // Assign real rank
    const ranked = entries.map((item, index) => ({
      ...item,
      rank: index + 1
    }));

    // Apply search filter if present
    let filtered = ranked;
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = ranked.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.college.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      scope,
      count: filtered.length,
      leaderboard: filtered
    });
  } catch (err) {
    next(err);
  }
};

export default { getLeaderboard };
