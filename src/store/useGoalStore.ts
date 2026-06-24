import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../database/supabase';
import { useAuthStore } from './useAuthStore';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: string; // Critical, High, Medium, Low
  target_date: string | null;
  status: string; // 'active' | 'completed' | 'archived'
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  goal_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  completion_percentage: number;
  status: string; // 'pending' | 'in_progress' | 'completed'
  created_at: string;
}

export interface Project {
  id: string;
  milestone_id: string;
  title: string;
  description: string | null;
  status: string; // 'pending' | 'in_progress' | 'completed'
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string | null;
  user_id: string;
  title: string;
  description: string | null;
  priority: string;
  estimated_minutes: number;
  scheduled_date: string | null;
  completed: boolean;
  created_at: string;
}

interface GoalState {
  goals: Goal[];
  milestones: Record<string, Milestone[]>; // key: goal_id
  projects: Record<string, Project[]>; // key: milestone_id
  tasks: Task[]; // keep all tasks flat or map by project_id
  loading: boolean;
  error: string | null;
  fetchGoals: () => Promise<void>;
  fetchGoalDetails: (goalId: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Goal>;
  updateGoalStatus: (id: string, status: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  toggleTaskCompletion: (taskId: string, completed: boolean) => Promise<void>;
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      goals: [],
      milestones: {},
      projects: {},
      tasks: [],
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

      fetchGoalDetails: async (goalId: string) => {
        set({ loading: true, error: null });
        try {
          // Fetch milestones
          const { data: milestonesData, error: milestonesError } = await supabase
            .from('goal_milestones')
            .select('*')
            .eq('goal_id', goalId)
            .order('created_at', { ascending: true });
            
          if (milestonesError) throw milestonesError;
          
          const milestoneIds = milestonesData?.map(m => m.id) || [];
          
          // Fetch projects for these milestones
          let projectsData: Project[] = [];
          if (milestoneIds.length > 0) {
            const { data: pData, error: pError } = await supabase
              .from('goal_projects')
              .select('*')
              .in('milestone_id', milestoneIds)
              .order('created_at', { ascending: true });
              
            if (pError) throw pError;
            projectsData = pData || [];
          }
          
          const projectIds = projectsData.map(p => p.id);
          
          // Fetch tasks for these projects
          let tasksData: Task[] = [];
          if (projectIds.length > 0) {
            const { data: tData, error: tError } = await supabase
              .from('tasks')
              .select('*')
              .in('project_id', projectIds)
              .order('created_at', { ascending: true });
              
            if (tError) throw tError;
            tasksData = tData || [];
          }

          // Group projects by milestone_id
          const projectsByMilestone: Record<string, Project[]> = {};
          projectsData.forEach(p => {
            if (!projectsByMilestone[p.milestone_id]) {
              projectsByMilestone[p.milestone_id] = [];
            }
            projectsByMilestone[p.milestone_id].push(p);
          });

          set((state) => ({
            milestones: { ...state.milestones, [goalId]: milestonesData || [] },
            projects: { ...state.projects, ...projectsByMilestone },
            // merge tasks, avoiding duplicates
            tasks: [
              ...state.tasks.filter(st => !tasksData.some(td => td.id === st.id)),
              ...tasksData
            ],
            loading: false
          }));

        } catch (err: any) {
          set({ error: err.message || 'Failed to fetch goal details', loading: false });
        }
      },

      addGoal: async (goalData) => {
        const user = useAuthStore.getState().user;
        if (!user) throw new Error('User not authenticated');

        set({ loading: true, error: null });
        try {
          const newGoal = {
            ...goalData,
            user_id: user.id,
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
          return data;
        } catch (err: any) {
          set({ error: err.message || 'Failed to add goal', loading: false });
          throw err;
        }
      },

      updateGoalStatus: async (id, status) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('goals')
            .update({ status })
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

          set((state) => {
            const newMilestones = { ...state.milestones };
            delete newMilestones[id];
            return {
              goals: state.goals.filter((g) => g.id !== id),
              milestones: newMilestones,
              loading: false,
            };
          });
        } catch (err: any) {
          set({ error: err.message || 'Failed to delete goal', loading: false });
          throw err;
        }
      },

      toggleTaskCompletion: async (taskId, completed) => {
        try {
          // Optimistic update
          set((state) => ({
            tasks: state.tasks.map(t => t.id === taskId ? { ...t, completed } : t)
          }));

          const { error } = await supabase
            .from('tasks')
            .update({ completed })
            .eq('id', taskId);

          if (error) throw error;
        } catch (err: any) {
          // Revert on error
          set((state) => ({
            tasks: state.tasks.map(t => t.id === taskId ? { ...t, completed: !completed } : t),
            error: err.message || 'Failed to update task'
          }));
        }
      }
    }),
    {
      name: 'lifeos-goal-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        goals: state.goals,
        milestones: state.milestones,
        projects: state.projects,
        tasks: state.tasks
      }), // Persist these fields
    }
  )
);
