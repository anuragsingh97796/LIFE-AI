import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useGoalStore } from '../../store/useGoalStore';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: Date;
}

export default function AICoachScreen() {
  const { profile, preferences } = useAuthStore();
  const { goals } = useGoalStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const name = profile?.name || 'Explorer';
  const hours = preferences?.available_hours || 2;
  const primaryGoalObj = goals.find((g) => g.category === 'Primary') || goals[0];
  const primaryGoal = primaryGoalObj?.title || 'personal growth';

  useEffect(() => {
    // Load initial welcome message from AI Coach
    const welcomeText = `Hello ${name}! As your AI Strategist, I've analyzed your profile. You're aiming to "${primaryGoal}" and have committed ${hours} hours per day. That's a solid commitment.\n\nTo hit this goal, we should break it down into daily habits. How has your progress been today?`;
    
    setMessages([
      {
        id: 'welcome',
        sender: 'coach',
        text: welcomeText,
        timestamp: new Date(),
      },
    ]);
  }, [profile, preferences, goals]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Mock AI Coach replies dynamically
    setTimeout(() => {
      let replyText = `Thanks for sharing. Focusing on "${primaryGoal}" requires consistency. Let's make sure you block out your ${hours} hours today. I will update your progress card to keep your streak alive!`;
      
      if (inputText.toLowerCase().includes('hard') || inputText.toLowerCase().includes('struggle')) {
        replyText = `I hear you, ${name}. Goal tracking can have friction. Let's reduce your available hours to a smaller fraction for today and build momentum. What's one micro-step you can take right now?`;
      } else if (inputText.toLowerCase().includes('done') || inputText.toLowerCase().includes('complete')) {
        replyText = `Superb job! I'll register that in your daily progress tracker. Your Life Score is increasing! Let's sustain this pace. What's next on your roadmap?`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'coach',
          text: replyText,
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  useEffect(() => {
    // Scroll to bottom when message is added
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* HEADER */}
        <View className="border-b border-border bg-card px-5 py-4 flex-row items-center space-x-3">
          <View className="w-10 h-10 bg-primary/20 rounded-xl items-center justify-center">
            <Ionicons name="sparkles" size={20} color="#0EA5E9" />
          </View>
          <View>
            <Text className="text-text font-bold text-base">AI Strategist</Text>
            <Text className="text-emerald-400 text-xs font-semibold">Online</Text>
          </View>
        </View>

        {/* CHAT MESSAGES */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 p-5"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => {
            const isCoach = msg.sender === 'coach';
            return (
              <View
                key={msg.id}
                className={`mb-4 flex-row ${isCoach ? 'justify-start' : 'justify-end'}`}
              >
                {isCoach && (
                  <View className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center mr-2 self-end">
                    <Ionicons name="sparkles" size={14} color="#0EA5E9" />
                  </View>
                )}
                <View
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    isCoach ? 'bg-card border border-border text-text' : 'bg-primary text-white'
                  }`}
                >
                  <Text className={`text-sm ${isCoach ? 'text-text' : 'text-white'}`}>
                    {msg.text}
                  </Text>
                  <Text className={`text-[9px] mt-1 text-right ${isCoach ? 'text-text-muted' : 'text-white/70'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            );
          })}

          {isTyping && (
            <View className="mb-4 flex-row justify-start items-center">
              <View className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center mr-2">
                <Ionicons name="sparkles" size={14} color="#0EA5E9" />
              </View>
              <View className="bg-card border border-border rounded-2xl px-4 py-3">
                <Text className="text-text-secondary text-sm italic">AI Coach is strategizing...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* INPUT AREA */}
        <View className="p-4 border-t border-border bg-card flex-row items-center space-x-3">
          <TextInput
            className="flex-1 bg-background border border-border rounded-xl px-4 py-3.5 text-text text-sm focus:border-primary"
            placeholder="Type a message to your AI Coach..."
            placeholderTextColor="#64748B"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity
            className="w-12 h-12 bg-primary rounded-xl items-center justify-center shadow-md shadow-primary/20 ml-2"
            onPress={handleSendMessage}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
