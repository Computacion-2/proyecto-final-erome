import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Home } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <Home className="h-6 w-6 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">Pensamiento Computacional</span>
              </Link>
              <div className="flex space-x-4">
                <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600">
                  Dashboard
                </Link>
                {hasRole('ADMIN') && (
                  <Link to="/admin/users" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600">
                    Usuarios
                  </Link>
                )}
                {hasRole('PROFESSOR') && (
                  <>
                    <Link to="/activities" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600">
                      Actividades
                    </Link>
                    <Link to="/students" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600">
                      Estudiantes
                    </Link>
                  </>
                )}
                {hasRole('STUDENT') && (
                  <>
                    <Link to="/my-activities" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600">
                      Mis Actividades
                    </Link>
                    <Link to="/my-performance" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600">
                      Mi Rendimiento
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 rounded-md"
              >
                <LogOut className="h-5 w-5" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
};

