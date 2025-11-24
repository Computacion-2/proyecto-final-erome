import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { StudentDashboard } from './components/StudentDashboard';
import { ProfessorDashboard } from './components/ProfessorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { currentUser, logout } = useAuth();
  const [view, setView] = useState<'login' | 'register'>('login');

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {view === 'login' ? (
          <LoginPage onSwitchToRegister={() => setView('register')} />
        ) : (
          <RegisterPage onSwitchToLogin={() => setView('login')} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentUser.role === 'student' && <StudentDashboard />}
      {currentUser.role === 'professor' && <ProfessorDashboard />}
      {currentUser.role === 'admin' && <AdminDashboard />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}