import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../store/useGoalStore';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string, completed: boolean) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onToggle(task.id, !task.completed)}
      className="flex-row items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700"
    >
      <View className="mr-3">
        {task.completed ? (
          <Ionicons name="checkbox" size={24} color="#3b82f6" />
        ) : (
          <Ionicons name="square-outline" size={24} color="#9ca3af" />
        )}
      </View>
      <View className="flex-1">
        <Text className={`text-base font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-gray-100'}`}>
          {task.title}
        </Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-xs text-gray-500 mr-2">{task.estimated_minutes} min</Text>
          <View className={`px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
            <Text className="text-[10px] font-bold text-white uppercase">{task.priority}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

function getPriorityColor(priority: string) {
  switch (priority.toLowerCase()) {
    case 'critical': return 'bg-red-500';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-blue-500';
    case 'low': return 'bg-gray-400';
    default: return 'bg-gray-400';
  }
}
