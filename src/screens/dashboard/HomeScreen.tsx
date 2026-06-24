import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useGoalStore } from '../../store/useGoalStore';
import { useProgressStore } from '../../store/useProgressStore';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/types';
import { useNavigation } from '@react-navigation/native';

type NavigationProp = BottomTabNavigationProp<MainTabParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAuthStore();
  const { goals, fetchGoals } = useGoalStore();
  const { todayProgress, fetchProgress, incrementTodayTasks } = useProgressStore();

  useEffect(() => {
    fetchGoals();
    fetchProgress();
  }, []);

  const name = profile?.name || 'Explorer';
  const completed = todayProgress?.completed_tasks ?? 0;
  const total = todayProgress?.total_tasks ?? 4;
  const lifeScore = todayProgress?.life_score ?? 50;
  const streak = todayProgress?.streak_count ?? 0;

  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const activeGoals = goals.filter((g) => g.status === 'active');

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View className="flex-row justify-between items-center mb-6 mt-2">
          <View>
            <Text className="text-text-secondary text-xs font-semibold uppercase tracking-widest">
              Life Dashboard
            </Text>
            <Text className="text-text text-2xl font-bold mt-1">Hello, {name} 👋</Text>
          </View>
          <TouchableOpacity 
            className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center"
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-outline" size={20} color="#F8FAFC" />
          </TouchableOpacity>
        </View>

        {/* PROGRESS & STREAK SECTION */}
        <View className="flex-row justify-between mb-5">
          {/* Circular Progress Representation */}
          <View className="w-[62%] bg-card border border-border rounded-3xl p-5 justify-between">
            <View className="flex-row items-center space-x-2">
              <Ionicons name="checkbox-outline" size={18} color="#0EA5E9" />
              <Text className="text-text font-bold text-sm ml-1.5">Daily Tasks</Text>
            </View>
            <View className="my-4 flex-row items-baseline">
              <Text className="text-text text-4xl font-extrabold">{completed}</Text>
              <Text className="text-text-secondary text-base">/{total}</Text>
            </View>
            {/* Progress bar */}
            <View className="w-full bg-border h-2 rounded-full overflow-hidden">
              <View 
                className="bg-primary h-full rounded-full" 
                style={{ width: `${progressPercent}%` }}
              />
            </View>
            <View className="flex-row justify-between items-center mt-3">
              <Text className="text-text-secondary text-xs">{progressPercent}% done today</Text>
              {completed < total && (
                <TouchableOpacity 
                  className="bg-primary/10 px-2.5 py-1.5 rounded-lg border border-primary/20"
                  onPress={incrementTodayTasks}
                >
                  <Text className="text-primary text-[10px] font-bold">+ Complete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Streak Card */}
          <View className="w-[34%] bg-card border border-border rounded-3xl p-5 items-center justify-center">
            <View className="w-12 h-12 bg-amber-500/10 rounded-full items-center justify-center mb-3">
              <Ionicons name="flame" size={26} color="#F59E0B" />
            </View>
            <Text className="text-text-secondary text-xs font-semibold">Streak</Text>
            <Text className="text-text text-3xl font-extrabold mt-1">{streak}</Text>
            <Text className="text-text-secondary text-[10px] mt-1">Days Active</Text>
          </View>
        </View>

        {/* LIFE SCORE PLACEHOLDER */}
        <View className="bg-card border border-border rounded-3xl p-6 mb-5">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <Ionicons name="analytics" size={18} color="#10B981" />
              <Text className="text-text font-bold text-sm ml-2">Life Score Index</Text>
            </View>
            <View className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              <Text className="text-emerald-400 text-[10px] font-bold">Good</Text>
            </View>
          </View>
          
          <View className="flex-row items-center justify-between my-2">
            <Text className="text-text text-3xl font-extrabold">{lifeScore}</Text>
            <Text className="text-text-secondary text-xs max-w-[70%] text-right">
              Reflects goal consistency, habit streaks, and hours logged.
            </Text>
          </View>

          {/* Score Slider gauge */}
          <View className="w-full bg-border h-2 rounded-full mt-2 relative">
            <View 
              className="bg-emerald-500 h-full rounded-full" 
              style={{ width: `${lifeScore}%` }}
            />
            {/* Indicator handle */}
            <View 
              className="absolute w-3.5 h-3.5 bg-emerald-400 border border-background rounded-full -top-[3px]"
              style={{ left: `${lifeScore}%`, marginLeft: -6 }}
            />
          </View>
        </View>

        {/* ACTIVE GOALS SUMMARY */}
        <View className="bg-card border border-border rounded-3xl p-5 mb-5">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <Ionicons name="trophy-outline" size={18} color="#A855F7" />
              <Text className="text-text font-bold text-sm ml-2">Active Goals ({activeGoals.length})</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Goals')}>
              <Text className="text-primary text-xs font-bold">Manage</Text>
            </TouchableOpacity>
          </View>

          {activeGoals.length === 0 ? (
            <View className="py-4 items-center">
              <Text className="text-text-secondary text-sm">No active goals found.</Text>
              <TouchableOpacity 
                className="mt-2.5 bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl"
                onPress={() => navigation.navigate('Goals')}
              >
                <Text className="text-primary text-xs font-bold">+ Create Goal</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="space-y-3">
              {activeGoals.slice(0, 2).map((goal) => (
                <View key={goal.id} className="flex-row items-center justify-between border-b border-border/50 pb-2.5 mb-2.5">
                  <View className="flex-1 pr-3">
                    <Text className="text-text font-semibold text-sm" numberOfLines={1}>
                      {goal.title}
                    </Text>
                    {goal.category && (
                      <View className="flex-row mt-1">
                        <View className="bg-primary/10 border border-primary/10 px-1.5 py-0.5 rounded">
                          <Text className="text-primary text-[9px] font-bold uppercase">{goal.category}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#64748B" />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* AI COACH Guidance Card */}
        <TouchableOpacity 
          className="bg-primary border border-primary-light rounded-3xl p-6 mb-8 flex-row items-center justify-between shadow-lg shadow-primary/20"
          onPress={() => navigation.navigate('AICoach')}
        >
          <View className="flex-1 pr-4">
            <View className="flex-row items-center space-x-1.5 bg-white/10 self-start px-2 py-1 rounded-full mb-3">
              <Ionicons name="sparkles" size={10} color="#FFFFFF" />
              <Text className="text-white text-[9px] font-extrabold uppercase ml-1">AI STRATEGIST</Text>
            </View>
            <Text className="text-white text-lg font-bold">Ask AI Coach</Text>
            <Text className="text-white/80 text-xs mt-1">
              "Let's review your timeline and adjust available hours for {activeGoals[0]?.title || 'your goals'} today."
            </Text>
          </View>
          <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center">
            <Ionicons name="chatbubbles" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
