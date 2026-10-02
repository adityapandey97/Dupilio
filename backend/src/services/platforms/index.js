import { LeetCodeAdapter } from './leetcode/LeetCodeAdapter.js';
import { CodeforcesAdapter } from './codeforces/CodeforcesAdapter.js';
import { CodeChefAdapter } from './codechef/CodeChefAdapter.js';
import { HackerRankAdapter } from './hackerrank/HackerRankAdapter.js';
import { GFGAdapter } from './gfg/GFGAdapter.js';
import { AtCoderAdapter } from './atcoder/AtCoderAdapter.js';
import { GitHubAdapter } from './github/GitHubAdapter.js';

export const adapters = {
  leetcode: new LeetCodeAdapter(),
  codeforces: new CodeforcesAdapter(),
  codechef: new CodeChefAdapter(),
  hackerrank: new HackerRankAdapter(),
  gfg: new GFGAdapter(),
  atcoder: new AtCoderAdapter(),
  github: new GitHubAdapter()
};

export const getAdapter = (platform) => {
  const normalized = (platform || '').toLowerCase().trim();
  const adapter = adapters[normalized];
  if (!adapter) {
    throw new Error(`Unsupported platform adapter: ${platform}. Supported platforms are: ${Object.keys(adapters).join(', ')}`);
  }
  return adapter;
};

export const getSupportedPlatforms = () => {
  return [
    { id: 'leetcode', name: 'LeetCode', type: 'dsa', icon: 'Code2', color: '#FFA116' },
    { id: 'codeforces', name: 'Codeforces', type: 'cp', icon: 'Swords', color: '#1F8ACB' },
    { id: 'codechef', name: 'CodeChef', type: 'cp', icon: 'Trophy', color: '#5B4638' },
    { id: 'hackerrank', name: 'HackerRank', type: 'assessment', icon: 'Award', color: '#00EA64' },
    { id: 'gfg', name: 'GeeksforGeeks', type: 'dsa', icon: 'BookOpen', color: '#2F8D46' },
    { id: 'atcoder', name: 'AtCoder', type: 'cp', icon: 'Zap', color: '#000000' },
    { id: 'github', name: 'GitHub', type: 'open_source', icon: 'GitBranch', color: '#24292E' }
  ];
};

export default adapters;
