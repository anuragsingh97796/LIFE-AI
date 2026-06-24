import { create } from 'zustand';
import { supabase } from '../database/supabase';
import { Session, User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  name: string | null;
  age: number | null;
  occupation: string | null;
  onboarded: boolean;
  created_at?: string;
}

export interface UserPreferences {
  user_id: string;
  available_hours: number;
  preferred_language: string;
  updated_at?: string;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  preferences: UserPreferences | null;
  loading: boolean;
  restoringSession: boolean;
  error: string | null;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  restoreSession: () => Promise<void>;
  completeOnboarding: (
    name: string,
    age: number,
    occupation: string,
    primaryGoal: string,
    hoursPerDay: number,
    language: string
  ) => Promise<void>;
  updateLanguage: (language: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  preferences: null,
  loading: false,
  restoringSession: true,
  error: null,

  signUp: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) throw error;
      
      // Note: Trigger in Supabase will automatically create profile and preferences.
      set({ session: data.session, user: data.user, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to sign up', loading: false });
      throw err;
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      set({ session: data.session, user: data.user });
      
      if (data.user) {
        // Fetch profile
        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        // Fetch preferences
        const { data: prefData } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        set({
          profile: profileData || null,
          preferences: prefData || null,
        });
      }
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to sign in', loading: false });
      throw err;
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({
        session: null,
        user: null,
        profile: null,
        preferences: null,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to sign out', loading: false });
    }
  },

  resetPassword: async (email) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to reset password', loading: false });
      throw err;
    }
  },

  restoreSession: async () => {
    set({ restoringSession: true, error: null });
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session) {
        set({ session, user: session.user });

        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // Fetch preferences
        const { data: prefData } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        set({
          profile: profileData || null,
          preferences: prefData || null,
        });
      }
    } catch (err: any) {
      console.warn('Session restoration failed:', err.message);
    } finally {
      set({ restoringSession: false });
    }
  },

  completeOnboarding: async (name, age, occupation, primaryGoal, hoursPerDay, language) => {
    const user = get().user;
    if (!user) throw new Error('User not authenticated');
    
    set({ loading: true, error: null });
    try {
      // Update profile using upsert to handle missing rows
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .upsert({ id: user.id, name, age, occupation, onboarded: true })
        .select()
        .single();

      if (profileErr) throw profileErr;

      // Update preferences using upsert
      const { data: prefData, error: prefErr } = await supabase
        .from('user_preferences')
        .upsert({ user_id: user.id, available_hours: hoursPerDay, preferred_language: language })
        .select()
        .single();

      if (prefErr) throw prefErr;

      // Create initial primary goal in supabase goals table
      const { error: goalErr } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: primaryGoal,
          category: 'Primary',
          status: 'active',
        });

      if (goalErr) throw goalErr;

      // Create initial daily progress row
      const { error: progressErr } = await supabase
        .from('daily_progress')
        .insert({
          user_id: user.id,
          completed_tasks: 0,
          total_tasks: 4, // Default checklist total for today
          life_score: 50,  // Initial life score placeholder
          streak_count: 1, // Start 1st day streak
        });

      // Ignore unique constraint error if progress row for today already exists
      if (progressErr && !progressErr.message.includes('unique_user_date')) {
        console.warn('Daily progress initialization warning:', progressErr.message);
      }

      set({
        profile: profileData,
        preferences: prefData,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to complete onboarding', loading: false });
      throw err;
    }
  },

  updateLanguage: async (language) => {
    const user = get().user;
    if (!user) return;
    try {
      const { data: prefData, error } = await supabase
        .from('user_preferences')
        .update({ preferred_language: language })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      set({ preferences: prefData });
    } catch (err: any) {
      console.error('Failed to update language preference:', err.message);
    }
  },

  clearError: () => set({ error: null }),
}));
