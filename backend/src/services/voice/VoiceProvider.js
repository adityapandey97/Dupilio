/**
 * Abstract VoiceProvider Interface for Dupilio
 * Enables pluggable voice reminder dispatch (Twilio, Vapi, Retell, etc.)
 */

export class VoiceProvider {
  constructor(providerName = 'GenericVoiceProvider') {
    this.name = providerName;
  }

  /**
   * Initiate an immediate automated voice call
   * @param {Object} callParams - { recipientPhone, promptText, reminderTitle }
   * @returns {Promise<{ callId: string, status: string }>}
   */
  async createCall(callParams) {
    throw new Error(`createCall() not implemented in ${this.name}`);
  }

  /**
   * Schedule a voice call for future execution
   * @param {Object} scheduleParams - { recipientPhone, promptText, scheduledTime, reminderId }
   * @returns {Promise<{ scheduleId: string, status: string }>}
   */
  async scheduleCall(scheduleParams) {
    throw new Error(`scheduleCall() not implemented in ${this.name}`);
  }

  /**
   * Cancel a previously scheduled voice call
   * @param {string} callOrScheduleId
   * @returns {Promise<{ success: boolean }>}
   */
  async cancelCall(callOrScheduleId) {
    throw new Error(`cancelCall() not implemented in ${this.name}`);
  }
}

export default VoiceProvider;
