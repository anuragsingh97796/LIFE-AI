export class GamificationService {
  /**
   * Calculates XP based on action.
   * For now, this is purely client-side logic. 
   * In a future update, we can persist XP to user_profiles.
   */
  static calculateXP(action: 'task' | 'project' | 'milestone' | 'goal'): number {
    switch (action) {
      case 'task':
        return 10;
      case 'project':
        return 50;
      case 'milestone':
        return 200;
      case 'goal':
        return 1000;
      default:
        return 0;
    }
  }

  static getLevel(totalXP: number): number {
    // Simple level curve
    return Math.floor(Math.sqrt(totalXP / 100)) + 1;
  }
}
