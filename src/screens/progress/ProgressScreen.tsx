import React, { useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useProgressStore } from '../../store/useProgressStore';
import { useGoalStore } from '../../store/useGoalStore';
import { Ionicons } from '@expo/vector-icons';

export default function ProgressScreen() {
  const { progressHistory, loading, error, fetchProgress } = useProgressStore();
  const { goals } = useGoalStore();

  useEffect(() => {
    fetchProgress();
  }, []);

  const totalCompletedTasks = progressHistory.reduce((sum, item) => sum + item.completed_tasks, 0);
  const averageLifeScore = progressHistory.length > 0 
    ? Math.round(progressHistory.reduce((sum, item) => sum + item.life_score, 0) / progressHistory.length) 
    : 0;
  const activeGoalsCount = goals.filter((g) => g.status === 'active').length;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View className="mb-6">
          <Text className="text-text-secondary text-xs font-semibold uppercase tracking-widest">
            Analytics
          </Text>
          <Text className="text-text text-2xl font-bold mt-1">My Progress</Text>
        </View>

        {/* METRICS GRID */}
        <View className="flex-row flex-wrap justify-between mb-6">
          {/* STAT 1 */}
          <View className="w-[48%] bg-card border border-border rounded-2xl p-4 mb-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-text-secondary text-xs font-bold uppercase">Tasks Done</Text>
              <Ionicons name="checkmark-circle-outline" size={16} color="#0EA5E9" />
            </View>
            <Text className="text-text text-2xl font-extrabold">{totalCompletedTasks}</Text>
            <Text className="text-text-muted text-[10px] mt-1">Lifetime total</Text>
          </View>

          {/* STAT 2 */}
          <View className="w-[48%] bg-card border border-border rounded-2xl p-4 mb-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-text-secondary text-xs font-bold uppercase">Life Score</Text>
              <Ionicons name="analytics" size={16} color="#10B981" />
            </View>
            <Text className="text-text text-2xl font-extrabold">{averageLifeScore}</Text>
            <Text className="text-text-muted text-[10px] mt-1">Average rating</Text>
          </View>

          {/* STAT 3 */}
          <View className="w-[48%] bg-card border border-border rounded-2xl p-4 mb-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-text-secondary text-xs font-bold uppercase">Active Goals</Text>
              <Ionicons name="trophy-outline" size={16} color="#A855F7" />
            </View>
            <Text className="text-text text-2xl font-extrabold">{activeGoalsCount}</Text>
            <Text className="text-text-muted text-[10px] mt-1">Ongoing initiatives</Text>
          </View>

          {/* STAT 4 */}
          <View className="w-[48%] bg-card border border-border rounded-2xl p-4 mb-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-text-secondary text-xs font-bold uppercase">Active Days</Text>
              <Ionicons name="flame" size={16} color="#F59E0B" />
            </View>
            <Text className="text-text text-2xl font-extrabold">{progressHistory.length}</Text>
            <Text className="text-text-muted text-[10px] mt-1">Days tracked</Text>
          </View>
        </View>

        {/* LOG HISTORY */}
        <View className="mb-8">
          <Text className="text-text font-bold text-lg mb-4">Daily Logs</Text>

          {loading && progressHistory.length === 0 ? (
            <ActivityIndicator color="#0EA5E9" size="large" className="my-10" />
          ) : progressHistory.length === 0 ? (
            <View className="bg-card border border-border rounded-2xl p-6 items-center py-10">
              <Ionicons name="calendar-outline" size={32} color="#64748B" />
              <Text className="text-text-secondary text-sm mt-3">No activity logs recorded yet</Text>
            </View>
          ) : (
            <View className="space-y-4">
              {progressHistory.map((item) => {
                const ratio = item.total_tasks > 0 ? item.completed_tasks / item.total_tasks : 0;
                const percentage = Math.round(ratio * 100);

                return (
                  <View
                    key={item.id}
                    className="bg-card border border-border rounded-2xl p-4 flex-row items-center justify-between mb-3"
                  >
                    <View className="flex-1 pr-4">
                      <Text className="text-text font-bold text-sm">{item.date}</Text>
                      <View className="flex-row mt-2 space-x-4">
                        <View className="flex-row items-center">
                          <Ionicons name="checkbox-outline" size={12} color="#0EA5E9" />
                          <Text className="text-text-muted text-xs ml-1">
                            {item.completed_tasks}/{item.total_tasks} Tasks
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Ionicons name="analytics" size={12} color="#10B981" />
                          <Text className="text-text-muted text-xs ml-1">Score: {item.life_score}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Progress Percentage Badge */}
                    <View className="bg-primary/10 border border-primary/20 px-3 py-2 rounded-xl">
                      <Text className="text-primary font-bold text-sm">{percentage}%</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
