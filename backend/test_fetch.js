import fetch from 'node-fetch';

async function testLeetCode(username = 'neal_wu') {
  console.log(`\n=== Testing LeetCode (${username}) ===`);
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile { ranking reputation }
        submitStatsGlobal {
          acSubmissionNum { difficulty count }
        }
        badges { id displayName }
      }
      userContestRanking(username: $username) {
        attendedContestsCount
        rating
        globalRanking
        totalParticipants
        topPercentage
        badge { name }
      }
      recentSubmissionList(username: $username, limit: 5) {
        title
        statusDisplay
        timestamp
      }
    }
  `;

  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://leetcode.com'
      },
      body: JSON.stringify({ query, variables: { username } })
    });
    console.log('LC GraphQL HTTP Status:', res.status);
    const data = await res.json();
    console.log('LC GraphQL Data:', JSON.stringify(data, null, 2).slice(0, 500));
  } catch (err) {
    console.error('LC Error:', err.message);
  }

  // Also test Alfa LeetCode API / leetcode-stats-api
  try {
    const res2 = await fetch(`https://alfa-leetcode-api.onrender.com/userProfile/${username}`);
    console.log('Alfa LC API Status:', res2.status);
    if (res2.ok) {
      const data2 = await res2.json();
      console.log('Alfa LC Data:', JSON.stringify(data2, null, 2).slice(0, 300));
    }
  } catch (err) {
    console.error('Alfa LC Error:', err.message);
  }
}

async function testCodeforces(username = 'tourist') {
  console.log(`\n=== Testing Codeforces (${username}) ===`);
  try {
    const res = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
    const data = await res.json();
    console.log('CF User Info:', data.status, data.result?.[0]?.rating, data.result?.[0]?.rank);

    const res2 = await fetch(`https://codeforces.com/api/user.rating?handle=${username}`);
    const data2 = await res2.json();
    console.log('CF Rating history contests count:', data2.result?.length);

    const res3 = await fetch(`https://codeforces.com/api/user.status?handle=${username}&from=1&count=50`);
    const data3 = await res3.json();
    console.log('CF Submissions count:', data3.result?.length);
  } catch (err) {
    console.error('CF Error:', err.message);
  }
}

async function testContests() {
  console.log('\n=== Testing Real Upcoming Contests ===');
  // 1. Kontests
  try {
    const res = await fetch('https://kontests.net/api/v1/all');
    console.log('Kontests.net Status:', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log('Kontests total:', data.length);
      console.log('First 2 contests:', data.slice(0, 2));
    }
  } catch (err) {
    console.log('Kontests err:', err.message);
  }

  // 2. Codeforces contests
  try {
    const res = await fetch('https://codeforces.com/api/contest.list?gym=false');
    if (res.ok) {
      const data = await res.json();
      const upcoming = (data.result || []).filter(c => c.phase === 'BEFORE');
      console.log('Codeforces upcoming count:', upcoming.length);
      console.log('First upcoming CF contest:', upcoming[0]);
    }
  } catch (err) {
    console.log('CF contests err:', err.message);
  }

  // 3. Clist API or AtCoder / LeetCode
  try {
    const res = await fetch('https://kenkoooo.com/atcoder/resources/contests.json');
    if (res.ok) {
      const data = await res.json();
      const nowSec = Math.floor(Date.now() / 1000);
      const upcoming = data.filter(c => c.start_epoch_second > nowSec);
      console.log('Atcoder upcoming count:', upcoming.length);
      console.log('First upcoming AtCoder contest:', upcoming[0]);
    }
  } catch (err) {
    console.log('Atcoder err:', err.message);
  }
}

async function run() {
  await testLeetCode();
  await testCodeforces();
  await testContests();
}

run();
