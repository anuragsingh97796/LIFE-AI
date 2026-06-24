import { create } from 'zustand';
import { supabase } from '../database/supabase';
import { useAuthStore } from './useAuthStore';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  category: string | null;
  target_date: string | null;
  status: string; // 'active' | 'completed' | 'archived'
  created_at: string;
}

interface GoalState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  fetchGoals: () => Promise<void>;
  addGoal: (title: string, category: string, targetDate?: string) => Promise<void>;
  toggleGoalStatus: (id: string, currentStatus: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  loading: false,
  error: null,

  fetchGoals: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ goals: data || [], loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch goals', loading: false });
    }
  },

  addGoal: async (title, category, targetDate) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');

    set({ loading: true, error: null });
    try {
      const newGoal = {
        user_id: user.id,
        title,
        category,
        target_date: targetDate || null,
        status: 'active',
      };

      const { data, error } = await supabase
        .from('goals')
        .insert(newGoal)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        goals: [data, ...state.goals],
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to add goal', loading: false });
      throw err;
    }
  },

  toggleGoalStatus: async (id, currentStatus) => {
    set({ loading: true, error: null });
    try {
      const newStatus = currentStatus === 'active' ? 'completed' : 'active';
      const { data, error } = await supabase
        .from('goals')
        .update({ status: newStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? data : g)),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to update goal', loading: false });
      throw err;
    }
  },

  deleteGoal: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('goals').delete().eq('id', id);
      if (error) throw error;

      set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete goal', loading: false });
      throw err;
    }
  },
}));
