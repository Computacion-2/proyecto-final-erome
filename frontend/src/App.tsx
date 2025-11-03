import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { ProfessorStudentsPage } from './pages/ProfessorStudentsPage';
import { StudentActivitiesPage } from './pages/StudentActivitiesPage';
import { StudentPerformancePage } from './pages/StudentPerformancePage';
import { ProfessorActivitiesPage } from './pages/ProfessorActivitiesPage';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute requiredRole="PROFESSOR">
            <ProfessorStudentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-activities"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <StudentActivitiesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-performance"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <StudentPerformancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activities"
        element={
          <ProtectedRoute requiredRole="PROFESSOR">
            <ProfessorActivitiesPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
