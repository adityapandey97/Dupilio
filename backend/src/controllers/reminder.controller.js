import {
  createReminder as scheduleReminder,
  cancelReminder as removeReminder,
  getUserReminders
} from '../services/reminders/reminderEngine.js';

// @desc    Get user's reminders
// @route   GET /api/v1/reminders
export const getReminders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const reminders = await getUserReminders(userId);
    res.json({ success: true, count: reminders.length, reminders });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a contest, event, or task reminder
// @route   POST /api/v1/reminders
export const createReminder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      type,
      referenceId,
      referenceModel,
      title,
      message,
      targetTime,
      leadTimeMinutes,
      channel,
      recipientPhone
    } = req.body;

    const reminder = await scheduleReminder({
      userId,
      type: type || 'contest',
      referenceId,
      referenceModel: referenceModel || 'Contest',
      title,
      message,
      targetTime,
      leadTimeMinutes: Number(leadTimeMinutes) || 30,
      channel: channel || 'browser',
      recipientPhone
    });

    res.status(201).json({
      success: true,
      message: `Reminder scheduled ${leadTimeMinutes || 30} minutes before "${title}" via ${channel || 'browser'}.`,
      reminder
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel a scheduled reminder
// @route   DELETE /api/v1/reminders/:id
export const cancelReminder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const reminder = await removeReminder(id, userId);
    res.json({ success: true, message: 'Reminder cancelled.', reminder });
  } catch (err) {
    next(err);
  }
};

export default { getReminders, createReminder, cancelReminder };
