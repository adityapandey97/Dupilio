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

      if (scope === 'college') {
        const targetCollege = (req.query.college || currentUser?.college || 'National Institute of Technology').toLowerCase();
        return (u.college || '').toLowerCase().includes(targetCollege) || targetCollege.includes((u.college || '').toLowerCase());
      }
      if (scope === 'country') {
        const targetCountry = (req.query.country || currentUser?.country || 'India').toLowerCase();
        return (u.country || 'India').toLowerCase() === targetCountry;
      }
      if (scope === 'department' && currentUser?.department) {
        return (u.department || '').toLowerCase() === currentUser.department.toLowerCase();
      }
      if (scope === 'batch' && currentUser?.batch) {
        return (u.batch || '').toLowerCase() === currentUser.batch.toLowerCase();
      }
      return true;
    });

    // Curate leaderboard entries using profile data
    const entries = candidates.map(user => {
      const userProfiles = allProfiles.filter(p => String(p.userId) === String(user._id));
      const lc = userProfiles.find(p => p.platform === 'leetcode');
      const cf = userProfiles.find(p => p.platform === 'codeforces');
      const gh = userProfiles.find(p => p.platform === 'github');

      const totalSolved = userProfiles.reduce((acc, p) => p.platform !== 'github' ? acc + (Number(p.solved) || 0) : acc, 0) || (user.profile?.codingStats?.leetcodeSolved || 0);
      const maxRating = Math.max(Number(cf?.rating) || 0, Number(lc?.rating) || 0, user.profile?.codingStats?.codeforcesRating || 0);
      const score = user.developerScore?.overall || Math.min(98, Math.round((totalSolved / 8) + (maxRating / 40)));

      return {
        id: user._id,
        name: user.name,
        college: user.college || 'National Institute of Technology',
        country: user.country || 'India',
        department: user.department || 'Computer Science',
        batch: user.batch || '2026',
        score,
        problemsSolved: totalSolved,
        rating: maxRating,
        githubStars: gh?.rawStats?.totalStars || 0,
        streak: Number(lc?.streak) || Number(cf?.streak) || 7,
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
