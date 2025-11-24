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

function mapApiActivityToActivity(apiActivity: ApiActivity, exercises: Exercise[]): Activity {
  const now = new Date();
  const startTime = new Date(apiActivity.startTime);
  const endTime = new Date(apiActivity.endTime);
  const isActive = now >= startTime && now <= endTime && apiActivity.status === 'ACTIVE';

  const exerciseIds = exercises
    .filter(e => e.activityId === apiActivity.id.toString())
    .map(e => e.id);

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
  }, [currentUser]);

  const addExercise = async (exercise: Exercise) => {
    try {
      const apiExercise = await exercisesApi.createExercise({
        title: exercise.title,
        statement: exercise.description,
        difficulty: exercise.difficulty,
        maxPoints: exercise.maxPoints || 100,
        activityId: parseInt(exercise.activityId || '0'),
      });

      const newExercise = mapApiExerciseToExercise(apiExercise, exercise.createdBy);
      setExercises([...exercises, newExercise]);
    } catch (error) {
      console.error('Failed to add exercise:', error);
      throw error;
    }
  };

  const updateExercise = async (id: string, updates: Partial<Exercise>) => {
    try {
      const apiExercise = await exercisesApi.updateExercise(parseInt(id), {
        title: updates.title,
        statement: updates.description,
        difficulty: updates.difficulty,
        maxPoints: updates.maxPoints,
      });

      const updatedExercise = mapApiExerciseToExercise(apiExercise);
      setExercises(exercises.map(e => e.id === id ? updatedExercise : e));
    } catch (error) {
      console.error('Failed to update exercise:', error);
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
      const groupId = 1; // TODO: Get actual group ID from group name
      const apiActivity = await activitiesApi.createActivity({
        title: activity.title,
        groupId,
        startTime: activity.startTime?.toISOString(),
        endTime: activity.endTime?.toISOString(),
        status: activity.isActive ? 'ACTIVE' : 'PENDING',
      });

      const newActivity = mapApiActivityToActivity(apiActivity, exercises);
      setActivities([...activities, newActivity]);
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
