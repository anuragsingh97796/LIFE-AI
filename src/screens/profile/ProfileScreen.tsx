import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, profile, preferences, signOut, updateLanguage } = useAuthStore();

  const handleLogout = async () => {
    await signOut();
  };

  const changeLanguage = (lang: string) => {
    updateLanguage(lang);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View className="mb-6">
          <Text className="text-text-secondary text-xs font-semibold uppercase tracking-widest">
            Identity
          </Text>
          <Text className="text-text text-2xl font-bold mt-1">My Profile</Text>
        </View>

        {/* PROFILE CARD */}
        <View className="bg-card border border-border rounded-3xl p-5 items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 items-center justify-center mb-4">
            <Ionicons name="person" size={42} color="#0EA5E9" />
          </View>
          <Text className="text-text font-bold text-xl">{profile?.name || 'Explorer'}</Text>
          <Text className="text-text-secondary text-sm mt-1">{profile?.occupation || 'Strategic Thinker'}</Text>
          <Text className="text-text-muted text-xs mt-1">{user?.email}</Text>
        </View>

        {/* DETAILS SECTION */}
        <View className="bg-card border border-border rounded-3xl p-5 mb-6 space-y-4">
          <Text className="text-text font-bold text-base mb-2">Profile Details</Text>
          
          <View className="flex-row justify-between items-center border-b border-border/50 pb-3 mb-3">
            <Text className="text-text-secondary text-sm">Age</Text>
            <Text className="text-text font-semibold text-sm">{profile?.age || '--'} years</Text>
          </View>

          <View className="flex-row justify-between items-center border-b border-border/50 pb-3 mb-3">
            <Text className="text-text-secondary text-sm">Occupation</Text>
            <Text className="text-text font-semibold text-sm">{profile?.occupation || '--'}</Text>
          </View>

          <View className="flex-row justify-between items-center pb-1">
            <Text className="text-text-secondary text-sm">Daily Commited Time</Text>
            <Text className="text-text font-semibold text-sm">{preferences?.available_hours || 2} hours</Text>
          </View>
        </View>

        {/* SETTINGS SECTION */}
        <View className="bg-card border border-border rounded-3xl p-5 mb-6 space-y-4">
          <Text className="text-text font-bold text-base mb-4">Preferences</Text>

          <View className="mb-2">
            <Text className="text-text-secondary text-xs font-bold uppercase mb-2">App Language</Text>
            <View className="flex-row justify-between">
              {['English', 'Spanish', 'Hindi'].map((lang) => {
                const isSelected = preferences?.preferred_language === lang;
                return (
                  <TouchableOpacity
                    key={lang}
                    className={`px-4 py-2 border rounded-xl ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onPress={() => changeLanguage(lang)}
                  >
                    <Text className={`text-xs font-semibold ${isSelected ? 'text-primary' : 'text-text'}`}>
                      {lang}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* SYSTEM INFORMATION */}
        <View className="bg-card border border-border rounded-3xl p-5 mb-6">
          <Text className="text-text font-bold text-base mb-3">Connection Details</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-text-secondary text-xs">Supabase Status</Text>
            <View className="flex-row items-center">
              <View className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2" />
              <Text className="text-emerald-400 text-xs font-bold">Connected</Text>
            </View>
          </View>
        </View>

        {/* ACTIONS */}
        <TouchableOpacity
          className="bg-red-500/10 border border-red-500/20 rounded-2xl py-4 items-center justify-center mb-10 flex-row space-x-2"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text className="text-red-500 font-bold ml-1.5">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
