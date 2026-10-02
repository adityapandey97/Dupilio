import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, college, department, batch } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      college: college || 'National Institute of Technology',
      department: department || 'Computer Science & Engineering',
      batch: batch || '2026',
      developerScore: {
        overall: 70,
        dimensions: {
          problemSolving: 72,
          competitiveProgramming: 65,
          consistency: 70,
          contestParticipation: 60,
          gitHubActivity: 75,
          projectActivity: 70
        }
      },
      profile: {
        role: 'Software Engineer',
        skills: ['DSA', 'React', 'JavaScript', 'Node.js', 'C++'],
        education: `${college || 'NIT'} - ${department || 'CSE'}`,
        achievements: 'Joined Dupilio Developer Hub'
      }
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        department: user.department,
        batch: user.batch,
        developerScore: user.developerScore,
        profile: user.profile
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Authenticate User & Login
// @route   POST /api/v1/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        department: user.department,
        batch: user.batch,
        developerScore: user.developerScore,
        profile: user.profile
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout User
// @route   POST /api/v1/auth/logout
// @access  Private
export const logoutUser = async (req, res, next) => {
  res.json({ success: true, message: 'Logged out successfully.' });
};
