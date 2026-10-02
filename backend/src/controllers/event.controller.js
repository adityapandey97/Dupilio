import { Event } from '../models/Event.js';
import { getEvents as fetchEvents } from '../services/events/eventService.js';

// @desc    Get all hackathons and opportunities
// @route   GET /api/v1/events
export const getEvents = async (req, res, next) => {
  try {
    const { type, location, search } = req.query;
    const events = await fetchEvents({ type, location, search });
    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single event
// @route   GET /api/v1/events/:id
export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    res.json({ success: true, event });
  } catch (err) {
    next(err);
  }
};

// @desc    Create event (Admin)
// @route   POST /api/v1/events
export const createEvent = async (req, res, next) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json({ success: true, message: 'Event published successfully.', event });
  } catch (err) {
    next(err);
  }
};

export default { getEvents, getEventById, createEvent };
