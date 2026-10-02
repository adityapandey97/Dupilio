import { Job } from '../models/Job.js';
import { mockJobs } from '../../../frontend/src/data/jobs.js';

// Seed jobs if empty
const seedJobsIfEmpty = async (userId) => {
  try {
    const list = await Job.find({ userId });
    if (list.length === 0) {
      console.log(`🌱 Seeding default Kanban jobs for user: ${userId}...`);
      for (const j of mockJobs) {
        await Job.create({
          userId,
          company: j.company,
          role: j.role,
          status: j.status,
          salary: j.salary || '',
          appliedDate: j.appliedDate,
          notes: j.notes || ''
        });
      }
    }
  } catch (e) {
    console.error('⚠️ Seeding jobs failed: ', e.message);
  }
};

// @desc    Get All Job Applications
// @route   GET /api/v1/jobs
// @access  Private
export const getJobs = async (req, res, next) => {
  try {
    // Seed default jobs first for demonstration
    await seedJobsIfEmpty(req.user._id);

    const jobs = await Job.find({ userId: req.user._id });
    res.json({ success: true, jobs });
  } catch (err) {
    next(err);
  }
};

// @desc    Create Job Application
// @route   POST /api/v1/jobs
// @access  Private
export const createJob = async (req, res, next) => {
  try {
    const { company, role, status, salary, appliedDate, notes } = req.body;
    const job = await Job.create({
      userId: req.user._id,
      company,
      role,
      status,
      salary,
      appliedDate,
      notes
    });
    res.status(201).json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

// @desc    Update Job Application Status
// @route   PUT /api/v1/jobs/:id
// @access  Private
export const updateJob = async (req, res, next) => {
  try {
    const { status } = req.body;
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job application not found.' });
    }
    res.json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete Job Application
// @route   DELETE /api/v1/jobs/:id
// @access  Private
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job application not found.' });
    }
    res.json({ success: true, message: 'Job application removed successfully.' });
  } catch (err) {
    next(err);
  }
};
