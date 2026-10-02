import { Interview } from '../models/Interview.js';
import { mockInterviews } from '../../../frontend/src/data/interviews.js';
import { evaluateInterviewAnswer, generateSessionReport } from '../services/ai.service.js';

// @desc    Get Interview Templates
// @route   GET /api/v1/interviews
// @access  Private
export const getInterviews = async (req, res, next) => {
  try {
    // Return standard templates for front-end selection
    res.json({ success: true, interviews: mockInterviews });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Session History
// @route   GET /api/v1/interviews/results
// @access  Private
export const getInterviewResults = async (req, res, next) => {
  try {
    const results = await Interview.find({ userId: req.user._id });
    res.json({ success: true, results });
  } catch (err) {
    next(err);
  }
};

// @desc    Evaluate and Save Interview Session
// @route   POST /api/v1/interviews/submit
// @access  Private
export const submitInterview = async (req, res, next) => {
  try {
    const { interviewId, answers } = req.body; // answers: [{ questionId, questionText, answerText }]
    
    // Find interview template
    const template = mockInterviews.find(item => item.id === interviewId);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Interview template not found.' });
    }

    console.log(`🧠 AI Evaluating session: ${template.name} for User: ${req.user.name}`);
    
    const answersReview = [];
    
    // Evaluate each question using the AI service
    for (const ans of answers) {
      const questionTemplate = template.questions.find(q => q.id === ans.questionId);
      const idealPoints = questionTemplate ? questionTemplate.idealAnswerPoints : ['Explain basic concepts'];
      
      const evaluation = await evaluateInterviewAnswer(
        ans.questionText,
        idealPoints,
        ans.answerText || ''
      );

      answersReview.push({
        questionId: ans.questionId,
        questionText: ans.questionText,
        answerText: ans.answerText || '[ No answer spoken. ]',
        score: evaluation.score,
        feedback: evaluation.feedback,
        points: evaluation.points
      });
    }

    // Generate session report strengths/weaknesses and general feedback
    const reportSummary = await generateSessionReport(template.name, answersReview);

    // Save result to database
    const newInterviewResult = await Interview.create({
      userId: req.user._id,
      interviewName: template.name,
      date: new Date().toLocaleDateString(),
      score: reportSummary.score,
      answers: answersReview,
      strengths: reportSummary.strengths,
      weaknesses: reportSummary.weaknesses,
      generalFeedback: reportSummary.generalFeedback
    });

    res.status(201).json({
      success: true,
      report: newInterviewResult
    });
  } catch (err) {
    next(err);
  }
};
