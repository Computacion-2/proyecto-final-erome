import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User as ApiUser } from '../lib/api/auth';
import { usersApi } from '../lib/api/users';
import { ApiError } from '../lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'professor' | 'admin';
  group?: string;
  profilePhoto?: string;
  studentRole?: 'pro' | 'killer' | 'principiante';
  performanceCategory?: 'pro' | 'killer' | 'principiante';
  groups?: string[];
  totalPoints?: number;
}

function mapApiUserToUser(apiUser: ApiUser): User {
  const roles = apiUser.role?.toLowerCase() || '';
  let role: 'student' | 'professor' | 'admin' = 'student';
  if (roles.includes('admin')) role = 'admin';
  else if (roles.includes('professor')) role = 'professor';
  else role = 'student';

  return {
    id: apiUser.id.toString(),
    email: apiUser.email,
    name: apiUser.name,
    role,
    group: apiUser.group,
    groups: apiUser.groups, // Include groups for professors
    profilePhoto: apiUser.photoUrl,
    studentRole: apiUser.studentRole as 'pro' | 'killer' | 'principiante' | undefined,
    performanceCategory: apiUser.performanceCategory as 'pro' | 'killer' | 'principiante' | undefined,
    totalPoints: apiUser.totalPoints,
  };
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<User>, password: string) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  users: User[];
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  addUser: (user: User, password: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const apiUser = await authApi.getCurrentUser();
          setCurrentUser(mapApiUserToUser(apiUser));
        }
      } catch (error) {
        console.error('Failed to get current user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const apiUsers = await usersApi.getAllUsers();
        setUsers(apiUsers.map(mapApiUserToUser));
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };

    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'professor')) {
      loadUsers();
    }
  }, [currentUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (!email || !password) {
        console.error('Login failed: email or password is empty', { email: !!email, password: !!password });
        return false;
      }
      const response = await authApi.login(email.trim(), password);
      const user = mapApiUserToUser(response.user);
      setCurrentUser(user);
      return true;
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error?.status === 400) {
        console.error('Validation error:', error?.message);
      }
      return false;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCurrentUser(null);
      setUsers([]);
    }
  };

  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    try {
      if (userData.email && !userData.email.endsWith('@u.icesi.edu.co') && !userData.email.endsWith('@icesi.edu.co')) {
        // Dominio inválido: lanzamos un error explícito para que la UI pueda mostrar
        // un mensaje correcto en vez de tratarlo como "correo ya registrado".
        throw new Error('Debes usar tu correo institucional (@u.icesi.edu.co o @icesi.edu.co)');
      }

      const roleMap: Record<string, string> = {
        'student': 'STUDENT',
        'professor': 'PROFESSOR',
        'admin': 'ADMIN'
      };
      
      const apiUser = await authApi.register({
        name: userData.name!,
        email: userData.email!,
        password,
        role: roleMap[userData.role || 'student'] || 'STUDENT',
        group: userData.group,
        studentRole: userData.studentRole,
      });

      const user = mapApiUserToUser(apiUser);
      setCurrentUser(user);
      return true;
    } catch (error: any) {
      console.error('Registration failed:', error);
      // Si el backend devuelve 409, interpretamos que el correo ya existe
      if (error instanceof ApiError && error.status === 409) {
        return false;
      }
      // Para otros errores (400 de validación, dominio inválido, etc.) propagamos el mensaje
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!currentUser) return;

    try {
      const apiUser = await usersApi.updateUser(parseInt(currentUser.id), {
        name: updates.name,
        email: updates.email,
        group: updates.group,
        photoUrl: updates.profilePhoto,
        studentRole: updates.studentRole,
        performanceCategory: updates.performanceCategory,
        totalPoints: updates.totalPoints,
      });

      const updatedUser = mapApiUserToUser(apiUser);
      setCurrentUser(updatedUser);
      
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
    try {
      const apiUser = await usersApi.updateUser(parseInt(userId), {
        name: updates.name,
        email: updates.email,
        role: updates.role, // Include role so backend knows if it's a professor
        group: updates.group,
        photoUrl: updates.profilePhoto,
        studentRole: updates.studentRole,
        performanceCategory: updates.performanceCategory,
        totalPoints: updates.totalPoints,
        groups: updates.groups, // Include groups for professors
      });

      const updatedUser = mapApiUserToUser(apiUser);
      setUsers(users.map(u => u.id === userId ? updatedUser : u));

      if (currentUser?.id === userId) {
        setCurrentUser(updatedUser);
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  const deleteUser = async (userId: string): Promise<void> => {
    try {
      await usersApi.deleteUser(parseInt(userId));
      setUsers(users.filter(u => u.id !== userId));

      if (currentUser?.id === userId) {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  };

  const addUser = async (user: User, password: string): Promise<void> => {
    try {
      const apiUser = await usersApi.createUser({
        name: user.name,
        email: user.email,
        role: user.role?.toUpperCase(), // Backend expects uppercase role names
        group: user.group,
        photoUrl: user.profilePhoto,
        studentRole: user.studentRole,
        performanceCategory: user.performanceCategory,
        totalPoints: user.totalPoints,
        groups: user.groups, // Include groups for professors
        password: password, // Include password for new users
      });

      const newUser = mapApiUserToUser(apiUser);
      setUsers([...users, newUser]);
    } catch (error) {
      console.error('Failed to add user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      logout,
      register,
      updateProfile,
      users,
      updateUser,
      deleteUser,
      addUser,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
