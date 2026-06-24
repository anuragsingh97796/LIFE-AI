import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading, error, clearError } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }
    setLocalError(null);
    clearError();
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      // Error handled by store
    }
  };

  const navigateToSignUp = () => {
    clearError();
    setLocalError(null);
    navigation.navigate('Signup');
  };

  const navigateToForgotPassword = () => {
    clearError();
    setLocalError(null);
    navigation.navigate('ForgotPassword');
  };

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 justify-center">
        <View className="items-center mb-10">
          {/* Logo Placeholder */}
          <View className="w-16 h-16 bg-primary rounded-2xl items-center justify-center mb-4 shadow-lg shadow-primary/30">
            <Text className="text-white text-3xl font-extrabold">L</Text>
          </View>
          <Text className="text-text text-3xl font-bold tracking-tight">LifeOS AI</Text>
          <Text className="text-text-secondary text-sm mt-2 text-center">
            Your AI-powered Life Operating System.
          </Text>
        </View>

        <View className="space-y-4">
          <Text className="text-text font-semibold text-lg mb-2">Sign In</Text>

          {displayError && (
            <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
              <Text className="text-red-400 text-xs text-center">{displayError}</Text>
            </View>
          )}

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-text-secondary text-xs font-semibold mb-2 uppercase tracking-wider">
              Email Address
            </Text>
            <TextInput
              className="bg-card border border-border rounded-xl px-4 py-3.5 text-text text-sm focus:border-primary"
              placeholder="Enter your email"
              placeholderTextColor="#64748B"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password Input */}
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                Password
              </Text>
              <TouchableOpacity onPress={navigateToForgotPassword}>
                <Text className="text-primary text-xs font-semibold">Forgot?</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              className="bg-card border border-border rounded-xl px-4 py-3.5 text-text text-sm focus:border-primary"
              placeholder="Enter your password"
              placeholderTextColor="#64748B"
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className="bg-primary rounded-xl py-4 items-center justify-center mt-6 shadow-lg shadow-primary/20"
            disabled={loading}
            onPress={handleLogin}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text className="text-white text-base font-bold">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-8">
          <Text className="text-text-secondary text-sm">Don't have an account? </Text>
          <TouchableOpacity onPress={navigateToSignUp}>
            <Text className="text-primary text-sm font-bold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
