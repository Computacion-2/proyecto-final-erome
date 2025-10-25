import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Typography } from '@mui/material';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import StudentsPage from './pages/StudentsPage';
import ActivitiesPage from './pages/ActivitiesPage';
import PerformancePage from './pages/PerformancePage';
import ScoreboardPage from './pages/ScoreboardPage';
import StudentProfilePage from './pages/StudentProfilePage';

// Create theme with Icesi University branding
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3a8a', // Icesi blue
      light: '#3b82f6',
      dark: '#1e40af',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc2626', // Icesi red
      light: '#ef4444',
      dark: '#b91c1c',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.125rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow:
            '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          '&:hover': {
            boxShadow:
              '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow:
            '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          borderRadius: 12,
          border: '1px solid #e5e7eb',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
});

// Unauthorized page component
const UnauthorizedPage = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      textAlign: 'center',
    }}
  >
    <Typography variant='h4' gutterBottom>
      Acceso No Autorizado
    </Typography>
    <Typography variant='body1' color='text.secondary'>
      No tienes permisos para acceder a esta página.
    </Typography>
  </Box>
);

// Home page component
const HomePage = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      color: 'white',
      borderRadius: 3,
      p: 4,
      mb: 4,
    }}
  >
    <Typography variant='h2' gutterBottom sx={{ fontWeight: 700 }}>
      Pensamiento Computacional
    </Typography>
    <Typography variant='h5' sx={{ mb: 2, opacity: 0.9 }}>
      Universidad Icesi - Escuela Barbieri
    </Typography>
    <Typography variant='h6' sx={{ mb: 4, opacity: 0.8 }}>
      Sistema de gestión educativa gamificada
    </Typography>
    <Typography variant='body1' sx={{ maxWidth: 600, opacity: 0.9 }}>
      Plataforma interactiva para el aprendizaje de algoritmos y programación en
      Python. Accede a ejercicios personalizados, compite con tus compañeros y
      mejora tu rendimiento académico de manera divertida y efectiva.
    </Typography>
  </Box>
);

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route
                path='/'
                element={
                  <Layout>
                    <HomePage />
                  </Layout>
                }
              />
              <Route path='/login' element={<LoginPage />} />
              <Route path='/register' element={<RegisterPage />} />
              <Route
                path='/unauthorized'
                element={
                  <Layout>
                    <UnauthorizedPage />
                  </Layout>
                }
              />

              {/* Protected routes */}
              <Route
                path='/dashboard'
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DashboardPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/users'
                element={
                  <ProtectedRoute requiredPermissions={['READ_USER']}>
                    <Layout>
                      <UsersPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/students'
                element={
                  <ProtectedRoute requiredPermissions={['READ_USER']}>
                    <Layout>
                      <StudentsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/activities'
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ActivitiesPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/performance'
                element={
                  <ProtectedRoute>
                    <Layout>
                      <PerformancePage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/scoreboard'
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ScoreboardPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/profile'
                element={
                  <ProtectedRoute>
                    <Layout>
                      <StudentProfilePage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Catch all route */}
              <Route path='*' element={<Navigate to='/' replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
