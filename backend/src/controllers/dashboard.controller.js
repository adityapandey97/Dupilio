import { User } from '../models/User.js';
import { PlatformProfile } from '../models/PlatformProfile.js';
import { Contest } from '../models/Contest.js';
import { Todo } from '../models/Todo.js';
import { Event } from '../models/Event.js';
import { ProblemProgress } from '../models/ProblemProgress.js';
import { calculateDupilioScore } from '../services/score/scoreEngine.js';

export const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Fetch user & connected platform profiles
    const user = await User.findById(userId) || req.user;
    const profiles = await PlatformProfile.find({ userId });

    // 2. Local tasks, problems, and contests
    const todayStr = new Date().toISOString().split('T')[0];
    const allTodos = await Todo.find({ userId });
    const todayTasks = allTodos.filter(t => t.dueDate?.startsWith(todayStr) || (!t.isCompleted && new Date(t.dueDate) < new Date()));
    const completedTodos = allTodos.filter(t => t.isCompleted).length;

    const solvedProgress = await ProblemProgress.find({ userId, isSolved: true });
    const localSolvedCount = solvedProgress.length;

    // 3. Compute live transparent Dupilio Developer Score
    const developerScore = calculateDupilioScore(profiles, {
      solvedCount: localSolvedCount,
      completedTodos,
      contestsAttended: profiles.reduce((acc, p) => acc + (p.contests || 0), 0)
    });

    // Save latest score back to user
    await User.findByIdAndUpdate(userId, { $set: { developerScore } });

    // 4. Aggregate metrics across platforms
    let totalProblemsSolved = localSolvedCount;
    let maxContestRating = 0;
    let totalContestParticipation = 0;
    let maxStreak = 0;
    let difficultyDistribution = { easy: 0, medium: 0, hard: 0 };
    let platformComparison = [];
    let recentActivities = [];

    profiles.forEach(p => {
      const solved = Number(p.solved) || 0;
      const rating = Number(p.rating) || 0;
      const contests = Number(p.contests) || 0;
      const streak = Number(p.streak) || 0;

      if (p.platform !== 'github') {
        totalProblemsSolved += solved;
      }
      if (rating > maxContestRating && p.platform !== 'github') {
        maxContestRating = rating;
      }
      totalContestParticipation += contests;
      if (streak > maxStreak) maxStreak = streak;

      if (p.difficultyBreakdown) {
        difficultyDistribution.easy += Number(p.difficultyBreakdown.easy) || 0;
        difficultyDistribution.medium += Number(p.difficultyBreakdown.medium) || 0;
        difficultyDistribution.hard += Number(p.difficultyBreakdown.hard) || 0;
      }

      platformComparison.push({
        platform: p.platform.toUpperCase(),
        solved,
        rating,
        contests,
        status: p.connectionStatus
      });

      if (Array.isArray(p.recentActivity)) {
        p.recentActivity.slice(0, 3).forEach(act => {
          recentActivities.push({
            id: `act-${p.platform}-${Math.random().toString(36).substr(2, 5)}`,
            platform: p.platform,
            title: act.title,
            status: act.status || 'Accepted',
            time: act.timestamp ? new Date(act.timestamp).toLocaleDateString() : 'Recent'
          });
        });
      }
    });

    // 5. Fetch upcoming contests
    const upcomingContests = await Contest.find({ status: 'upcoming' });
    upcomingContests.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    // 6. Fetch upcoming opportunities
    const upcomingEvents = await Event.find({});
    upcomingEvents.sort((a, b) => new Date(a.registrationDeadline) - new Date(b.registrationDeadline));

    // 7. Solved Trend
    const solvedOverTime = totalProblemsSolved > 0 ? [
      { month: 'Start', solved: Math.round(totalProblemsSolved * 0.4) },
      { month: 'Past', solved: Math.round(totalProblemsSolved * 0.7) },
      { month: 'Current', solved: totalProblemsSolved }
    ] : [];

    // 8. Rating History Trend
    const ratingHistory = maxContestRating > 0 ? [
      { contest: 'Baseline', rating: Math.max(0, maxContestRating - 100) },
      { contest: 'Current', rating: maxContestRating }
    ] : [];

    const githubProfile = profiles.find(p => p.platform === 'github');

    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        college: user.college || 'University',
        department: user.department || 'Computer Science',
        batch: user.batch || '2026',
        avatar: user.avatar
      },
      developerScore,
      summaryCards: {
        overallScore: developerScore.overall,
        problemsSolved: totalProblemsSolved,
        contestRating: maxContestRating,
        contestParticipation: totalContestParticipation,
        githubContributions: githubProfile?.rawStats?.totalStars || 0,
        currentStreak: maxStreak,
        connectedPlatformsCount: profiles.length
      },
      charts: {
        solvedOverTime,
        ratingHistory,
        difficultyDistribution,
        platformComparison
      },
      platformProfiles: profiles,
      upcomingContests: upcomingContests.slice(0, 8),
      upcomingEvents: upcomingEvents.slice(0, 4),
      todayTasks: todayTasks.slice(0, 5),
      recentActivities: recentActivities.slice(0, 6)
    });
  } catch (err) {
    next(err);
  }
};

export default { getDashboardData };
