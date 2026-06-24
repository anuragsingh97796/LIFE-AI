import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GoalStackParamList } from '../../navigation/GoalStackNavigator';
import { useGoalStore, Project } from '../../store/useGoalStore';
import { useAnalyticsStore } from '../../store/useAnalyticsStore';
import { GoalCalculationService } from '../../services/GoalCalculationService';
import { Timeline } from '../../components/Timeline';
import { TaskItem } from '../../components/TaskItem';

type Props = NativeStackScreenProps<GoalStackParamList, 'GoalDetails'>;

export default function GoalDetailsScreen() {
  const route = useRoute<Props['route']>();
  const navigation = useNavigation();
  const { goalId } = route.params;

  const { goals, milestones, projects, tasks, fetchGoalDetails, toggleTaskCompletion, loading } = useGoalStore();
  const { analytics, fetchAnalytics } = useAnalyticsStore();

  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetchGoalDetails(goalId);
    fetchAnalytics(goalId);
  }, [goalId]);

  const goal = goals.find(g => g.id === goalId);
  const goalMilestones = milestones[goalId] || [];
  const goalAnalytics = analytics[goalId];

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      setCalculating(true);
      await toggleTaskCompletion(taskId, completed);
      await GoalCalculationService.recalculateProgress(goalId);
      await fetchAnalytics(goalId); // refresh analytics
    } finally {
      setCalculating(false);
    }
  };

  if (!goal) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  // Get tasks for the active project, or all tasks if none selected
  const displayTasks = activeProject 
    ? tasks.filter(t => t.project_id === activeProject.id)
    : tasks.filter(t => goalMilestones.some(m => projects[m.id]?.some(p => p.id === t.project_id)));

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#374151" className="dark:text-gray-300" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 dark:text-white flex-1 text-center mr-8" numberOfLines={1}>
          {goal.title}
        </Text>
      </View>

      {loading && goalMilestones.length === 0 ? (
         <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
         </View>
      ) : (
        <ScrollView className="flex-1">
          {/* AI Insights Card */}
          <View className="mx-6 mt-6 mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-6 shadow-md shadow-blue-500/20">
            <View className="flex-row items-center mb-4">
              <Ionicons name="sparkles" size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">AI Insights</Text>
            </View>
            <View className="flex-row justify-between">
              <View>
                <Text className="text-blue-100 text-xs mb-1">Predicted Completion</Text>
                <Text className="text-white font-bold text-base">
                  {goalAnalytics?.predicted_completion_date ? new Date(goalAnalytics.predicted_completion_date).toLocaleDateString() : 'Calculating...'}
                </Text>
              </View>
              <View>
                <Text className="text-blue-100 text-xs mb-1">Risk Score</Text>
                <Text className="text-white font-bold text-base">{goalAnalytics?.risk_score || 0}%</Text>
              </View>
              <View>
                <Text className="text-blue-100 text-xs mb-1">Success Prob.</Text>
                <Text className="text-white font-bold text-base">{goalAnalytics?.consistency_score || 0}%</Text>
              </View>
            </View>
          </View>

          {/* Roadmap & Milestones */}
          <View className="mt-4">
            <Text className="text-xl font-bold text-gray-900 dark:text-white px-6 mb-4">Roadmap</Text>
            <Timeline 
              milestones={goalMilestones} 
              projects={projects} 
              onPressProject={(p) => setActiveProject(activeProject?.id === p.id ? null : p)}
            />
          </View>

          {/* Tasks Section */}
          <View className="mt-6 bg-white dark:bg-gray-800 pb-10">
            <View className="px-6 py-4 flex-row justify-between items-center border-b border-gray-100 dark:border-gray-700">
              <Text className="text-xl font-bold text-gray-900 dark:text-white">
                {activeProject ? `Tasks: ${activeProject.title}` : 'All Tasks'}
              </Text>
              {calculating && <ActivityIndicator size="small" color="#3b82f6" />}
            </View>
            
            {displayTasks.length === 0 ? (
              <View className="py-8 items-center">
                <Text className="text-gray-500">No tasks found.</Text>
              </View>
            ) : (
              displayTasks.map(task => (
                <TaskItem key={task.id} task={task} onToggle={handleToggleTask} />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
