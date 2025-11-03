import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Plus, Clock, Edit, Trash2 } from 'lucide-react';
import type { Activity, Exercise } from '../types';

export const ProfessorActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: '',
    groupId: '',
    startTime: '',
    endTime: '',
    exercises: [] as Partial<Exercise>[],
  });

  const handleAddExercise = () => {
    setNewActivity({
      ...newActivity,
      exercises: [
        ...newActivity.exercises,
        { title: '', statement: '', difficulty: 5, maxPoints: 10 },
      ],
    });
  };

  const handleCreateActivity = async () => {
    // TODO: Implementar creación de actividad
    console.log('Creating activity:', newActivity);
    setShowCreateModal(false);
    // Reset form
    setNewActivity({
      title: '',
      groupId: '',
      startTime: '',
      endTime: '',
      exercises: [],
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Actividades</h1>
            <p className="text-gray-600 mt-1">Gestiona las actividades del curso</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            <Plus className="h-5 w-5" />
            <span>Nueva Actividad</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {activities.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay actividades</h3>
              <p className="text-gray-500 mb-4">Crea tu primera actividad para comenzar</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
              >
                Crear Actividad
              </button>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {activity.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <span>
                        {new Date(activity.startTime).toLocaleDateString()} -{' '}
                        {new Date(activity.endTime).toLocaleDateString()}
                      </span>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          activity.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : activity.status === 'COMPLETED'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {activity.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-primary-600 hover:text-primary-900">
                      <Edit className="h-5 w-5" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nueva Actividad</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={newActivity.title}
                    onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Ej: Introducción a Python"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha/Hora Inicio
                  </label>
                  <input
                    type="datetime-local"
                    value={newActivity.startTime}
                    onChange={(e) => setNewActivity({ ...newActivity, startTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha/Hora Fin
                  </label>
                  <input
                    type="datetime-local"
                    value={newActivity.endTime}
                    onChange={(e) => setNewActivity({ ...newActivity, endTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Ejercicios
                    </label>
                    <button
                      onClick={handleAddExercise}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      + Agregar Ejercicio
                    </button>
                  </div>
                  <div className="space-y-3">
                    {newActivity.exercises.map((exercise, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-4">
                        <input
                          type="text"
                          placeholder="Título del ejercicio"
                          value={exercise.title || ''}
                          onChange={(e) => {
                            const updated = [...newActivity.exercises];
                            updated[index] = { ...updated[index], title: e.target.value };
                            setNewActivity({ ...newActivity, exercises: updated });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                        />
                        <textarea
                          placeholder="Enunciado del ejercicio"
                          value={exercise.statement || ''}
                          onChange={(e) => {
                            const updated = [...newActivity.exercises];
                            updated[index] = { ...updated[index], statement: e.target.value };
                            setNewActivity({ ...newActivity, exercises: updated });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                          rows={3}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="Dificultad (0-10)"
                            min="0"
                            max="10"
                            value={exercise.difficulty || ''}
                            onChange={(e) => {
                              const updated = [...newActivity.exercises];
                              updated[index] = {
                                ...updated[index],
                                difficulty: parseInt(e.target.value),
                              };
                              setNewActivity({ ...newActivity, exercises: updated });
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                          />
                          <input
                            type="number"
                            placeholder="Puntos máximos"
                            value={exercise.maxPoints || ''}
                            onChange={(e) => {
                              const updated = [...newActivity.exercises];
                              updated[index] = {
                                ...updated[index],
                                maxPoints: parseInt(e.target.value),
                              };
                              setNewActivity({ ...newActivity, exercises: updated });
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateActivity}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Crear Actividad
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

