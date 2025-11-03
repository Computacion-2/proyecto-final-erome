import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { studentService } from '../services/studentService';
import type { StudentPerformance } from '../types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Award, TrendingUp, Target } from 'lucide-react';

export const StudentPerformancePage: React.FC = () => {
  const { user } = useAuth();
  const [performance, setPerformance] = useState<StudentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (user?.id) {
      loadPerformance();
    }
  }, [user]);

  const loadPerformance = async () => {
    try {
      // TODO: Implementar servicio real cuando esté disponible
      // const data = await studentService.getStudentPerformance(user!.id);
      // setPerformance(data);
      // setTotalPoints(data.reduce((sum, p) => sum + p.totalPoints, 0));
      
      // Datos de ejemplo
      const mockData: StudentPerformance[] = [
        { id: 1, studentId: user!.id, totalPoints: 50, category: 'BEGINNER', updatedAt: new Date().toISOString() },
        { id: 2, studentId: user!.id, totalPoints: 120, category: 'INTERMEDIATE', updatedAt: new Date().toISOString() },
      ];
      setPerformance(mockData);
      setTotalPoints(150);
    } catch (error) {
      console.error('Error loading performance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  const chartData = [
    { name: 'Semana 1', puntos: 30 },
    { name: 'Semana 2', puntos: 45 },
    { name: 'Semana 3', puntos: 60 },
    { name: 'Semana 4', puntos: 75 },
    { name: 'Semana 5', puntos: 90 },
    { name: 'Semana 6', puntos: 120 },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Rendimiento</h1>
          <p className="text-gray-600 mt-1">Sigue tu progreso en el curso</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Puntos Totales</p>
                <p className="text-3xl font-bold text-gray-900">{totalPoints}</p>
              </div>
              <Award className="h-10 w-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categoría Actual</p>
                <p className="text-3xl font-bold text-gray-900">
                  {performance[0]?.category || 'BEGINNER'}
                </p>
              </div>
              <Target className="h-10 w-10 text-primary-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tendencia</p>
                <p className="text-3xl font-bold text-green-600">↑ +15%</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Evolución de Puntos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="puntos" stroke="#0284c7" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Distribución por Semana</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="puntos" fill="#0284c7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
};

