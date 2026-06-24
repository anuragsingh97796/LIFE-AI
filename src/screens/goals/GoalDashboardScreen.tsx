import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GoalStackParamList } from '../../navigation/GoalStackNavigator';
import { useGoalStore, Goal, Task } from '../../store/useGoalStore';
import { useAnalyticsStore } from '../../store/useAnalyticsStore';
import { GoalCalculationService } from '../../services/GoalCalculationService';
import { ProgressRing } from '../../components/ProgressRing';

type NavigationProp = NativeStackNavigationProp<GoalStackParamList, 'GoalDashboard'>;

export default function GoalDashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { goals, fetchGoals, loading } = useGoalStore();
  const { fetchAnalytics, analytics } = useAnalyticsStore();
  
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  useEffect(() => {
    if (goals.length > 0 && !activeGoalId) {
      setActiveGoalId(goals[0].id);
    }
  }, [goals, activeGoalId]);

  useEffect(() => {
    if (activeGoalId) {
      fetchAnalytics(activeGoalId);
    }
  }, [activeGoalId]);

  const activeGoal = goals.find(g => g.id === activeGoalId);
  const goalAnalytics = activeGoal ? analytics[activeGoal.id] : null;

  const renderGoalSelector = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
      {goals.map(goal => (
        <TouchableOpacity
          key={goal.id}
          onPress={() => setActiveGoalId(goal.id)}
          className={`px-4 py-2 mr-3 rounded-full border ${activeGoalId === goal.id ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-gray-300 dark:border-gray-700'}`}
        >
          <Text className={`font-medium ${activeGoalId === goal.id ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
            {goal.title}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        onPress={() => navigation.navigate('CreateGoal')}
        className="px-4 py-2 rounded-full border border-dashed border-gray-400 flex-row items-center"
      >
        <Ionicons name="add" size={16} color="#9ca3af" />
        <Text className="text-gray-500 ml-1">New Goal</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 px-6 pt-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-3xl font-bold text-gray-900 dark:text-white">Goals</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateGoal')}>
          <Ionicons name="add-circle" size={32} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {loading && goals.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : goals.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="trophy-outline" size={64} color="#9ca3af" />
          <Text className="text-xl font-bold text-gray-900 dark:text-white mt-4">No Goals Yet</Text>
          <Text className="text-gray-500 text-center mt-2 mb-6">
            Create your first life goal to get a personalized AI roadmap.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateGoal')}
            className="bg-blue-500 px-6 py-3 rounded-xl shadow-sm shadow-blue-500/30"
          >
            <Text className="text-white font-bold text-base">Create Goal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderGoalSelector()}

          {activeGoal && (
            <TouchableOpacity 
              activeOpacity={0.9}
              onPress={() => navigation.navigate('GoalDetails', { goalId: activeGoal.id })}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm shadow-gray-200 dark:shadow-none mb-6 border border-gray-100 dark:border-gray-800"
            >
              <View className="flex-row justify-between items-start mb-6">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-blue-500 mb-1">{activeGoal.category}</Text>
                  <Text className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                    {activeGoal.title}
                  </Text>
                </View>
                <View className="ml-4">
                   <ProgressRing progress={goalAnalytics?.progress_percentage || 0} radius={40} strokeWidth={8} />
                </View>
              </View>

              <View className="flex-row justify-between bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl">
                <View>
                  <Text className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Status</Text>
                  <Text className="text-base font-semibold text-gray-800 dark:text-gray-200 capitalize">
                    {activeGoal.status}
                  </Text>
                </View>
                <View className="w-px bg-gray-200 dark:bg-gray-600" />
                <View>
                  <Text className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Target Date</Text>
                  <Text className="text-base font-semibold text-gray-800 dark:text-gray-200">
                    {activeGoal.target_date || 'N/A'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* We'll load a simplified task view for today below the card in future iteration */}
          {activeGoal && (
             <View className="mt-2 mb-8 items-center">
                <Text className="text-gray-500 text-sm">Tap the goal card above to view full Roadmap & Tasks</Text>
             </View>
          )}

        </ScrollView>
      )}
    </SafeAreaView>
  );
}
