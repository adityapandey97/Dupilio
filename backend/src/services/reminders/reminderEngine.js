import { Reminder } from '../../models/Reminder.js';
import { getVoiceProvider } from '../voice/MockVoiceProvider.js';

export const createReminder = async ({
  userId,
  type = 'contest',
  referenceId = '',
  referenceModel = 'Contest',
  title,
  message = '',
  targetTime,
  leadTimeMinutes = 30,
  channel = 'browser',
  recipientPhone = null
}) => {
  if (!userId || !title || !targetTime) {
    throw new Error('userId, title, and targetTime are required to create a reminder');
  }

  // Calculate actual scheduled trigger time based on targetTime minus leadTimeMinutes
  const targetDate = new Date(targetTime);
  const scheduledDate = new Date(targetDate.getTime() - leadTimeMinutes * 60000);

  const reminder = await Reminder.create({
    userId,
    type,
    referenceId,
    referenceModel,
    title,
    message: message || `Reminder: "${title}" starts in ${leadTimeMinutes} minutes!`,
    scheduledAt: scheduledDate.toISOString(),
    leadTimeMinutes,
    channel,
    status: 'pending',
    metadata: {
      targetTime: targetDate.toISOString(),
      recipientPhone: recipientPhone || null
    }
  });

  // If voice channel is selected, call the abstract VoiceProvider
  if (channel === 'voice') {
    try {
      const voice = getVoiceProvider();
      const callSchedule = await voice.scheduleCall({
        recipientPhone: recipientPhone || '+1-555-0199',
        promptText: `Hello! This is your Dupilio Voice Alert. Your scheduled contest, ${title}, is beginning in ${leadTimeMinutes} minutes. Good luck!`,
        scheduledTime: scheduledDate.toISOString(),
        reminderId: reminder._id
      });

      await Reminder.findByIdAndUpdate(reminder._id, {
        $set: {
          metadata: {
            ...reminder.metadata,
            voiceScheduleId: callSchedule.scheduleId
          }
        }
      });
    } catch (voiceErr) {
      console.warn(`[ReminderEngine] Voice scheduling warning: ${voiceErr.message}`);
    }
  }

  console.log(`🔔 [ReminderEngine] Reminder created for user ${userId} | "${title}" | Channel: ${channel} | Scheduled for: ${scheduledDate.toISOString()}`);
  return reminder;
};

export const cancelReminder = async (reminderId, userId) => {
  const reminder = await Reminder.findById(reminderId);
  if (!reminder) {
    throw new Error('Reminder not found');
  }
  if (reminder.userId !== userId && userId !== 'admin') {
    throw new Error('Unauthorized to cancel this reminder');
  }

  if (reminder.channel === 'voice' && reminder.metadata?.voiceScheduleId) {
    try {
      const voice = getVoiceProvider();
      await voice.cancelCall(reminder.metadata.voiceScheduleId);
    } catch (e) {
      // non-blocking
    }
  }

  const updated = await Reminder.findByIdAndUpdate(reminderId, {
    $set: { status: 'cancelled' }
  }, { new: true });

  return updated;
};

export const getUserReminders = async (userId) => {
  const reminders = await Reminder.find({ userId });
  return reminders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

export const processDueReminders = async () => {
  const now = new Date();
  const pending = await Reminder.find({ status: 'pending' });
  let count = 0;

  for (const rem of pending) {
    const sched = new Date(rem.scheduledAt);
    if (sched <= now) {
      console.log(`📢 [ReminderEngine] Triggering alert for "${rem.title}" (Channel: ${rem.channel}) to user ${rem.userId}`);

      if (rem.channel === 'voice') {
        const voice = getVoiceProvider();
        await voice.createCall({
          recipientPhone: rem.metadata?.recipientPhone || '+1-555-0199',
          promptText: rem.message,
          reminderTitle: rem.title
        });
      }

      await Reminder.findByIdAndUpdate(rem._id, {
        $set: {
          status: 'triggered',
          triggeredAt: now.toISOString()
        }
      });
      count++;
    }
  }

  return { processed: count };
};

export default {
  createReminder,
  cancelReminder,
  getUserReminders,
  processDueReminders
};
