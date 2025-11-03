import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { GraduationCap, BookOpen, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user, hasRole } = useAuth();

  const stats = [
    {
      name: 'Actividades',
      value: '0',
      icon: BookOpen,
      href: hasRole('STUDENT') ? '/my-activities' : '/activities',
      color: 'bg-blue-500',
    },
    {
      name: 'Estudiantes',
      value: '0',
      icon: Users,
      href: '/students',
      color: 'bg-green-500',
      show: hasRole('PROFESSOR') || hasRole('ADMIN'),
    },
    {
      name: 'Rendimiento',
      value: '0 pts',
      icon: Award,
      href: '/my-performance',
      color: 'bg-yellow-500',
      show: hasRole('STUDENT'),
    },
    {
      name: 'Usuarios',
      value: '0',
      icon: GraduationCap,
      href: '/admin/users',
      color: 'bg-purple-500',
      show: hasRole('ADMIN'),
    },
  ].filter(stat => stat.show !== false);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Bienvenido, {user?.name}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link
              key={stat.name}
              to={stat.href}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd className="text-lg font-semibold text-gray-900">{stat.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen</h2>
          <div className="space-y-4">
            {hasRole('STUDENT') && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Información del Estudiante</h3>
                <p className="text-gray-600">Perfil: {user?.groupName || 'No asignado'}</p>
              </div>
            )}
            {hasRole('PROFESSOR') && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Información del Profesor</h3>
                <p className="text-gray-600">Gestiona actividades y evalúa estudiantes</p>
              </div>
            )}
            {hasRole('ADMIN') && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Panel Administrativo</h3>
                <p className="text-gray-600">Gestiona usuarios, roles y permisos del sistema</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

