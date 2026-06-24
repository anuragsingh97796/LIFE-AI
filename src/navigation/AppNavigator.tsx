import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/useAuthStore';
import AuthNavigator from './AuthNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { session, profile, restoringSession, restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, []);

  if (restoringSession) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <View className="w-16 h-16 bg-primary rounded-2xl items-center justify-center mb-6 shadow-lg shadow-primary/30">
          <Text className="text-white text-3xl font-extrabold">L</Text>
        </View>
        <ActivityIndicator color="#0EA5E9" size="large" />
        <Text className="text-text-secondary text-sm mt-4 font-semibold">
          Restoring your session...
        </Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session === null ? (
        // Auth Flow
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : profile === null || !profile.onboarded ? (
        // Onboarding Flow
        <Stack.Screen name="OnboardingFlow" component={OnboardingNavigator} />
      ) : (
        // Protected App Dashboard
        <Stack.Screen name="Main" component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  );
}
