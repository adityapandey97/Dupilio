/**
 * Dupilio Developer Score Engine
 * Computes a transparent, multi-dimensional developer index (0 - 100).
 * Clearly labeled as "Dupilio Developer Score".
 */

export const calculateDupilioScore = (profiles = [], localProgress = {}) => {
  // Extract metrics from profiles
  let leetcodeSolved = 0;
  let gfgSolved = 0;
  let codeforcesRating = 0;
  let codeforcesContests = 0;
  let codechefRating = 0;
  let codechefContests = 0;
  let atcoderRating = 0;
  let hackerrankSolved = 0;
  let githubVelocity = 0;
  let githubRepos = 0;
  let githubStars = 0;
  let maxStreak = 0;

  profiles.forEach(p => {
    const plat = (p.platform || '').toLowerCase();
    const solved = Number(p.solved) || 0;
    const rating = Number(p.rating) || 0;
    const contests = Number(p.contests) || 0;
    const streak = Number(p.streak) || 0;

    if (streak > maxStreak) maxStreak = streak;

    if (plat === 'leetcode') {
      leetcodeSolved = solved;
    } else if (plat === 'gfg') {
      gfgSolved = solved;
    } else if (plat === 'codeforces') {
      codeforcesRating = rating;
      codeforcesContests = contests;
    } else if (plat === 'codechef') {
      codechefRating = rating;
      codechefContests = contests;
    } else if (plat === 'atcoder') {
      atcoderRating = rating;
    } else if (plat === 'hackerrank') {
      hackerrankSolved = solved;
    } else if (plat === 'github') {
      githubVelocity = rating || 50;
      githubRepos = solved || 10;
      githubStars = p.rawStats?.totalStars || 15;
    }
  });

  // Local Dupilio solved problems
  const localSolvedCount = Number(localProgress.solvedCount) || 0;
  const totalSolvedDSA = leetcodeSolved + gfgSolved + hackerrankSolved + localSolvedCount;

  // 1. Problem Solving Dimension (Target: 350+ solved problems across platforms = 100)
  const problemSolvingScore = Math.min(100, Math.round((totalSolvedDSA / 350) * 100));

  // 2. Competitive Programming Dimension (CF / CC / AC rating normalized)
  // CF 1200 ~ 50%, CF 1600 ~ 75%, CF 2000 ~ 95%
  const cfNorm = Math.min(100, Math.max(20, Math.round((codeforcesRating / 2100) * 100)));
  const ccNorm = Math.min(100, Math.max(20, Math.round((codechefRating / 2200) * 100)));
  const cpScore = Math.max(cfNorm, ccNorm, Math.round((atcoderRating / 1800) * 100)) || 55;

  // 3. Contest Participation (Target: 25+ contests attended across platforms)
  const totalContests = codeforcesContests + codechefContests + (Number(localProgress.contestsAttended) || 0);
  const contestParticipationScore = Math.min(100, Math.round((totalContests / 25) * 100)) || 45;

  // 4. Consistency Dimension (Streaks and active days)
  const consistencyScore = Math.min(100, Math.round((Math.max(maxStreak, 7) / 30) * 100));

  // 5. GitHub Activity Dimension (Repos, stars, velocity)
  const githubScore = Math.min(100, Math.max(30, Math.round(githubVelocity * 0.7 + (githubStars / 30) * 30)));

  // 6. Project & Practical Development (Local completed projects and todos)
  const completedTodos = Number(localProgress.completedTodos) || 0;
  const projectActivityScore = Math.min(100, Math.max(40, Math.round(50 + completedTodos * 5 + githubRepos * 2)));

  // Weighted overall calculation:
  // Problem Solving: 25%
  // Competitive Programming: 20%
  // Consistency: 20%
  // Contest Participation: 15%
  // GitHub Activity: 10%
  // Project Activity: 10%
  const overall = Math.round(
    problemSolvingScore * 0.25 +
    cpScore * 0.20 +
    consistencyScore * 0.20 +
    contestParticipationScore * 0.15 +
    githubScore * 0.10 +
    projectActivityScore * 0.10
  );

  return {
    label: 'Dupilio Developer Score',
    overall: Math.min(99, Math.max(30, overall)),
    dimensions: {
      problemSolving: problemSolvingScore,
      competitiveProgramming: cpScore,
      consistency: consistencyScore,
      contestParticipation: contestParticipationScore,
      gitHubActivity: githubScore,
      projectActivity: projectActivityScore
    },
    metricsSummary: {
      totalSolved: totalSolvedDSA,
      maxRating: Math.max(codeforcesRating, codechefRating),
      totalContests,
      currentStreak: maxStreak,
      githubStars
    },
    calculatedAt: new Date().toISOString()
  };
};

export default calculateDupilioScore;
