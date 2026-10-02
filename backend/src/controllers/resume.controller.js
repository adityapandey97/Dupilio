import { Resume } from '../models/Resume.js';
import { analyzeResume } from '../services/ai.service.js';

// @desc    Get Latest Resume Analysis
// @route   GET /api/v1/resume
// @access  Private
export const getResumeData = async (req, res, next) => {
  try {
    const list = await Resume.find({ userId: req.user._id });
    if (list.length === 0) {
      return res.json({
        success: true,
        resumeData: {
          uploaded: false,
          fileName: '',
          atsScore: 0,
          skills: 0,
          experience: 0,
          projects: 0,
          keywords: 0,
          formatting: 0,
          missingSkills: [],
          suggestions: []
        }
      });
    }

    // Sort to return the most recently uploaded
    const sorted = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, resumeData: { ...sorted[0], uploaded: true } });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload and Analyze Resume PDF
// @route   POST /api/v1/resume/upload
// @access  Private
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a valid PDF file.' });
    }

    const { jobDescription } = req.body;
    const fileName = req.file.originalname;

    // Convert file buffer to string, stripping binary markers to isolate plain-text keywords
    const textContent = req.file.buffer
      .toString('utf8')
      .replace(/[^\x20-\x7E\n]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    console.log(`📂 Analyzing uploaded resume: "${fileName}" for user: ${req.user.name}`);

    // Call the AI Service to analyze the resume text against the job description
    const analysis = await analyzeResume(textContent, jobDescription || '');

    // Save resume analysis result in database
    const newResumeData = await Resume.create({
      userId: req.user._id,
      fileName,
      atsScore: analysis.atsScore,
      skills: analysis.skills,
      experience: analysis.experience,
      projects: analysis.projects,
      keywords: analysis.keywords,
      formatting: analysis.formatting,
      missingSkills: analysis.missingSkills,
      suggestions: analysis.suggestions
    });

    res.json({
      success: true,
      resumeData: {
        ...newResumeData,
        uploaded: true
      }
    });
  } catch (err) {
    next(err);
  }
};
