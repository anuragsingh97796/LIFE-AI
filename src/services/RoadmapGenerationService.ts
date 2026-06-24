import { supabase } from '../database/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { Goal, Milestone, Project, Task, useGoalStore } from '../store/useGoalStore';

interface GenerationInput {
  goalId: string;
  goalTitle: string;
  category: string | null;
  targetDate: string | null;
}

export class RoadmapGenerationService {
  /**
   * Mocks AI roadmap generation based on templates.
   * In the future, this will call an edge function with OpenAI API.
   */
  static async generateRoadmap(input: GenerationInput): Promise<void> {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');

    // MOCK DATA based on input.category
    const roadmap = this.getMockTemplate(input.goalTitle, input.category);

    try {
      // 1. Create Milestones
      for (const m of roadmap.milestones) {
        const { data: milestoneData, error: mError } = await supabase
          .from('goal_milestones')
          .insert({
            goal_id: input.goalId,
            title: m.title,
            description: m.description,
            status: 'pending',
          })
          .select()
          .single();

        if (mError) throw mError;

        // 2. Create Projects for this Milestone
        for (const p of m.projects) {
          const { data: projectData, error: pError } = await supabase
            .from('goal_projects')
            .insert({
              milestone_id: milestoneData.id,
              title: p.title,
              description: p.description,
              status: 'pending',
            })
            .select()
            .single();

          if (pError) throw pError;

          // 3. Create Tasks for this Project
          const tasksToInsert = p.tasks.map((t: any) => ({
            project_id: projectData.id,
            user_id: user.id,
            title: t.title,
            priority: t.priority || 'Medium',
            estimated_minutes: t.estimatedMinutes || 30,
            completed: false,
          }));

          const { error: tError } = await supabase
            .from('tasks')
            .insert(tasksToInsert);

          if (tError) throw tError;
        }
      }

      // Refresh the goal store to pull down the newly generated roadmap
      await useGoalStore.getState().fetchGoalDetails(input.goalId);

    } catch (error) {
      console.error('Error generating roadmap:', error);
      throw error;
    }
  }

  private static getMockTemplate(title: string, category: string | null) {
    const defaultTemplate = {
      milestones: [
        {
          title: 'Milestone 1: Fundamentals',
          description: 'Learn the basics and set up your environment.',
          projects: [
            {
              title: 'Research & Planning',
              description: 'Gather resources and create a study plan.',
              tasks: [
                { title: 'Find top 3 books/courses', estimatedMinutes: 60, priority: 'High' },
                { title: 'Create weekly schedule', estimatedMinutes: 30, priority: 'Medium' }
              ]
            },
            {
              title: 'Environment Setup',
              description: 'Get all tools ready.',
              tasks: [
                { title: 'Install necessary software', estimatedMinutes: 45, priority: 'High' },
                { title: 'Configure workspace', estimatedMinutes: 30, priority: 'Low' }
              ]
            }
          ]
        },
        {
          title: 'Milestone 2: Practice & Application',
          description: 'Start building or applying the knowledge.',
          projects: [
            {
              title: 'First small project',
              description: 'Apply basics to a real problem.',
              tasks: [
                { title: 'Define project scope', estimatedMinutes: 30, priority: 'Medium' },
                { title: 'Execute project', estimatedMinutes: 120, priority: 'High' }
              ]
            }
          ]
        }
      ]
    };

    if (title.toLowerCase().includes('ai engineer')) {
      return {
        milestones: [
          {
            title: 'Milestone 1: Python Fundamentals',
            description: 'Master Python programming language.',
            projects: [
              {
                title: 'Data Structures & Algorithms',
                description: 'Lists, Dictionaries, OOP.',
                tasks: [
                  { title: 'Complete Python Course Module 1', estimatedMinutes: 60, priority: 'High' },
                  { title: 'Solve 5 Leetcode easy problems', estimatedMinutes: 120, priority: 'Medium' }
                ]
              }
            ]
          },
          {
            title: 'Milestone 2: Machine Learning',
            description: 'Learn classical ML algorithms.',
            projects: [
              {
                title: 'Scikit-Learn Basics',
                description: 'Regression, Classification.',
                tasks: [
                  { title: 'Build Linear Regression model', estimatedMinutes: 90, priority: 'High' },
                  { title: 'Evaluate model accuracy', estimatedMinutes: 30, priority: 'Medium' }
                ]
              }
            ]
          },
          {
            title: 'Milestone 3: Deep Learning',
            description: 'Neural Networks with PyTorch.',
            projects: [
              {
                title: 'PyTorch setup',
                description: 'Build first NN.',
                tasks: [
                  { title: 'Train CNN on MNIST', estimatedMinutes: 120, priority: 'High' }
                ]
              }
            ]
          }
        ]
      };
    }

    return defaultTemplate;
  }
}
