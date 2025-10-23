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
