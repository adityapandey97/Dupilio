import { Opportunity } from '../models/Opportunity.js';
import { PlatformProfile } from '../models/PlatformProfile.js';
import { Resume } from '../models/Resume.js';
import {
  seedOpportunitiesIfEmpty,
  calculateOpportunityMatch
} from '../services/opportunities/opportunityService.js';

export const getOpportunities = async (req, res, next) => {
  try {
    await seedOpportunitiesIfEmpty();

    const { type, search } = req.query;
    let query = {};
    if (type && (type === 'job' || type === 'internship')) {
      query.type = type;
    }

    const items = await Opportunity.find(query);
    const userProfiles = await PlatformProfile.find({ userId: req.user._id });

    // Fetch user's latest resume if uploaded
    const resumeList = await Resume.find({ userId: req.user._id });
    const latestResume = resumeList.length > 0
      ? [...resumeList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
      : null;

    // Enhance user skills with resume keywords if present
    const enhancedUser = {
      ...req.user,
      profile: {
        ...(req.user.profile || {}),
        skills: [
          ...(req.user.profile?.skills || []),
          ...(latestResume?.missingSkills?.length ? [] : ['Git', 'REST API'])
        ]
      }
    };

    let evaluated = items.map(op => {
      const matchData = calculateOpportunityMatch(enhancedUser, op, userProfiles);
      return {
        ...op,
        ...matchData
      };
    });

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      evaluated = evaluated.filter(o =>
        o.title.toLowerCase().includes(q) ||
        o.company.toLowerCase().includes(q) ||
        o.role.toLowerCase().includes(q) ||
        (o.skills || []).some(s => s.toLowerCase().includes(q))
      );
    }

    // Sort by highest match score
    evaluated.sort((a, b) => b.matchScore - a.matchScore);

    // Calculate Role Readiness against Target SDE-1
    const avgScore = evaluated.length > 0
      ? Math.round(evaluated.reduce((acc, o) => acc + o.matchScore, 0) / evaluated.length)
      : 65;

    res.json({
      success: true,
      count: evaluated.length,
      roleReadiness: {
        targetRole: 'Software Development Engineer - I (SDE 1)',
        readinessScore: Math.min(95, Math.max(20, avgScore + 5)),
        strongAreas: ['Data Structures & Algorithms', 'Frontend & Web Architecture', 'Git & Version Control'],
        growthAreas: ['Distributed Systems & Sharding', 'Containerization (Docker / K8s)', 'Microservices Concurrency'],
        recommendedActions: [
          'Practice Graph Shortest-Path & Topological Sort patterns on LeetCode',
          'Deploy a containerized microservice repository to GitHub',
          'Target upcoming Amazon or Google application deadlines'
        ]
      },
      opportunities: evaluated
    });
  } catch (err) {
    next(err);
  }
};

export const getOpportunityById = async (req, res, next) => {
  try {
    const item = await Opportunity.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }
    const userProfiles = await PlatformProfile.find({ userId: req.user._id });
    const matchData = calculateOpportunityMatch(req.user, item, userProfiles);

    res.json({
      success: true,
      opportunity: {
        ...item,
        ...matchData
      }
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getOpportunities,
  getOpportunityById
};
