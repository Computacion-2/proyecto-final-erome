import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { safeLocalStorage } from '../lib/storage';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'professor' | 'admin';
  group?: string; // For students
  profilePhoto?: string;
  studentRole?: 'pro' | 'killer' | 'principiante'; // Student's self-selected role
  performanceCategory?: 'pro' | 'killer' | 'principiante'; // System-assigned category
  groups?: string[]; // For professors - groups they teach
  totalPoints?: number;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<User>, password: string) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => void;
  users: User[];
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  addUser: (user: User, password: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data - In production, this would be in Supabase
const INITIAL_USERS: User[] = [
  {
    id: '1',
    email: 'admin@u.icesi.edu.co',
    name: 'Administrador',
    role: 'admin',
  },
  {
    id: '2',
    email: 'jorge.quesada@icesi.edu.co',
    name: 'Jorge Quesada',
    role: 'professor',
    groups: ['G1', 'G3', 'G5'],
  },
  {
    id: '3',
    email: 'maria.lopez@icesi.edu.co',
    name: 'María López',
    role: 'professor',
    groups: ['G2', 'G4'],
  },
];

const INITIAL_PASSWORDS: Record<string, string> = {
  '1': 'admin123',
  '2': 'prof123',
  '3': 'prof123',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [passwords, setPasswords] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load from localStorage
    const savedUsers = safeLocalStorage.getItem('users');
    const savedPasswords = safeLocalStorage.getItem('passwords');
    const savedCurrentUser = safeLocalStorage.getItem('currentUser');

    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      setUsers(INITIAL_USERS);
      safeLocalStorage.setItem('users', JSON.stringify(INITIAL_USERS));
    }

    if (savedPasswords) {
      setPasswords(JSON.parse(savedPasswords));
    } else {
      setPasswords(INITIAL_PASSWORDS);
      safeLocalStorage.setItem('passwords', JSON.stringify(INITIAL_PASSWORDS));
    }

    if (savedCurrentUser) {
      setCurrentUser(JSON.parse(savedCurrentUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && passwords[user.id] === password) {
      setCurrentUser(user);
      safeLocalStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    safeLocalStorage.removeItem('currentUser');
  };

  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    // Validate email domain for students
    if (userData.email && !userData.email.endsWith('@u.icesi.edu.co') && !userData.email.endsWith('@icesi.edu.co')) {
      return false;
    }

    // Check if email already exists
    if (users.find(u => u.email === userData.email)) {
      return false;
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email!,
      name: userData.name!,
      role: userData.role!,
      group: userData.group,
      profilePhoto: userData.profilePhoto,
      studentRole: userData.studentRole,
      totalPoints: 0,
      performanceCategory: 'principiante',
    };

    const updatedUsers = [...users, newUser];
    const updatedPasswords = { ...passwords, [newUser.id]: password };

    setUsers(updatedUsers);
    setPasswords(updatedPasswords);
    safeLocalStorage.setItem('users', JSON.stringify(updatedUsers));
    safeLocalStorage.setItem('passwords', JSON.stringify(updatedPasswords));

    return true;
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    
    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    
    safeLocalStorage.setItem('currentUser', JSON.stringify(updatedUser));
    safeLocalStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, ...updates } : u);
    setUsers(updatedUsers);
    safeLocalStorage.setItem('users', JSON.stringify(updatedUsers));

    if (currentUser?.id === userId) {
      const updatedCurrentUser = { ...currentUser, ...updates };
      setCurrentUser(updatedCurrentUser);
      safeLocalStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
    }
  };

  const deleteUser = (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    safeLocalStorage.setItem('users', JSON.stringify(updatedUsers));

    const updatedPasswords = { ...passwords };
    delete updatedPasswords[userId];
    setPasswords(updatedPasswords);
    safeLocalStorage.setItem('passwords', JSON.stringify(updatedPasswords));
  };

  const addUser = (user: User, password: string) => {
    const updatedUsers = [...users, user];
    const updatedPasswords = { ...passwords, [user.id]: password };
    
    setUsers(updatedUsers);
    setPasswords(updatedPasswords);
    safeLocalStorage.setItem('users', JSON.stringify(updatedUsers));
    safeLocalStorage.setItem('passwords', JSON.stringify(updatedPasswords));
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