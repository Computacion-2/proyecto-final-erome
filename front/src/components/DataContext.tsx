import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { activitiesApi, Activity as ApiActivity } from '../lib/api/activities';
import { exercisesApi, Exercise as ApiExercise } from '../lib/api/exercises';
import { resolutionsApi, Resolution as ApiResolution } from '../lib/api/resolutions';
import { useAuth } from './AuthContext';

export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  createdBy: string;
  activityId?: string;
  maxPoints?: number;
}

export interface Activity {
  id: string;
  title: string;
  group: string;
  exerciseIds: string[];
  createdBy: string;
  isActive: boolean;
  startTime?: Date;
  endTime?: Date;
  semester: string;
}

export interface Submission {
  id: string;
  studentId: string;
  activityId: string;
  exerciseId: string;
  points: number;
  submittedAt: Date;
  code?: string;
}

interface DataContextType {
  exercises: Exercise[];
  activities: Activity[];
  submissions: Submission[];
  loading: boolean;
  addExercise: (exercise: Exercise) => Promise<void>;
  updateExercise: (id: string, updates: Partial<Exercise>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  addActivity: (activity: Activity) => Promise<void>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  addSubmission: (submission: Submission) => Promise<void>;
  getCurrentSemester: () => string;
  getActiveActivity: (group: string) => Activity | undefined;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function getCurrentSemester(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const semester = month <= 6 ? 1 : 2;
  return `${year}-${semester}`;
}

function mapApiExerciseToExercise(apiExercise: ApiExercise, createdBy?: string): Exercise {
  return {
    id: apiExercise.id.toString(),
    title: apiExercise.title,
    description: apiExercise.statement,
    difficulty: apiExercise.difficulty,
    createdBy: createdBy || '',
    activityId: apiExercise.activityId?.toString(),
    maxPoints: apiExercise.maxPoints,
  };
}

function mapApiActivityToActivity(apiActivity: ApiActivity, exercises: Exercise[], fallbackExerciseIds?: string[]): Activity {
  const now = new Date();
  const startTime = new Date(apiActivity.startTime);
  const endTime = new Date(apiActivity.endTime);
  const isActive = now >= startTime && now <= endTime && apiActivity.status === 'ACTIVE';

  // Find exercises that belong to this activity
  let exerciseIds = exercises
    .filter(e => e.activityId === apiActivity.id.toString())
    .map(e => e.id);

  // If no exercises found and fallback is provided, use it
  if (exerciseIds.length === 0 && fallbackExerciseIds && fallbackExerciseIds.length > 0) {
    console.log('Using fallback exerciseIds for activity', apiActivity.id, fallbackExerciseIds);
    exerciseIds = fallbackExerciseIds;
  }

  return {
    id: apiActivity.id.toString(),
    title: apiActivity.title,
    group: apiActivity.group?.name || '',
    exerciseIds,
    createdBy: apiActivity.professorId?.toString() || '',
    isActive,
    startTime,
    endTime,
    semester: getCurrentSemester(),
  };
}

function mapApiResolutionToSubmission(apiResolution: ApiResolution): Submission {
  return {
    id: apiResolution.id.toString(),
    studentId: apiResolution.studentId.toString(),
    activityId: apiResolution.exercise?.activityId?.toString() || '',
    exerciseId: apiResolution.exerciseId.toString(),
    points: apiResolution.pointsAwarded || 0,
    submittedAt: new Date(apiResolution.submittedAt),
    code: apiResolution.code,
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [apiExercises, apiActivities] = await Promise.all([
        exercisesApi.getAllExercises(),
        activitiesApi.getAllActivities(),
      ]);

      const mappedExercises = apiExercises.map(e => mapApiExerciseToExercise(e));
      setExercises(mappedExercises);

      const mappedActivities = apiActivities.map(a => mapApiActivityToActivity(a, mappedExercises));
      setActivities(mappedActivities);

      if (currentUser.role === 'student') {
        const apiResolutions = await resolutionsApi.getStudentResolutions(parseInt(currentUser.id));
        const mappedSubmissions = apiResolutions.map(r => mapApiResolutionToSubmission(r));
        setSubmissions(mappedSubmissions);
      } else if (currentUser.role === 'professor' || currentUser.role === 'admin') {
        const allResolutions: ApiResolution[] = [];
        for (const activity of apiActivities) {
          const activityResolutions = await resolutionsApi.getActivityResolutions(activity.id);
          allResolutions.push(...activityResolutions);
        }
        const mappedSubmissions = allResolutions.map(r => mapApiResolutionToSubmission(r));
        setSubmissions(mappedSubmissions);
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    
    // Auto-refresh every 10 seconds for students to see new activities
    if (currentUser?.role === 'student') {
      const interval = setInterval(() => {
        refreshData();
      }, 10000); // Refresh every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const addExercise = async (exercise: Exercise) => {
    try {
      const exerciseData: any = {
        title: exercise.title,
        statement: exercise.description,
        difficulty: exercise.difficulty,
        maxPoints: exercise.maxPoints || 100,
      };
      
      // Only include activityId if it's a valid number (not 0 or empty)
      if (exercise.activityId && exercise.activityId !== '0') {
        const activityIdNum = parseInt(exercise.activityId);
        if (activityIdNum > 0) {
          exerciseData.activityId = activityIdNum;
        }
      }
      
      const apiExercise = await exercisesApi.createExercise(exerciseData);

      const newExercise = mapApiExerciseToExercise(apiExercise, exercise.createdBy);
      setExercises([...exercises, newExercise]);
    } catch (error) {
      console.error('Failed to add exercise:', error);
      throw error;
    }
  };

  const updateExercise = async (id: string, updates: Partial<Exercise>) => {
    try {
      // Find existing exercise in state to preserve createdBy
      const existingExercise = exercises.find(e => e.id === id);
      
      // First, get the current exercise from the backend to ensure we have the latest data
      const currentApiExercise = await exercisesApi.getExerciseById(parseInt(id));
      
      console.log('Current exercise from backend:', currentApiExercise);
      console.log('Existing exercise in state:', existingExercise);
      
      const updateData: any = {
        title: updates.title,
        statement: updates.description,
        difficulty: updates.difficulty,
        maxPoints: updates.maxPoints,
      };
      
      // CRITICAL: Always preserve activityId from the current exercise in the database
      // Even if it's null, we need to explicitly handle it
      if (currentApiExercise.activityId != null && currentApiExercise.activityId > 0) {
        updateData.activityId = currentApiExercise.activityId;
        console.log('Preserving activityId:', updateData.activityId);
      } else {
        console.log('No activityId to preserve (exercise has no activity)');
      }
      
      console.log('Updating exercise with data:', JSON.stringify(updateData, null, 2));
      
      const apiExercise = await exercisesApi.updateExercise(parseInt(id), updateData);
      
      console.log('Updated exercise response:', apiExercise);

      // Preserve createdBy from existing exercise in state
      const updatedExercise = mapApiExerciseToExercise(apiExercise, existingExercise?.createdBy);
      console.log('Mapped exercise with createdBy:', updatedExercise);
      
      // Only update the state if the update was successful
      setExercises(exercises.map(e => e.id === id ? updatedExercise : e));
      return updatedExercise;
    } catch (error) {
      console.error('Failed to update exercise:', error);
      // Don't remove the exercise from state if update fails
      throw error;
    }
  };

  const deleteExercise = async (id: string) => {
    try {
      await exercisesApi.deleteExercise(parseInt(id));
      setExercises(exercises.filter(e => e.id !== id));
    } catch (error) {
      console.error('Failed to delete exercise:', error);
      throw error;
    }
  };

  const addActivity = async (activity: Activity) => {
    try {
      // Get group ID from group name
      const { groupsApi } = await import('../lib/api/groups');
      const group = await groupsApi.getGroupByName(activity.group);
      
      if (!group || !group.id) {
        throw new Error(`Grupo ${activity.group} no encontrado`);
      }

      // Create the activity
      const apiActivity = await activitiesApi.createActivity({
        title: activity.title,
        groupId: group.id,
        startTime: activity.startTime?.toISOString(),
        endTime: activity.endTime?.toISOString(),
        status: activity.isActive ? 'ACTIVE' : 'PENDING',
      });

      // Associate selected exercises with the new activity
      if (activity.exerciseIds && activity.exerciseIds.length > 0) {
        console.log('Associating exercises with activity:', apiActivity.id, activity.exerciseIds);
        
        // Update each selected exercise to associate it with the new activity
        const updatePromises = activity.exerciseIds.map(async (exerciseId) => {
          try {
            // Get the current exercise from backend to preserve all its data
            const currentExercise = await exercisesApi.getExerciseById(parseInt(exerciseId));
            
            // Update the exercise with the activityId
            await exercisesApi.updateExercise(parseInt(exerciseId), {
              title: currentExercise.title,
              statement: currentExercise.statement,
              difficulty: currentExercise.difficulty,
              maxPoints: currentExercise.maxPoints,
              activityId: apiActivity.id, // Associate with the new activity
            });
          } catch (error) {
            console.error(`Failed to associate exercise ${exerciseId} with activity:`, error);
          }
        });
        
        await Promise.all(updatePromises);
      }

      // Refresh data to get updated exercises with activityId
      await refreshData();
      
      // Get fresh exercises from backend to ensure we have the latest activityId values
      const updatedExercises = await exercisesApi.getAllExercises();
      console.log('Updated exercises from backend:', updatedExercises);
      
      const mappedExercises = updatedExercises.map(e => {
        const existing = exercises.find(ex => ex.id === e.id.toString());
        const mapped = mapApiExerciseToExercise(e, existing?.createdBy);
        console.log(`Exercise ${mapped.id}: activityId = ${mapped.activityId}, expected activityId = ${apiActivity.id}`);
        return mapped;
      });
      
      // Filter exercises that belong to this activity
      const activityExercises = mappedExercises.filter(e => e.activityId === apiActivity.id.toString());
      console.log(`Found ${activityExercises.length} exercises for activity ${apiActivity.id}:`, activityExercises.map(e => e.id));
      
      // Update exercises state with fresh data
      setExercises(mappedExercises);
      
      // Map the activity with updated exercises, using original exerciseIds as fallback
      const newActivity = mapApiActivityToActivity(apiActivity, mappedExercises, activity.exerciseIds);
      console.log('Mapped activity exerciseIds:', newActivity.exerciseIds);
      
      setActivities([...activities, newActivity]);
      
      return newActivity;
    } catch (error) {
      console.error('Failed to add activity:', error);
      throw error;
    }
  };

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    try {
      const apiActivity = await activitiesApi.updateActivity(parseInt(id), {
        title: updates.title,
        startTime: updates.startTime?.toISOString(),
        endTime: updates.endTime?.toISOString(),
        status: updates.isActive ? 'ACTIVE' : 'PENDING',
      });

      const updatedActivity = mapApiActivityToActivity(apiActivity, exercises);
      setActivities(activities.map(a => a.id === id ? updatedActivity : a));
    } catch (error) {
      console.error('Failed to update activity:', error);
      throw error;
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      await activitiesApi.deleteActivity(parseInt(id));
      setActivities(activities.filter(a => a.id !== id));
    } catch (error) {
      console.error('Failed to delete activity:', error);
      throw error;
    }
  };

  const addSubmission = async (submission: Submission) => {
    try {
      const apiResolution = await resolutionsApi.submitResolution({
        studentId: parseInt(submission.studentId),
        exerciseId: parseInt(submission.exerciseId),
        code: submission.code,
        status: 'PENDING',
      });

      const newSubmission = mapApiResolutionToSubmission(apiResolution);
      setSubmissions([...submissions, newSubmission]);
    } catch (error) {
      console.error('Failed to add submission:', error);
      throw error;
    }
  };

  const getActiveActivity = (group: string) => {
    return activities.find(a => a.group === group && a.isActive);
  };

  return (
    <DataContext.Provider value={{
      exercises,
      activities,
      submissions,
      loading,
      addExercise,
      updateExercise,
      deleteExercise,
      addActivity,
      updateActivity,
      deleteActivity,
      addSubmission,
      getCurrentSemester,
      getActiveActivity,
      refreshData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
