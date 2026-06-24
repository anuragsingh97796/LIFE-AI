import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { GoalStackParamList } from '../../navigation/GoalStackNavigator';
import { useGoalStore } from '../../store/useGoalStore';
import { RoadmapGenerationService } from '../../services/RoadmapGenerationService';

type NavigationProp = NativeStackNavigationProp<GoalStackParamList, 'CreateGoal'>;

const CATEGORIES = ['Career', 'Health', 'Business', 'Learning', 'Finance', 'Productivity', 'Relationships'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export default function CreateGoalScreen() {
  const navigation = useNavigation<NavigationProp>();
  const addGoal = useGoalStore(state => state.addGoal);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Career');
  const [priority, setPriority] = useState('Medium');
  // Simple date state for now (mocking target date picker for simplicity in this milestone)
  const [targetDate, setTargetDate] = useState(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  const handleNext = () => {
    if (step === 1 && !title.trim()) {
      Alert.alert('Required', 'Please enter a goal name');
      return;
    }
    setStep(prev => Math.min(prev + 1, 6));
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      // 1. Create Goal
      const goal = await addGoal({
        title,
        description,
        category,
        priority,
        target_date: targetDate,
        status: 'active'
      });

      // 2. Generate Roadmap via AI
      await RoadmapGenerationService.generateRoadmap({
        goalId: goal.id,
        goalTitle: title,
        category,
        targetDate
      });

      Alert.alert('Success', 'Goal and Roadmap created!', [
        { text: 'View Dashboard', onPress: () => navigation.navigate('GoalDashboard') }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View className="flex-row items-center justify-between px-6 py-4">
      <TouchableOpacity onPress={handleBack} disabled={loading}>
        <Ionicons name="arrow-back" size={24} color="#3b82f6" />
      </TouchableOpacity>
      <Text className="text-gray-500 font-medium">Step {step} of 6</Text>
      <View className="w-6" /> 
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {renderStepIndicator()}
      
      <ScrollView className="flex-1 px-6 pt-4">
        {step === 1 && (
          <View className="flex-1 justify-center animate-fade-in">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">What's your goal?</Text>
            <Text className="text-base text-gray-500 mb-8">Examples: Become AI Engineer, Learn English, Lose 10kg</Text>
            
            <TextInput
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-lg text-gray-900 dark:text-white"
              placeholder="Enter your goal..."
              placeholderTextColor="#9ca3af"
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
          </View>
        )}

        {step === 2 && (
          <View className="flex-1 justify-center animate-fade-in">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Describe it</Text>
            <Text className="text-base text-gray-500 mb-8">Why is this important to you?</Text>
            
            <TextInput
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-lg text-gray-900 dark:text-white h-40"
              placeholder="My motivation is..."
              placeholderTextColor="#9ca3af"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>
        )}

        {step === 3 && (
          <View className="flex-1 justify-center animate-fade-in">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Select a Category</Text>
            
            <View className="flex-row flex-wrap gap-3">
              {CATEGORIES.map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCategory(c)}
                  className={`px-4 py-3 rounded-xl border ${category === c ? 'bg-blue-500 border-blue-500' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                >
                  <Text className={`font-semibold ${category === c ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 4 && (
          <View className="flex-1 justify-center animate-fade-in">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Priority Level</Text>
            
            <View className="space-y-3">
              {PRIORITIES.map(p => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPriority(p)}
                  className={`p-4 rounded-xl border flex-row items-center justify-between ${priority === p ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/30' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                >
                  <Text className={`font-semibold text-lg ${priority === p ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>{p}</Text>
                  {priority === p && <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 5 && (
          <View className="flex-1 justify-center animate-fade-in">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Target Date</Text>
            <Text className="text-base text-gray-500 mb-8">When do you want to achieve this?</Text>
            
            <TextInput
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-lg text-gray-900 dark:text-white"
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9ca3af"
              value={targetDate}
              onChangeText={setTargetDate}
            />
          </View>
        )}

        {step === 6 && (
          <View className="flex-1 justify-center animate-fade-in">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Review & Generate</Text>
            
            <View className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 space-y-4">
              <View>
                <Text className="text-sm text-gray-500 mb-1">Goal</Text>
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">{title}</Text>
              </View>
              <View>
                <Text className="text-sm text-gray-500 mb-1">Category & Priority</Text>
                <Text className="text-base text-gray-800 dark:text-gray-200">{category} • {priority}</Text>
              </View>
              <View>
                <Text className="text-sm text-gray-500 mb-1">Target Date</Text>
                <Text className="text-base text-gray-800 dark:text-gray-200">{targetDate}</Text>
              </View>
            </View>
            
            <Text className="text-center text-sm text-gray-500 mt-8 px-4">
              Our AI will now generate a personalized roadmap, milestones, and daily tasks for your goal.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Area */}
      <View className="px-6 pb-8 pt-4">
        {step < 6 ? (
          <TouchableOpacity
            onPress={handleNext}
            className="bg-blue-500 py-4 rounded-xl items-center shadow-sm shadow-blue-500/30"
          >
            <Text className="text-white font-bold text-lg">Continue</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleCreate}
            disabled={loading}
            className={`py-4 rounded-xl items-center flex-row justify-center ${loading ? 'bg-blue-400' : 'bg-blue-500 shadow-sm shadow-blue-500/30'}`}
          >
            {loading ? (
              <>
                <ActivityIndicator color="white" className="mr-2" />
                <Text className="text-white font-bold text-lg">Generating Roadmap...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="white" className="mr-2" />
                <Text className="text-white font-bold text-lg">Create Goal</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
