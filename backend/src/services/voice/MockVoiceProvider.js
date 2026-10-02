import VoiceProvider from './VoiceProvider.js';

export class MockVoiceProvider extends VoiceProvider {
  constructor() {
    super('MockVoiceProvider');
    this.scheduledCalls = new Map();
  }

  async createCall({ recipientPhone, promptText, reminderTitle }) {
    const maskedPhone = recipientPhone ? recipientPhone.replace(/.(?=.{4})/g, '*') : '***-***-0000';
    console.log(`📞 [VoiceProvider] Outgoing automated alert call dispatched to ${maskedPhone}`);
    console.log(`🗣️ Script: "${promptText || `Reminder: Your contest ${reminderTitle} is starting in 30 minutes!`}"`);

    return {
      callId: `call_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      status: 'queued',
      provider: 'MockVoiceProvider',
      dispatchedAt: new Date().toISOString()
    };
  }

  async scheduleCall({ recipientPhone, promptText, scheduledTime, reminderId }) {
    const scheduleId = `sched_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const maskedPhone = recipientPhone ? recipientPhone.replace(/.(?=.{4})/g, '*') : '***-***-0000';

    this.scheduledCalls.set(scheduleId, {
      scheduleId,
      reminderId,
      maskedPhone,
      promptText,
      scheduledTime,
      status: 'scheduled'
    });

    console.log(`⏰ [VoiceProvider] Automated voice reminder scheduled for ${scheduledTime} to ${maskedPhone}`);
    return {
      scheduleId,
      status: 'scheduled',
      provider: 'MockVoiceProvider'
    };
  }

  async cancelCall(scheduleId) {
    if (this.scheduledCalls.has(scheduleId)) {
      this.scheduledCalls.delete(scheduleId);
      console.log(`🚫 [VoiceProvider] Scheduled voice reminder ${scheduleId} cancelled.`);
      return { success: true, message: 'Call cancelled successfully.' };
    }
    return { success: false, message: 'Schedule ID not found.' };
  }
}

let activeProvider = new MockVoiceProvider();

export const getVoiceProvider = () => activeProvider;
export const setVoiceProvider = (provider) => {
  activeProvider = provider;
};

export default { getVoiceProvider, setVoiceProvider, MockVoiceProvider };
