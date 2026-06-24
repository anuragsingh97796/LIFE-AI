import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GoalDashboardScreen from '../screens/goals/GoalDashboardScreen';
import GoalDetailsScreen from '../screens/goals/GoalDetailsScreen';
import CreateGoalScreen from '../screens/goals/CreateGoalScreen';

export type GoalStackParamList = {
  GoalDashboard: undefined;
  GoalDetails: { goalId: string };
  CreateGoal: undefined;
};

const Stack = createNativeStackNavigator<GoalStackParamList>();

export default function GoalStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GoalDashboard" component={GoalDashboardScreen} />
      <Stack.Screen name="GoalDetails" component={GoalDetailsScreen} />
      <Stack.Screen name="CreateGoal" component={CreateGoalScreen} />
    </Stack.Navigator>
  );
}
