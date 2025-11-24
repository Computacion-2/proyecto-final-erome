import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { safeLocalStorage } from '../lib/storage';

export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: number; // 0-10
  createdBy: string; // professor id
}

export interface Activity {
  id: string;
  title: string;
  group: string;
  exerciseIds: string[];
  createdBy: string; // professor id
  isActive: boolean;
  startTime?: Date;
  endTime?: Date;
  semester: string; // e.g., "2025-2"
}

export interface Submission {
  id: string;
  studentId: string;
  activityId: string;
  exerciseId: string;
  points: number;
  submittedAt: Date;
  code?: string; // QR code or alphanumeric code
}

interface DataContextType {
  exercises: Exercise[];
  activities: Activity[];
  submissions: Submission[];
  addExercise: (exercise: Exercise) => void;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  addActivity: (activity: Activity) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  addSubmission: (submission: Submission) => void;
  getCurrentSemester: () => string;
  getActiveActivity: (group: string) => Activity | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper to get current semester
function getCurrentSemester(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  // Semester 1: January - June (1-6)
  // Semester 2: July - December (7-12)
  const semester = month <= 6 ? 1 : 2;
  
  return `${year}-${semester}`;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const savedExercises = safeLocalStorage.getItem('exercises');
    const savedActivities = safeLocalStorage.getItem('activities');
    const savedSubmissions = safeLocalStorage.getItem('submissions');

    if (savedExercises) setExercises(JSON.parse(savedExercises));
    if (savedActivities) setActivities(JSON.parse(savedActivities));
    if (savedSubmissions) {
      const parsed = JSON.parse(savedSubmissions);
      // Convert date strings back to Date objects
      setSubmissions(parsed.map((s: any) => ({
        ...s,
        submittedAt: new Date(s.submittedAt)
      })));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    safeLocalStorage.setItem('exercises', JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    safeLocalStorage.setItem('activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    safeLocalStorage.setItem('submissions', JSON.stringify(submissions));
  }, [submissions]);

  const addExercise = (exercise: Exercise) => {
    setExercises([...exercises, exercise]);
  };

  const updateExercise = (id: string, updates: Partial<Exercise>) => {
    setExercises(exercises.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteExercise = (id: string) => {
    setExercises(exercises.filter(e => e.id !== id));
  };

  const addActivity = (activity: Activity) => {
    setActivities([...activities, activity]);
  };

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    setActivities(activities.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteActivity = (id: string) => {
    setActivities(activities.filter(a => a.id !== id));
  };

  const addSubmission = (submission: Submission) => {
    setSubmissions([...submissions, submission]);
  };

  const getActiveActivity = (group: string) => {
    return activities.find(a => a.group === group && a.isActive);
  };

  return (
    <DataContext.Provider value={{
      exercises,
      activities,
      submissions,
      addExercise,
      updateExercise,
      deleteExercise,
      addActivity,
      updateActivity,
      deleteActivity,
      addSubmission,
      getCurrentSemester,
      getActiveActivity,
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