import { supabase } from '../database/supabase';
import { usePredictionStore } from '../store/usePredictionStore';

export class PredictionService {
  /**
   * Analyzes progress and updates predictions
   */
  static async analyzeGoal(goalId: string, currentProgress: number): Promise<void> {
    try {
      // Basic mock velocity calculation
      // In a real app, we'd look at tasks completed per day over the last 7 days
      const mockVelocity = Math.floor(Math.random() * 5) + 1; // 1-5% per day
      
      usePredictionStore.getState().generatePredictions(goalId, currentProgress, mockVelocity);
      
      const predictions = usePredictionStore.getState().predictions[goalId];
      if (!predictions) return;

      // Persist to analytics table
      await supabase
        .from('goal_analytics')
        .update({
          predicted_completion_date: predictions.predictedCompletionDate,
          risk_score: predictions.riskScore,
          consistency_score: predictions.successProbability // using success probability as proxy for now
        })
        .eq('goal_id', goalId);
        
    } catch (error) {
      console.error('Error analyzing goal:', error);
    }
  }
}
