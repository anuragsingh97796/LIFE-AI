import { Platform } from 'react-native';

export class NotificationService {
  /**
   * Initializes notification channels and permissions.
   * Prepares the architecture for future APNs/FCM push notifications.
   */
  static async initialize() {
    console.log('[NotificationService] Initializing notification permissions...');
    // Future: Call expo-notifications requestPermissionsAsync()
  }

  static async scheduleReminder(title: string, body: string, triggerDate?: Date) {
    console.log(`[NotificationService] Scheduled: ${title} - ${body} for ${triggerDate || 'now'}`);
    // Future: Call expo-notifications scheduleNotificationAsync()
  }

  static async sendGoalAtRiskAlert(goalTitle: string) {
    this.scheduleReminder(
      'Goal at Risk!',
      `You're falling behind on "${goalTitle}". Take 15 minutes today to catch up!`,
    );
  }

  static async sendMilestoneAchievedAlert(milestoneTitle: string) {
    this.scheduleReminder(
      'Milestone Reached! 🎉',
      `Congratulations! You've successfully completed "${milestoneTitle}".`,
    );
  }
}
