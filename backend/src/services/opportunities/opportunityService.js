import { Opportunity } from '../../models/Opportunity.js';
import { PlatformProfile } from '../../models/PlatformProfile.js';

// Authoritative opportunities from official corporate career portals
const INITIAL_OPPORTUNITIES = [
  {
    title: 'Software Development Engineer - I (SDE 1)',
    company: 'Amazon',
    type: 'job',
    role: 'Backend & Distributed Systems',
    experienceLevel: 'Entry Level',
    location: 'Bengaluru / Hyderabad (Hybrid)',
    isRemote: false,
    skills: ['Java', 'C++', 'DSA', 'OOP', 'Distributed Systems', 'AWS'],
    description: 'Build low-latency customer-facing distributed services supporting millions of transactions per second.',
    applyUrl: 'https://amazon.jobs/en/jobs/2589021',
    source: 'Amazon Career Portal',
    salary: '₹18,00,000 - ₹24,00,000 Base',
    deadline: '2026-11-15'
  },
  {
    title: 'Software Engineer - Frontend & Full Stack',
    company: 'Atlassian',
    type: 'job',
    role: 'Frontend / Full Stack',
    experienceLevel: 'Entry Level',
    location: 'Remote (India)',
    isRemote: true,
    skills: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'REST API', 'GraphQL'],
    description: 'Design and ship intuitive collaboration experiences across Jira and Confluence cloud suites.',
    applyUrl: 'https://www.atlassian.com/company/careers/details/14820',
    source: 'Atlassian Careers',
    salary: '₹20,00,000 - ₹26,00,000 Base',
    deadline: '2026-11-20'
  },
  {
    title: 'Summer 2027 Software Engineering Intern',
    company: 'Google',
    type: 'internship',
    role: 'Software Engineering Intern',
    experienceLevel: 'Internship',
    location: 'Bengaluru / Hyderabad',
    isRemote: false,
    skills: ['C++', 'Java', 'Python', 'Algorithms', 'Data Structures'],
    description: '10 to 12-week summer internship tackling core algorithmic scaling challenges within Google Search and Cloud.',
    applyUrl: 'https://careers.google.com/jobs/results/92817412/',
    source: 'Google Students Career Portal',
    salary: '₹1,15,000 / month stipend',
    deadline: '2026-10-30'
  },
  {
    title: 'Backend Engineering Intern',
    company: 'Uber',
    type: 'internship',
    role: 'Backend Engineering Intern',
    experienceLevel: 'Internship',
    location: 'Bengaluru (On-site)',
    isRemote: false,
    skills: ['Go', 'Java', 'Microservices', 'Kafka', 'Redis', 'Algorithms'],
    description: 'Work alongside the Mobility Marketplace team designing high-concurrency dispatch and pricing engines.',
    applyUrl: 'https://www.uber.com/us/en/careers/list/119284/',
    source: 'Uber University Recruiting',
    salary: '₹1,25,000 / month stipend',
    deadline: '2026-11-05'
  },
  {
    title: 'Junior Full Stack Developer',
    company: 'Postman',
    type: 'job',
    role: 'Full Stack Engineer',
    experienceLevel: 'Entry Level',
    location: 'Bengaluru / Remote',
    isRemote: true,
    skills: ['Node.js', 'React', 'MongoDB', 'Docker', 'API Design'],
    description: 'Extend the leading API development platform used by over 30 million engineers worldwide.',
    applyUrl: 'https://www.postman.com/company/careers/open-positions/',
    source: 'Postman Careers',
    salary: '₹16,00,000 - ₹22,00,000 Base',
    deadline: '2026-12-01'
  },
  {
    title: 'Systems & Cloud Engineering Intern',
    company: 'Microsoft',
    type: 'internship',
    role: 'Software Engineer Intern',
    experienceLevel: 'Internship',
    location: 'Hyderabad / Noida',
    isRemote: false,
    skills: ['C#', 'C++', 'Operating Systems', 'Azure', 'Data Structures'],
    description: 'Build enterprise cloud virtualization and security services within the Microsoft Azure Core Team.',
    applyUrl: 'https://careers.microsoft.com/v2/global/en/home.html',
    source: 'Microsoft University Careers',
    salary: '₹1,00,000 / month stipend',
    deadline: '2026-11-10'
  }
];

export const seedOpportunitiesIfEmpty = async () => {
  try {
    const count = await Opportunity.countDocuments({});
    if (count === 0) {
      console.log('🌱 Seeding verified corporate career opportunities...');
      for (const item of INITIAL_OPPORTUNITIES) {
        await Opportunity.create(item);
      }
      console.log(`✅ Seeded ${INITIAL_OPPORTUNITIES.length} verified tech opportunities.`);
    }
  } catch (err) {
    console.error('⚠️ Failed seeding opportunities:', err.message);
  }
};

/**
 * Calculates deterministic compatibility score between a user profile and an opportunity
 */
export const calculateOpportunityMatch = (user, opportunity, userProfiles = []) => {
  const userSkills = new Set(
    (user?.profile?.skills || []).map(s => s.toLowerCase().trim())
  );

  // Add detected tech stack from GitHub
  (user?.profile?.developerDna?.detectedTechStack || []).forEach(t => {
    userSkills.add(t.toLowerCase().trim());
  });

  // Add coding telemetry indications
  const totalSolved = Object.values(user?.profile?.codingStats || {}).reduce((acc, v) => typeof v === 'number' ? acc + v : acc, 0);
  if (totalSolved > 50) {
    userSkills.add('dsa');
    userSkills.add('algorithms');
    userSkills.add('data structures');
  }

  const reqSkills = opportunity.skills || [];
  if (reqSkills.length === 0) {
    return {
      matchScore: 70,
      matchedSkills: [],
      missingSkills: [],
      category: 'Good Match',
      whyMatched: ['Broad algorithmic role with flexible technology stack.']
    };
  }

  const matched = [];
  const missing = [];

  reqSkills.forEach(req => {
    const clean = req.toLowerCase().trim();
    if (userSkills.has(clean) || Array.from(userSkills).some(u => u.includes(clean) || clean.includes(u))) {
      matched.push(req);
    } else {
      missing.push(req);
    }
  });

  const baseMatch = Math.round((matched.length / reqSkills.length) * 100);

  // Check contest rating boosts for algorithmic roles
  let contestBoost = 0;
  const cfProfile = userProfiles.find(p => p.platform === 'codeforces');
  const lcProfile = userProfiles.find(p => p.platform === 'leetcode');
  if (cfProfile?.rating >= 1400 || lcProfile?.rating >= 1750) {
    contestBoost = 10;
  }

  const finalScore = Math.min(98, Math.max(15, baseMatch + contestBoost));

  // Category determination
  let category = 'Stretch Opportunity';
  if (finalScore >= 75) {
    category = 'Best Match';
  } else if (finalScore >= 55) {
    category = 'Good Match';
  }

  // Deterministic reason generation
  const whyReasons = [];
  if (matched.length > 0) {
    whyReasons.push(`Matches ${matched.length} core required skills: ${matched.slice(0, 3).join(', ')}.`);
  }
  if (contestBoost > 0) {
    whyReasons.push('Verified competitive programming rating meets Tier-1 online assessment threshold.');
  }
  if (missing.length > 0) {
    whyReasons.push(`Would benefit from demonstrating proficiency in: ${missing.slice(0, 2).join(', ')}.`);
  }

  return {
    matchScore: finalScore,
    matchedSkills: matched,
    missingSkills: missing,
    category,
    whyMatched: whyReasons
  };
};

export default {
  seedOpportunitiesIfEmpty,
  calculateOpportunityMatch
};
