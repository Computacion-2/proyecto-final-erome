import { ReactNode } from 'react';

// User related types
export interface User {
  id: number;
  name: string;
  email: string;
  photoUrl?: string;
  group?: string;
  isActive: boolean;
  createdAt: string;
  roles: Role[];
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  studentId: string;
  semester: Semester;
  group?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Semester {
  id: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  group?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Component props types
export interface LayoutProps {
  children: ReactNode;
}

export interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
}

// Form types
export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  group?: string;
  roles: number[];
  isActive: boolean;
}

export interface StudentFormData {
  name: string;
  email: string;
  studentId: string;
  semesterId: number;
  group?: string;
  isActive: boolean;
}

export interface RoleFormData {
  name: string;
  description?: string;
  permissions: number[];
}

// Activity and Exercise types
export interface Activity {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  exercises: Exercise[];
  instructor: User;
  createdAt: string;
}

export interface Exercise {
  id: number;
  title: string;
  description: string;
  instruction: string;
  difficulty: number; // 0-10 scale
  points: number;
  timeLimit?: number; // in minutes
  isActive: boolean;
  createdAt: string;
}

export interface StudentExercise {
  id: number;
  student: Student;
  exercise: Exercise;
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  score?: number;
  submittedAt?: string;
  completedAt?: string;
}

export interface StudentActivity {
  id: number;
  student: Student;
  activity: Activity;
  totalScore: number;
  completedExercises: number;
  totalExercises: number;
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt?: string;
  completedAt?: string;
}

// Performance and Analytics types
export interface StudentPerformance {
  student: Student;
  totalPoints: number;
  completedExercises: number;
  averageScore: number;
  category: 'beginner' | 'killer' | 'pro';
  weeklyProgress: WeeklyProgress[];
  groupRank: number;
  overallRank: number;
}

export interface WeeklyProgress {
  week: string;
  points: number;
  exercisesCompleted: number;
  averageScore: number;
}

export interface GroupStatistics {
  groupName: string;
  totalStudents: number;
  averageScore: number;
  completionRate: number;
  topPerformers: StudentPerformance[];
}

export interface Leaderboard {
  groupName: string;
  students: StudentPerformance[];
  lastUpdated: string;
}

// Real-time types
export interface LiveScoreboard {
  activityId: number;
  groupId: string;
  updates: ScoreboardUpdate[];
  lastUpdated: string;
}

export interface ScoreboardUpdate {
  studentName: string;
  exerciseTitle: string;
  timestamp: string;
  points: number;
}

// Export types
export interface PerformanceReport {
  student: Student;
  performance: StudentPerformance;
  activities: StudentActivity[];
  exercises: StudentExercise[];
  generatedAt: string;
  semester: Semester;
}

// Profile types
export interface StudentProfile {
  id: number;
  student: Student;
  profilePicture?: string;
  programmingLevel: 'beginner' | 'intermediate' | 'advanced';
  interests: string[];
  goals: string[];
  bio?: string;
  updatedAt: string;
}

export interface InstructorProfile {
  id: number;
  instructor: User;
  profilePicture?: string;
  department: string;
  specialization: string[];
  bio?: string;
  updatedAt: string;
}
