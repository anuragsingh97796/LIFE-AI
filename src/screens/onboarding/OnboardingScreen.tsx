import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { OnboardingStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Onboarding'>;

const GOAL_OPTIONS = [
  { id: 'Get AI Job', label: '🤖 Get AI Job', desc: 'Accelerate your career in AI' },
  { id: 'Lose Weight', label: '💪 Lose Weight', desc: 'Improve health and fitness' },
  { id: 'Learn English', label: '🗣️ Learn English', desc: 'Master communication' },
  { id: 'Start Business', label: '🚀 Start Business', desc: 'Launch your own venture' },
  { id: 'Crack Exam', label: '📚 Crack Exam', desc: 'Ace your academics' },
];

const LANGUAGE_OPTIONS = [
  { id: 'English', label: '🇺🇸 English' },
  { id: 'Spanish', label: '🇪🇸 Español' },
  { id: 'Hindi', label: '🇮🇳 हिन्दी' },
  { id: 'French', label: '🇫🇷 Français' },
  { id: 'German', label: '🇩🇪 Deutsch' },
];

export default function OnboardingScreen({ navigation }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [occupation, setOccupation] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [preferredLanguage, setPreferredLanguage] = useState('English');

  const { completeOnboarding, loading, error } = useAuthStore();

  const handleNext = async () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      try {
        await completeOnboarding(
          name.trim(),
          parseInt(age) || 20,
          occupation.trim(),
          primaryGoal,
          hoursPerDay,
          preferredLanguage
        );
      } catch (err) {
        console.error('Onboarding failed:', err);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return name.trim().length > 0;
      case 2:
        return age.trim().length > 0 && !isNaN(Number(age)) && Number(age) > 0;
      case 3:
        return occupation.trim().length > 0;
      case 4:
        return primaryGoal !== '';
      case 5:
        return hoursPerDay > 0 && hoursPerDay <= 24;
      case 6:
        return preferredLanguage !== '';
      default:
        return false;
    }
  };

  const renderProgressBar = () => {
    return (
      <View className="flex-row items-center justify-between mb-8 px-2">
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <View
            key={s}
            className={`h-1.5 flex-1 mx-1 rounded-full ${
              s <= step ? 'bg-primary' : 'bg-border'
            }`}
          />
        ))}
      </View>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View className="space-y-4">
            <Text className="text-text-secondary text-sm font-bold uppercase tracking-wider">Step 1 of 6</Text>
            <Text className="text-text text-2xl font-bold mb-4">What should we call you?</Text>
            <Text className="text-text-secondary text-sm mb-6">Your name will be used by your AI Coach to address you.</Text>
            <TextInput
              className="bg-card border border-border rounded-xl px-4 py-4 text-text text-base focus:border-primary"
              placeholder="Enter your name"
              placeholderTextColor="#64748B"
              autoFocus
              value={name}
              onChangeText={setName}
            />
          </View>
        );

      case 2:
        return (
          <View className="space-y-4">
            <Text className="text-text-secondary text-sm font-bold uppercase tracking-wider">Step 2 of 6</Text>
            <Text className="text-text text-2xl font-bold mb-4">How old are you?</Text>
            <Text className="text-text-secondary text-sm mb-6">Age helps the AI Coach tailor health and life recommendations.</Text>
            <TextInput
              className="bg-card border border-border rounded-xl px-4 py-4 text-text text-base focus:border-primary"
              placeholder="Enter your age"
              placeholderTextColor="#64748B"
              keyboardType="number-pad"
              autoFocus
              value={age}
              onChangeText={setAge}
            />
          </View>
        );

      case 3:
        return (
          <View className="space-y-4">
            <Text className="text-text-secondary text-sm font-bold uppercase tracking-wider">Step 3 of 6</Text>
            <Text className="text-text text-2xl font-bold mb-4">What is your occupation?</Text>
            <Text className="text-text-secondary text-sm mb-6">Occupation sets context for your career and productivity hacks.</Text>
            <TextInput
              className="bg-card border border-border rounded-xl px-4 py-4 text-text text-base focus:border-primary"
              placeholder="e.g. Student, Engineer, Designer"
              placeholderTextColor="#64748B"
              autoFocus
              value={occupation}
              onChangeText={setOccupation}
            />
          </View>
        );

      case 4:
        return (
          <View className="space-y-4">
            <Text className="text-text-secondary text-sm font-bold uppercase tracking-wider">Step 4 of 6</Text>
            <Text className="text-text text-2xl font-bold mb-2">What is your primary goal?</Text>
            <Text className="text-text-secondary text-sm mb-6">Select the main goal you want the AI Coach to build a roadmap for.</Text>
            <ScrollView className="max-h-96 space-y-3">
              {GOAL_OPTIONS.map((g) => {
                const isSelected = primaryGoal === g.id;
                return (
                  <TouchableOpacity
                    key={g.id}
                    className={`bg-card border rounded-2xl p-4 flex-row items-center justify-between mb-3 ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onPress={() => setPrimaryGoal(g.id)}
                  >
                    <View className="flex-1">
                      <Text className={`text-base font-bold ${isSelected ? 'text-primary' : 'text-text'}`}>
                        {g.label}
                      </Text>
                      <Text className="text-text-secondary text-xs mt-1">{g.desc}</Text>
                    </View>
                    {isSelected && (
                      <View className="w-5 h-5 rounded-full bg-primary items-center justify-center">
                        <Text className="text-white text-xs font-bold">✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        );

      case 5:
        return (
          <View className="space-y-4">
            <Text className="text-text-secondary text-sm font-bold uppercase tracking-wider">Step 5 of 6</Text>
            <Text className="text-text text-2xl font-bold mb-4">Available hours per day?</Text>
            <Text className="text-text-secondary text-sm mb-6">How much time can you commit to your goals daily?</Text>
            
            {/* Custom Hours Selector */}
            <View className="flex-row flex-wrap justify-between">
              {[1, 2, 3, 4, 5, 6, 8, 10].map((hours) => {
                const isSelected = hoursPerDay === hours;
                return (
                  <TouchableOpacity
                    key={hours}
                    className={`w-[22%] bg-card border rounded-xl py-4 items-center mb-4 ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onPress={() => setHoursPerDay(hours)}
                  >
                    <Text className={`text-xl font-bold ${isSelected ? 'text-primary' : 'text-text'}`}>
                      {hours}
                    </Text>
                    <Text className="text-text-secondary text-[10px] uppercase mt-1 font-semibold">
                      {hours === 1 ? 'Hr' : 'Hrs'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 6:
        return (
          <View className="space-y-4">
            <Text className="text-text-secondary text-sm font-bold uppercase tracking-wider">Step 6 of 6</Text>
            <Text className="text-text text-2xl font-bold mb-2">Preferred language?</Text>
            <Text className="text-text-secondary text-sm mb-6">Your AI Coach will interact and formulate roadmaps in this language.</Text>
            <View className="space-y-3">
              {LANGUAGE_OPTIONS.map((lang) => {
                const isSelected = preferredLanguage === lang.id;
                return (
                  <TouchableOpacity
                    key={lang.id}
                    className={`bg-card border rounded-xl p-4 flex-row items-center justify-between mb-2 ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onPress={() => setPreferredLanguage(lang.id)}
                  >
                    <Text className={`text-base font-semibold ${isSelected ? 'text-primary' : 'text-text'}`}>
                      {lang.label}
                    </Text>
                    {isSelected && (
                      <View className="w-5 h-5 rounded-full bg-primary items-center justify-center">
                        <Text className="text-white text-xs font-bold">✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-12 justify-between">
        <View>
          {renderProgressBar()}
          
          {error && (
            <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6">
              <Text className="text-red-400 text-xs text-center">{error}</Text>
            </View>
          )}

          {renderStepContent()}
        </View>

        <View className="flex-row justify-between items-center mt-10">
          {step > 1 ? (
            <TouchableOpacity
              className="bg-card border border-border rounded-xl py-4 px-6"
              onPress={handleBack}
            >
              <Text className="text-text-secondary font-bold">Back</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}

          <TouchableOpacity
            className={`rounded-xl py-4 px-8 items-center justify-center shadow-lg ${
              isStepValid() ? 'bg-primary shadow-primary/20' : 'bg-card opacity-50 border border-border'
            }`}
            disabled={!isStepValid() || loading}
            onPress={handleNext}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text className="text-white font-bold">
                {step === 6 ? 'Complete Setup' : 'Continue'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
