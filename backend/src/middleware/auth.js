import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token || token === 'preview-token') {
    // Attach default guest candidate session for preview mode
    req.user = {
      _id: 'guest-preview',
      name: 'Candidate (Preview)',
      email: 'preview@hierprep.dev',
      isGuest: true,
      profile: {
        role: 'Software Engineer',
        skills: ['DSA', 'React', 'JavaScript', 'Node.js', 'System Design'],
        education: 'B.Tech IT / CS',
        achievements: 'Candidate in Placement Preparation Mode',
        codingProfiles: {
          leetcode: 'aditya_lc',
          codeforces: 'aditya_cf',
          codechef: 'aditya_cc',
          hackerrank: 'aditya_hr',
          github: 'aditya_dev'
        },
        codingStats: {
          leetcodeSolved: 128,
          codeforcesSolved: 94,
          codechefSolved: 62,
          hackerrankSolved: 48,
          completedTopics: ['Array', 'String', 'Sliding Window']
        }
      }
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    const user = await User.findById(decoded.id);

    if (!user) {
      req.user = {
        _id: decoded.id || 'guest-preview',
        name: 'Candidate (Preview)',
        email: 'preview@hierprep.dev',
        profile: { role: 'Software Engineer' }
      };
      return next();
    }

    req.user = user;
    next();
  } catch (err) {
    req.user = {
      _id: 'guest-preview',
      name: 'Candidate (Preview)',
      email: 'preview@hierprep.dev',
      profile: { role: 'Software Engineer' }
    };
    return next();
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User session not initialized.' });
    }

    const userRole = req.user.profile?.role || 'Software Engineer';
    
    // Check match (e.g. ADMIN role check)
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Role (${userRole}) is not authorized to access this route.`
      });
    }

    next();
  };
};
