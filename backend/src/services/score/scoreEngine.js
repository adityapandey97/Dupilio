/**
 * Dupilio Developer Score Engine
 * Computes a transparent, multi-dimensional developer index (0 - 100).
 * Clearly labeled as "Dupilio Developer Score".
 * Completely real metrics — zero dummy base minimums.
 */

export const calculateDupilioScore = (profiles = [], localProgress = {}) => {
  if (!profiles || profiles.length === 0) {
    const localSolved = Number(localProgress.solvedCount) || 0;
    const localTodos = Number(localProgress.completedTodos) || 0;
    if (localSolved === 0 && localTodos === 0) {
      return {
        label: 'Dupilio Developer Score',
        overall: 0,
        dimensions: {
          problemSolving: 0,
          competitiveProgramming: 0,
          contestParticipation: 0,
          consistency: 0,
          githubActivity: 0,
          projectActivity: 0
        },
        calculatedAt: new Date().toISOString()
      };
    }
  }

  // Extract real metrics from profiles
  let leetcodeSolved = 0;
  let gfgSolved = 0;
  let codeforcesRating = 0;
  let codeforcesContests = 0;
  let codechefRating = 0;
  let codechefContests = 0;
  let atcoderRating = 0;
  let atcoderContests = 0;
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
      atcoderContests = contests;
    } else if (plat === 'hackerrank') {
      hackerrankSolved = solved;
    } else if (plat === 'github') {
      githubVelocity = p.rawStats?.velocityScore || 0;
      githubRepos = solved;
      githubStars = p.rawStats?.totalStars || 0;
    }
  });

  // Local Dupilio solved problems
  const localSolvedCount = Number(localProgress.solvedCount) || 0;
  const totalSolvedDSA = leetcodeSolved + gfgSolved + hackerrankSolved + localSolvedCount;

  // 1. Problem Solving Dimension (Target: 350+ solved problems across platforms = 100)
  const problemSolvingScore = Math.min(100, Math.round((totalSolvedDSA / 350) * 100));

  // 2. Competitive Programming Dimension (CF / CC / AC rating normalized)
  const cfNorm = codeforcesRating > 0 ? Math.min(100, Math.round((codeforcesRating / 2100) * 100)) : 0;
  const ccNorm = codechefRating > 0 ? Math.min(100, Math.round((codechefRating / 2200) * 100)) : 0;
  const acNorm = atcoderRating > 0 ? Math.min(100, Math.round((atcoderRating / 1800) * 100)) : 0;
  const cpScore = Math.max(cfNorm, ccNorm, acNorm);

  // 3. Contest Participation (Target: 25+ contests attended across platforms)
  const totalContests = codeforcesContests + codechefContests + atcoderContests + (Number(localProgress.contestsAttended) || 0);
  const contestParticipationScore = Math.min(100, Math.round((totalContests / 25) * 100));

  // 4. Consistency Dimension (Streaks and active days)
  const consistencyScore = maxStreak > 0 ? Math.min(100, Math.round((maxStreak / 30) * 100)) : 0;

  // 5. GitHub Activity Dimension (Repos, stars, velocity)
  const githubScore = (githubRepos > 0 || githubStars > 0)
    ? Math.min(100, Math.round((githubRepos / 20) * 40 + (githubStars / 25) * 60))
    : 0;

  // 6. Project & Practical Development (Local completed tasks and projects)
  const completedTodos = Number(localProgress.completedTodos) || 0;
  const projectActivityScore = Math.min(100, Math.round(completedTodos * 10 + githubRepos * 3));

  // Weighted overall calculation:
  // Problem Solving: 25%
  // Competitive Programming: 25%
  // Consistency: 15%
  // Contest Participation: 15%
  // GitHub Activity: 10%
  // Project Activity: 10%
  const overall = Math.round(
    problemSolvingScore * 0.25 +
    cpScore * 0.25 +
    consistencyScore * 0.15 +
    contestParticipationScore * 0.15 +
    githubScore * 0.10 +
    projectActivityScore * 0.10
  );

  return {
    label: 'Dupilio Developer Score',
    overall: Math.min(100, Math.max(0, overall)),
    dimensions: {
      problemSolving: problemSolvingScore,
      competitiveProgramming: cpScore,
      contestParticipation: contestParticipationScore,
      consistency: consistencyScore,
      githubActivity: githubScore,
      projectActivity: projectActivityScore
    },
    calculatedAt: new Date().toISOString()
  };
};

export default { calculateDupilioScore };
