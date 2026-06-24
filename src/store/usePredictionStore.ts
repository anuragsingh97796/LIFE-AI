import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Prediction {
  goal_id: string;
  predictedCompletionDate: string | null;
  riskScore: number; // 0 to 100
  successProbability: number; // 0 to 100
  recommendations: string[];
}

interface PredictionState {
  predictions: Record<string, Prediction>;
  generatePredictions: (goalId: string, currentProgress: number, velocity: number) => void;
}

export const usePredictionStore = create<PredictionState>()(
  persist(
    (set) => ({
      predictions: {},

      generatePredictions: (goalId, currentProgress, velocity) => {
        // Mock prediction logic
        const riskScore = Math.max(0, 100 - currentProgress - velocity);
        const successProbability = Math.min(100, currentProgress + velocity);
        
        let recommendations: string[] = [];
        if (riskScore > 50) {
          recommendations.push("You are behind schedule.");
          recommendations.push("You need 30 more minutes daily.");
        } else if (successProbability > 80) {
          recommendations.push("You are doing great!");
          recommendations.push("You can finish early.");
        } else {
          recommendations.push("Keep up the steady pace.");
        }

        const prediction: Prediction = {
          goal_id: goalId,
          predictedCompletionDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(), // Mock +14 days
          riskScore,
          successProbability,
          recommendations,
        };

        set((state) => ({
          predictions: { ...state.predictions, [goalId]: prediction }
        }));
      }
    }),
    {
      name: 'lifeos-prediction-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
