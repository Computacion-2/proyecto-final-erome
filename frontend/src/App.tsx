import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import Loading from './components/common/Loading';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import StudentsPage from './pages/StudentsPage';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
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
    <Typography variant="h4" gutterBottom>
      Acceso No Autorizado
    </Typography>
    <Typography variant="body1" color="text.secondary">
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
      minHeight: '50vh',
      textAlign: 'center',
    }}
  >
    <Typography variant="h3" gutterBottom>
      Pensamiento Computacional
    </Typography>
    <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
      Sistema de gestión educativa
    </Typography>
    <Typography variant="body1" color="text.secondary">
      Bienvenido al sistema de gestión para el curso de Pensamiento Computacional.
      Inicia sesión para acceder a todas las funcionalidades.
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
              <Route path="/" element={
                <Layout>
                  <HomePage />
                </Layout>
              } />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={
                <Layout>
                  <UnauthorizedPage />
                </Layout>
              } />

              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute requiredPermissions={['READ_USER']}>
                  <Layout>
                    <UsersPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/students" element={
                <ProtectedRoute requiredPermissions={['READ_USER']}>
                  <Layout>
                    <StudentsPage />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;