import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useGoalStore } from '../../store/useGoalStore';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = ['Career', 'Health', 'Learning', 'Wealth', 'Growth'];

export default function GoalsScreen() {
  const { goals, loading, error, fetchGoals, addGoal, toggleGoalStatus, deleteGoal } = useGoalStore();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Career');
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleAddGoal = async () => {
    if (!title.trim()) return;
    try {
      await addGoal(title.trim(), category, targetDate.trim() || undefined);
      setTitle('');
      setCategory('Career');
      setTargetDate('');
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredGoals = goals.filter((g) => {
    if (activeTab === 'active') return g.status === 'active';
    return g.status === 'completed';
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-5 pt-4">
        {/* HEADER */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-text-secondary text-xs font-semibold uppercase tracking-widest">
              Milestones
            </Text>
            <Text className="text-text text-2xl font-bold mt-1">My Goals</Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center bg-primary px-4 py-2.5 rounded-xl shadow-md shadow-primary/20"
            onPress={() => setShowAddModal(!showAddModal)}
          >
            <Ionicons name={showAddModal ? "close" : "add"} size={18} color="#FFFFFF" />
            <Text className="text-white font-bold ml-1.5">{showAddModal ? "Cancel" : "Add Goal"}</Text>
          </TouchableOpacity>
        </View>

        {showAddModal ? (
          /* ADD GOAL FORM */
          <ScrollView className="bg-card border border-border rounded-3xl p-5 mb-5 space-y-4" showsVerticalScrollIndicator={false}>
            <Text className="text-text font-bold text-lg mb-2">Create New Goal</Text>

            <View className="mb-4">
              <Text className="text-text-secondary text-xs font-semibold mb-2 uppercase tracking-wider">
                Goal Title
              </Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3.5 text-text text-sm focus:border-primary"
                placeholder="What do you want to achieve?"
                placeholderTextColor="#64748B"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View className="mb-4">
              <Text className="text-text-secondary text-xs font-semibold mb-2 uppercase tracking-wider">
                Category
              </Text>
              <View className="flex-row flex-wrap justify-between">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      className={`w-[48%] bg-background border rounded-xl py-3 items-center mb-3 ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      onPress={() => setCategory(cat)}
                    >
                      <Text className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-text'}`}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-text-secondary text-xs font-semibold mb-2 uppercase tracking-wider">
                Target Date (Optional)
              </Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3.5 text-text text-sm focus:border-primary"
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#64748B"
                value={targetDate}
                onChangeText={setTargetDate}
              />
            </View>

            <TouchableOpacity
              className="bg-primary rounded-xl py-3.5 items-center justify-center mt-2"
              onPress={handleAddGoal}
            >
              <Text className="text-white font-bold">Save Goal</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          /* GOALS VIEW */
          <View className="flex-1">
            {/* TABS */}
            <View className="flex-row bg-card border border-border p-1.5 rounded-xl mb-5">
              <TouchableOpacity
                className={`flex-1 py-2.5 items-center rounded-lg ${activeTab === 'active' ? 'bg-primary' : ''}`}
                onPress={() => setActiveTab('active')}
              >
                <Text className={`font-bold text-xs ${activeTab === 'active' ? 'text-white' : 'text-text-secondary'}`}>
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2.5 items-center rounded-lg ${activeTab === 'completed' ? 'bg-primary' : ''}`}
                onPress={() => setActiveTab('completed')}
              >
                <Text className={`font-bold text-xs ${activeTab === 'completed' ? 'text-white' : 'text-text-secondary'}`}>
                  Completed
                </Text>
              </TouchableOpacity>
            </View>

            {error && (
              <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
                <Text className="text-red-400 text-xs text-center">{error}</Text>
              </View>
            )}

            {loading && goals.length === 0 ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator color="#0EA5E9" size="large" />
              </View>
            ) : filteredGoals.length === 0 ? (
              <View className="flex-1 justify-center items-center py-10">
                <Ionicons name="trophy-outline" size={48} color="#64748B" />
                <Text className="text-text-secondary text-sm mt-3">No goals found in this section</Text>
              </View>
            ) : (
              <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {filteredGoals.map((goal) => (
                  <View
                    key={goal.id}
                    className="bg-card border border-border rounded-2xl p-4 mb-4 flex-row items-center justify-between"
                  >
                    <View className="flex-1 pr-4">
                      <Text className={`text-text font-bold text-base ${goal.status === 'completed' ? 'line-through opacity-50' : ''}`}>
                        {goal.title}
                      </Text>
                      <View className="flex-row mt-2 items-center space-x-2">
                        {goal.category && (
                          <View className="bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg mr-2">
                            <Text className="text-primary text-[10px] font-bold uppercase">{goal.category}</Text>
                          </View>
                        )}
                        {goal.target_date && (
                          <View className="flex-row items-center">
                            <Ionicons name="calendar-outline" size={12} color="#64748B" />
                            <Text className="text-text-muted text-[10px] ml-1">{goal.target_date}</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Actions */}
                    <View className="flex-row items-center space-x-2">
                      <TouchableOpacity
                        className={`w-9 h-9 rounded-xl items-center justify-center ${
                          goal.status === 'completed' ? 'bg-emerald-500/10' : 'bg-primary/10'
                        }`}
                        onPress={() => toggleGoalStatus(goal.id, goal.status)}
                      >
                        <Ionicons
                          name={goal.status === 'completed' ? 'checkmark-circle' : 'checkmark-circle-outline'}
                          size={20}
                          color={goal.status === 'completed' ? '#10B981' : '#0EA5E9'}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="w-9 h-9 rounded-xl bg-red-500/10 items-center justify-center ml-2"
                        onPress={() => deleteGoal(goal.id)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
