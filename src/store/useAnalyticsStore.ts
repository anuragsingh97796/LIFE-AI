import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../database/supabase';
import { useAuthStore } from './useAuthStore';

export interface GoalAnalytics {
  id: string;
  goal_id: string;
  progress_percentage: number;
  predicted_completion_date: string | null;
  risk_score: number;
  consistency_score: number;
  updated_at: string;
}

interface AnalyticsState {
  analytics: Record<string, GoalAnalytics>; // key: goal_id
  loading: boolean;
  error: string | null;
  fetchAnalytics: (goalId: string) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      analytics: {},
      loading: false,
      error: null,

      fetchAnalytics: async (goalId: string) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('goal_analytics')
            .select('*')
            .eq('goal_id', goalId)
            .single();

          if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows found"

          if (data) {
            set((state) => ({
              analytics: { ...state.analytics, [goalId]: data },
              loading: false,
            }));
          } else {
             set({ loading: false });
          }
        } catch (err: any) {
          set({ error: err.message || 'Failed to fetch analytics', loading: false });
        }
      },
    }),
    {
      name: 'lifeos-analytics-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
