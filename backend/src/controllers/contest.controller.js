import { Contest } from '../models/Contest.js';
import { ingestContests } from '../services/contests/contestIngestion.js';

// @desc    Get all aggregated contests (upcoming, live, past)
// @route   GET /api/v1/contests
export const getContests = async (req, res, next) => {
  try {
    const { status, platform, search } = req.query;

    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (platform && platform !== 'all') {
      query.platform = platform.toLowerCase();
    }

    let contests = await Contest.find(query);

    // Initial seed if empty
    if (contests.length === 0 && !status && !platform) {
      await ingestContests();
      contests = await Contest.find({});
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      contests = contests.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.platform.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q)
      );
    }

    // Sort by startTime
    contests.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    res.json({
      success: true,
      count: contests.length,
      contests
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single contest details
// @route   GET /api/v1/contests/:id
export const getContestById = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found.' });
    }
    res.json({ success: true, contest });
  } catch (err) {
    next(err);
  }
};

// @desc    Trigger immediate contest ingestion
// @route   POST /api/v1/contests/sync
export const syncContests = async (req, res, next) => {
  try {
    const result = await ingestContests();
    const contests = await Contest.find({});
    res.json({
      success: true,
      message: 'Contests successfully refreshed from external platforms.',
      result,
      contests
    });
  } catch (err) {
    next(err);
  }
};

export default { getContests, getContestById, syncContests };
