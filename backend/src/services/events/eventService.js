import { Event } from '../../models/Event.js';
import { SyncJob } from '../../models/SyncJob.js';

export const INITIAL_EVENTS = [
  {
    title: 'Smart India Hackathon (SIH 2026)',
    company: 'Ministry of Education & AICTE',
    type: 'Hackathon',
    description: 'Nationwide initiative providing students a platform to solve pressing problems of ministries, departments, and industries across hardware & software.',
    startDate: new Date(Date.now() + 86400000 * 15).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 17).toISOString(),
    registrationDeadline: new Date(Date.now() + 86400000 * 8).toISOString(),
    eligibility: 'Engineering & College Students (Teams of 6)',
    location: 'India',
    registrationUrl: 'https://sih.gov.in',
    source: 'AICTE / SIH Portal',
    tags: ['GovtOfIndia', 'SmartIndia', 'Innovation', 'HardwareSoftware'],
    prizePool: '₹1,00,000 per problem statement'
  },
  {
    title: 'Google Summer of Code (GSoC)',
    company: 'Google Open Source',
    type: 'Open Source',
    description: 'Global online program focused on bringing new contributors into open source software development organizations under 12+ week mentorships.',
    startDate: new Date(Date.now() + 86400000 * 25).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 95).toISOString(),
    registrationDeadline: new Date(Date.now() + 86400000 * 12).toISOString(),
    eligibility: 'Students & Open Source Beginners (18+)',
    location: 'Online',
    registrationUrl: 'https://summerofcode.withgoogle.com',
    source: 'Google Open Source',
    tags: ['Google', 'GSoC', 'OpenSource', 'Stipend', 'Mentorship'],
    prizePool: '$1,500 - $3,000 Stipend'
  },
  {
    title: 'Amazon ML Summer School',
    company: 'Amazon Science',
    type: 'Workshop',
    description: 'Intensive curriculum covering Deep Learning, Probabilistic Graphical Models, Reinforcement Learning, and Generative AI taught by Amazon scientists.',
    startDate: new Date(Date.now() + 86400000 * 18).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 22).toISOString(),
    registrationDeadline: new Date(Date.now() + 86400000 * 6).toISOString(),
    eligibility: 'Pre-final & Final Year B.Tech / M.Tech / PhD',
    location: 'India',
    registrationUrl: 'https://amazonmlsummerschoolindia.splashthat.com',
    source: 'Amazon Science',
    tags: ['Amazon', 'MachineLearning', 'Mentorship', 'PlacementInterviews'],
    prizePool: 'Fast-track SDE & Applied Scientist Interviews'
  },
  {
    title: 'Flipkart GRiD 6.0 Campus Challenge',
    company: 'Flipkart',
    type: 'Hiring Challenge',
    description: 'Flagship engineering campus challenge inviting students to solve technical problems in Robotics, Information Security, and E-commerce Generative AI.',
    startDate: new Date(Date.now() + 86400000 * 20).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 23).toISOString(),
    registrationDeadline: new Date(Date.now() + 86400000 * 10).toISOString(),
    eligibility: 'Engineering Students (Batch 2025, 2026, 2027)',
    location: 'India',
    registrationUrl: 'https://unstop.com/competitions/flipkart-grid',
    source: 'Unstop / Flipkart',
    tags: ['Flipkart', 'GRiD', 'FullTimeOffer', 'InternshipPPI'],
    prizePool: '₹5,25,000 & SDE-1 PPIs (32 LPA)'
  },
  {
    title: 'JPMorgan Chase Code for Good',
    company: 'JPMorgan Chase & Co.',
    type: 'Hackathon',
    description: '24-hour virtual hackathon where you collaborate with teammates and JPMC technologists to build tech solutions for non-profit organizations.',
    startDate: new Date(Date.now() + 86400000 * 30).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 31).toISOString(),
    registrationDeadline: new Date(Date.now() + 86400000 * 14).toISOString(),
    eligibility: 'B.Tech / B.E. Computer Science & IT',
    location: 'Online',
    registrationUrl: 'https://careers.jpmorgan.com/us/en/students/programs/code-for-good',
    source: 'JPMorgan Chase Careers',
    tags: ['JPMC', 'Fintech', 'SocialGood', 'SoftwareEngineeringPPI'],
    prizePool: 'Full-time Software Engineer Offers'
  },
  {
    title: 'Meta Hacker Cup 2026',
    company: 'Meta',
    type: 'Coding Contest',
    description: 'Meta\'s annual global competitive programming competition with rounds of challenging algorithmic and mathematical problems.',
    startDate: new Date(Date.now() + 86400000 * 45).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 46).toISOString(),
    registrationDeadline: new Date(Date.now() + 86400000 * 35).toISOString(),
    eligibility: 'Open to All Globally',
    location: 'Online',
    registrationUrl: 'https://www.facebook.com/codingcompetitions/hacker-cup/',
    source: 'Meta Competitions',
    tags: ['Meta', 'HackerCup', 'Algorithms', 'GlobalRank'],
    prizePool: '$20,000 Grand Prize & Official T-Shirts'
  }
];

export const seedEventsIfEmpty = async () => {
  const existing = await Event.find({});
  if (existing.length === 0) {
    console.log('🌱 Seeding verified hackathons and hiring challenges...');
    for (const evt of INITIAL_EVENTS) {
      await Event.create(evt);
    }
  }
};

export const getEvents = async (filters = {}) => {
  await seedEventsIfEmpty();
  let query = {};
  if (filters.type && filters.type !== 'All') {
    query.type = filters.type;
  }
  if (filters.location && filters.location !== 'All') {
    query.location = filters.location;
  }

  let events = await Event.find(query);

  if (filters.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    events = events.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.company.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      (e.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }

  // Sort by registration deadline
  events.sort((a, b) => new Date(a.registrationDeadline || 0) - new Date(b.registrationDeadline || 0));
  return events;
};

export default { getEvents, seedEventsIfEmpty, INITIAL_EVENTS };
