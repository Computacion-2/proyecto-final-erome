export interface User {
  id: number;
  name: string;
  email: string;
  photoUrl?: string;
  groupName?: string;
  isActive: boolean;
  roles: Role[];
  createdAt: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface Student {
  userId: number;
  initialProfile?: string;
  user?: User;
}

export interface Professor {
  userId: number;
  user?: User;
}

export interface Semester {
  id: number;
  code: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Group {
  id: number;
  name: string;
  courseId?: number;
  semesterId: number;
  semester?: Semester;
}

export interface Activity {
  id: number;
  groupId: number;
  professorId: number;
  title: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED';
  group?: Group;
}

export interface Exercise {
  id: number;
  activityId: number;
  title: string;
  statement: string;
  difficulty: number; // 0-10
  maxPoints: number;
  profiles?: ProfileType[];
}

export interface ProfileType {
  profileCode: string;
  description: string;
}

export interface Resolution {
  id: number;
  studentId: number;
  exerciseId: number;
  pointsAwarded?: number;
  awardedBy?: number;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED';
  attemptNo: number;
  submittedAt: string;
}

export interface StudentPerformance {
  id: number;
  studentId: number;
  totalPoints: number;
  category: string;
  updatedAt: string;
}

export interface StudentEnrollment {
  id: number;
  studentId: number;
  groupId: number;
  semesterId: number;
  enrolledAt: string;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: number; // Role ID
  groupId?: number;
  groupName?: string;
  photoUrl?: string;
}

export interface ScoreboardEvent {
  id: number;
  activityId: number;
  studentId: number;
  exerciseId: number;
  message: string;
  createdAt: string;
  userId: number;
}

