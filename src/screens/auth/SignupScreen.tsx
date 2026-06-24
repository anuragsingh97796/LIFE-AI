import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp, loading, error, clearError } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }
    setLocalError(null);
    clearError();
    try {
      await signUp(email.trim(), password, name.trim());
    } catch (err) {
      // Error handled by store
    }
  };

  const navigateToLogin = () => {
    clearError();
    setLocalError(null);
    navigation.navigate('Login');
  };

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 justify-center">
        <View className="items-center mb-10">
          <View className="w-16 h-16 bg-primary rounded-2xl items-center justify-center mb-4 shadow-lg shadow-primary/30">
            <Text className="text-white text-3xl font-extrabold">L</Text>
          </View>
          <Text className="text-text text-3xl font-bold tracking-tight">Create Account</Text>
          <Text className="text-text-secondary text-sm mt-2 text-center">
            Start your personal growth journey today.
          </Text>
        </View>

        <View className="space-y-4">
          {displayError && (
            <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
              <Text className="text-red-400 text-xs text-center">{displayError}</Text>
            </View>
          )}

          {/* Full Name Input */}
          <View className="mb-4">
            <Text className="text-text-secondary text-xs font-semibold mb-2 uppercase tracking-wider">
              Full Name
            </Text>
            <TextInput
              className="bg-card border border-border rounded-xl px-4 py-3.5 text-text text-sm focus:border-primary"
              placeholder="Enter your name"
              placeholderTextColor="#64748B"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
          </View>

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
            <Text className="text-text-secondary text-xs font-semibold mb-2 uppercase tracking-wider">
              Password
            </Text>
            <TextInput
              className="bg-card border border-border rounded-xl px-4 py-3.5 text-text text-sm focus:border-primary"
              placeholder="Min. 6 characters"
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
            onPress={handleSignUp}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text className="text-white text-base font-bold">Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-8">
          <Text className="text-text-secondary text-sm">Already have an account? </Text>
          <TouchableOpacity onPress={navigateToLogin}>
            <Text className="text-primary text-sm font-bold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
