import { supabase } from '../database/supabase';
import { useGoalStore } from '../store/useGoalStore';

export class GoalCalculationService {
  /**
   * Recalculates progress for a Project, Milestone, and Goal when a task changes.
   */
  static async recalculateProgress(goalId: string): Promise<void> {
    try {
      // 1. Fetch all milestones for goal
      const { data: milestones, error: mError } = await supabase
        .from('goal_milestones')
        .select('id')
        .eq('goal_id', goalId);
      if (mError) throw mError;

      const milestoneIds = milestones.map(m => m.id);
      if (milestoneIds.length === 0) return;

      // 2. Fetch all projects for milestones
      const { data: projects, error: pError } = await supabase
        .from('goal_projects')
        .select('id, milestone_id')
        .in('milestone_id', milestoneIds);
      if (pError) throw pError;

      const projectIds = projects.map(p => p.id);
      
      let allTasks: any[] = [];
      if (projectIds.length > 0) {
          // 3. Fetch all tasks for projects
          const { data: tasks, error: tError } = await supabase
            .from('tasks')
            .select('id, project_id, completed')
            .in('project_id', projectIds);
          if (tError) throw tError;
          allTasks = tasks || [];
      }

      let totalTasksForGoal = 0;
      let completedTasksForGoal = 0;

      // Calculate milestone percentages
      for (const mId of milestoneIds) {
        const milestoneProjects = projects.filter(p => p.milestone_id === mId);
        const mProjectIds = milestoneProjects.map(p => p.id);
        
        const milestoneTasks = allTasks.filter(t => mProjectIds.includes(t.project_id));
        
        const mTotalTasks = milestoneTasks.length;
        const mCompletedTasks = milestoneTasks.filter(t => t.completed).length;
        
        const completionPercentage = mTotalTasks > 0 ? Math.round((mCompletedTasks / mTotalTasks) * 100) : 0;
        let status = 'pending';
        if (completionPercentage > 0 && completionPercentage < 100) status = 'in_progress';
        if (completionPercentage === 100 && mTotalTasks > 0) status = 'completed';

        await supabase
          .from('goal_milestones')
          .update({ completion_percentage: completionPercentage, status })
          .eq('id', mId);

        totalTasksForGoal += mTotalTasks;
        completedTasksForGoal += mCompletedTasks;
      }

      const goalProgress = totalTasksForGoal > 0 ? Math.round((completedTasksForGoal / totalTasksForGoal) * 100) : 0;

      // Update Analytics Table
      const { data: analyticsExists } = await supabase
        .from('goal_analytics')
        .select('id')
        .eq('goal_id', goalId)
        .single();

      if (analyticsExists) {
        await supabase
          .from('goal_analytics')
          .update({ progress_percentage: goalProgress, updated_at: new Date().toISOString() })
          .eq('goal_id', goalId);
      } else {
        await supabase
          .from('goal_analytics')
          .insert({
            goal_id: goalId,
            progress_percentage: goalProgress,
          });
      }

      // Refresh stores locally
      await useGoalStore.getState().fetchGoalDetails(goalId);

    } catch (error) {
      console.error('Error recalculating progress:', error);
    }
  }
}
