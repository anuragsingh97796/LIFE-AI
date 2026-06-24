import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Milestone, Project } from '../store/useGoalStore';

interface TimelineProps {
  milestones: Milestone[];
  projects: Record<string, Project[]>;
  onPressProject?: (project: Project) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ milestones, projects, onPressProject }) => {
  return (
    <View className="px-4 py-2">
      {milestones.map((milestone, index) => {
        const isLast = index === milestones.length - 1;
        const mProjects = projects[milestone.id] || [];
        
        return (
          <View key={milestone.id} className="flex-row">
            {/* Timeline Line & Dot */}
            <View className="items-center mr-4">
              <View className={`w-4 h-4 rounded-full mt-1 ${milestone.status === 'completed' ? 'bg-green-500' : milestone.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'}`} />
              {!isLast && <View className="w-0.5 flex-1 bg-gray-200 mt-1 mb-1" />}
            </View>

            {/* Content */}
            <View className={`flex-1 pb-6 ${isLast ? 'pb-2' : ''}`}>
              <Text className="text-lg font-bold text-gray-900 dark:text-gray-100">{milestone.title}</Text>
              {milestone.description && (
                <Text className="text-sm text-gray-500 mt-1 mb-2">{milestone.description}</Text>
              )}
              
              {/* Projects inside Milestone */}
              <View className="mt-2 space-y-2">
                {mProjects.map(project => (
                  <TouchableOpacity
                    key={project.id}
                    onPress={() => onPressProject && onPressProject(project)}
                    className="flex-row items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
                  >
                    <Ionicons 
                      name={project.status === 'completed' ? 'checkmark-circle' : 'folder-outline'} 
                      size={20} 
                      color={project.status === 'completed' ? '#22c55e' : '#6b7280'} 
                    />
                    <Text className="ml-3 flex-1 text-gray-700 dark:text-gray-200 font-medium">
                      {project.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};
