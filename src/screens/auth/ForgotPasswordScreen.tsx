import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const { resetPassword, loading, error, clearError } = useAuthStore();
  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleReset = async () => {
    if (!email) {
      setLocalError('Please enter your email address');
      return;
    }
    setLocalError(null);
    clearError();
    try {
      await resetPassword(email.trim());
      setSuccess(true);
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
          <Text className="text-text text-3xl font-bold tracking-tight">Reset Password</Text>
          <Text className="text-text-secondary text-sm mt-2 text-center">
            Enter your email to receive a password reset link.
          </Text>
        </View>

        {success ? (
          <View className="bg-primary/10 border border-primary/20 rounded-2xl p-6 items-center">
            <Text className="text-primary text-lg font-bold mb-2">Check Your Email</Text>
            <Text className="text-text-secondary text-sm text-center mb-6">
              We have sent a password reset link to {email}. Follow the instructions to create a new password.
            </Text>
            <TouchableOpacity
              className="bg-primary rounded-xl py-3 px-6 w-full items-center"
              onPress={navigateToLogin}
            >
              <Text className="text-white font-bold text-sm">Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-4">
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
                placeholder="Enter your registered email"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className="bg-primary rounded-xl py-4 items-center justify-center mt-6 shadow-lg shadow-primary/20"
              disabled={loading}
              onPress={handleReset}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-white text-base font-bold">Send Reset Link</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity className="items-center mt-6" onPress={navigateToLogin}>
              <Text className="text-text-secondary text-sm font-semibold">
                Back to <Text className="text-primary font-bold">Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
