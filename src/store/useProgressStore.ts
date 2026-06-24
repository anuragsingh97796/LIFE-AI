import { create } from 'zustand';
import { supabase } from '../database/supabase';
import { useAuthStore } from './useAuthStore';

export interface DailyProgress {
  id: string;
  user_id: string;
  date: string;
  completed_tasks: number;
  total_tasks: number;
  life_score: number;
  streak_count: number;
  created_at: string;
}

interface ProgressState {
  progressHistory: DailyProgress[];
  todayProgress: DailyProgress | null;
  loading: boolean;
  error: string | null;
  fetchProgress: () => Promise<void>;
  updateTodayProgress: (completedTasks: number, totalTasks: number) => Promise<void>;
  incrementTodayTasks: () => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progressHistory: [],
  todayProgress: null,
  loading: false,
  error: null,

  fetchProgress: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      // Fetch progress logs
      const { data, error } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      const logs = data || [];
      const todayLog = logs.find((log) => log.date === todayStr) || null;

      // Calculate streak
      let currentStreak = 0;
      if (todayLog) {
        currentStreak = todayLog.streak_count;
      } else if (logs.length > 0) {
        // If yesterday was completed, check streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const yesterdayLog = logs.find((log) => log.date === yesterdayStr);
        if (yesterdayLog) {
          currentStreak = yesterdayLog.streak_count;
        }
      }

      set({
        progressHistory: logs,
        todayProgress: todayLog,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch progress logs', loading: false });
    }
  },

  updateTodayProgress: async (completedTasks, totalTasks) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayProg = get().todayProgress;

      // Formula for placeholder life score:
      // Base is 50, + 10 for each completed task, capped between 0 and 100.
      const taskRatio = totalTasks > 0 ? completedTasks / totalTasks : 0;
      const lifeScore = Math.min(100, Math.max(0, Math.round(50 + taskRatio * 50)));

      // Determine streak
      let streak = 1;
      if (!todayProg) {
        // Find latest streak
        const history = get().progressHistory;
        if (history.length > 0) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          const yesterdayLog = history.find((log) => log.date === yesterdayStr);
          if (yesterdayLog) {
            streak = yesterdayLog.streak_count + 1;
          }
        }
      } else {
        streak = todayProg.streak_count;
      }

      const upsertData = {
        user_id: user.id,
        date: todayStr,
        completed_tasks: completedTasks,
        total_tasks: totalTasks,
        life_score: lifeScore,
        streak_count: streak,
      };

      const { data, error } = await supabase
        .from('daily_progress')
        .upsert(upsertData, { onConflict: 'user_id,date' })
        .select()
        .single();

      if (error) throw error;

      set((state) => {
        const updatedHistory = state.progressHistory.some((h) => h.date === todayStr)
          ? state.progressHistory.map((h) => (h.date === todayStr ? data : h))
          : [data, ...state.progressHistory];

        return {
          progressHistory: updatedHistory,
          todayProgress: data,
          loading: false,
        };
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to update progress', loading: false });
    }
  },

  incrementTodayTasks: async () => {
    const today = get().todayProgress;
    const completed = today ? today.completed_tasks + 1 : 1;
    const total = today ? today.total_tasks : 4; // Default to 4 tasks
    await get().updateTodayProgress(completed, total);
  },
}));
