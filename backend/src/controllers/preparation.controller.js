import { PlatformProfile } from '../models/PlatformProfile.js';
import { ProblemProgress } from '../models/ProblemProgress.js';
import { Problem } from '../models/Problem.js';
import {
  analyzeUserPreparation,
  getPersonalizedRecommendations
} from '../services/recommendation/recommendationEngine.js';

// @desc    Get AI Preparation and Weak-Area Analysis
// @route   GET /api/v1/preparation
export const getPreparationData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const profiles = await PlatformProfile.find({ userId });
    const solvedProgress = await ProblemProgress.find({ userId, isSolved: true });

    const analysis = analyzeUserPreparation(req.user.profile || {}, {}, profiles);
    const recommendations = getPersonalizedRecommendations(analysis.weakAreas, solvedProgress);

    res.json({
      success: true,
      analysis,
      recommendations
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Personalized Question Recommendations
// @route   GET /api/v1/recommendations
export const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const profiles = await PlatformProfile.find({ userId });
    const solvedProgress = await ProblemProgress.find({ userId, isSolved: true });

    const analysis = analyzeUserPreparation(req.user.profile || {}, {}, profiles);
    const recommendations = getPersonalizedRecommendations(analysis.weakAreas, solvedProgress);

    res.json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (err) {
    next(err);
  }
};

export default { getPreparationData, getRecommendations };
