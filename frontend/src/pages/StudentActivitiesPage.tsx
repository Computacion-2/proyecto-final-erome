import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import type { Activity } from '../types';
import { Clock, CheckCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const StudentActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implementar carga de actividades desde API
    setLoading(false);
  }, []);

  const getActivityStatus = (activity: Activity) => {
    const now = new Date();
    const start = new Date(activity.startTime);
    const end = new Date(activity.endTime);

    if (now < start) return 'scheduled';
    if (now >= start && now <= end) return 'active';
    return 'completed';
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

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Actividades</h1>
          <p className="text-gray-600 mt-1">Gestiona tus actividades de programación</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {activities.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay actividades</h3>
              <p className="text-gray-500">Aún no hay actividades asignadas para ti</p>
            </div>
          ) : (
            activities.map((activity) => {
              const status = getActivityStatus(activity);
              return (
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
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>
                            {format(new Date(activity.startTime), 'PPpp', { locale: es })} -{' '}
                            {format(new Date(activity.endTime), 'PPpp', { locale: es })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : status === 'completed'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {status === 'active'
                            ? 'Activa'
                            : status === 'completed'
                            ? 'Completada'
                            : 'Programada'}
                        </span>
                      </div>
                    </div>
                    {status === 'active' && (
                      <button className="ml-4 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
                        Participar
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
};

