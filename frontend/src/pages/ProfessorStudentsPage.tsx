import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { studentService } from '../services/studentService';
import { semesterService } from '../services/semesterService';
import type { Student, Semester } from '../types';
import { Users, Award, TrendingUp } from 'lucide-react';

export const ProfessorStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [activeSemester, setActiveSemester] = useState<Semester | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsData, semester] = await Promise.all([
        studentService.getAllStudents(),
        semesterService.getActiveSemester(),
      ]);
      setStudents(studentsData);
      setActiveSemester(semester);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const groups = Array.from(new Set(students.map(s => s.user?.groupName).filter(Boolean))) as string[];

  const filteredStudents = selectedGroup === 'all'
    ? students
    : students.filter(s => s.user?.groupName === selectedGroup);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Estudiantes</h1>
            <p className="text-gray-600 mt-1">
              Semestre activo: {activeSemester?.code || 'No hay semestre activo'}
            </p>
          </div>
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setSelectedGroup('all')}
            className={`px-4 py-2 rounded-md ${
              selectedGroup === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Todos los grupos
          </button>
          {groups.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-4 py-2 rounded-md ${
                selectedGroup === group
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Estudiantes</p>
                <p className="text-2xl font-bold text-gray-900">{filteredStudents.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Lista de Estudiantes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estudiante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Grupo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Perfil Inicial
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {student.user?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.user?.name}
                          </div>
                          <div className="text-sm text-gray-500">{student.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.user?.groupName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        {student.initialProfile || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900">
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

