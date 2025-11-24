import React, { useMemo } from 'react';
import { useAuth } from '../AuthContext';
import { useData } from '../DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Trophy, Target, TrendingUp, Award } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function StudentOverview() {
  const { currentUser } = useAuth();
  const { submissions } = useData();

  const mySubmissions = submissions.filter(s => s.studentId === currentUser?.id);
  const totalPoints = mySubmissions.reduce((sum, s) => sum + s.points, 0);
  const exercisesCompleted = new Set(mySubmissions.map(s => s.exerciseId)).size;

  // Weekly progress data
  const weeklyData = useMemo(() => {
    const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
    const data = weeks.map((week, index) => {
      const weekSubmissions = mySubmissions.filter((s) => {
        const weeksSinceStart = Math.floor(
          (s.submittedAt.getTime() - new Date().getTime() + 28 * 24 * 60 * 60 * 1000) / 
          (7 * 24 * 60 * 60 * 1000)
        );
        return weeksSinceStart === index;
      });
      return {
        week,
        puntos: weekSubmissions.reduce((sum, s) => sum + s.points, 0),
      };
    });
    return data;
  }, [mySubmissions]);

  // Daily activity (last 7 days)
  const dailyData = useMemo(() => {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return days.map((day, index) => ({
      day,
      ejercicios: Math.floor(Math.random() * 5), // Mock data
    }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Puntos Totales</CardTitle>
            <Trophy className="size-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalPoints}</div>
            <p className="text-xs text-muted-foreground">
              +{mySubmissions.slice(-5).reduce((sum, s) => sum + s.points, 0)} esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Ejercicios Completados</CardTitle>
            <Target className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{exercisesCompleted}</div>
            <p className="text-xs text-muted-foreground">
              En {new Set(mySubmissions.map(s => s.activityId)).size} actividades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Promedio por Ejercicio</CardTitle>
            <TrendingUp className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {exercisesCompleted > 0 ? (totalPoints / exercisesCompleted).toFixed(1) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Puntos por ejercicio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Categoría</CardTitle>
            <Award className="size-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl capitalize">
              {currentUser?.performanceCategory || 'Principiante'}
            </div>
            <p className="text-xs text-muted-foreground">
              Nivel actual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Progreso Semanal</CardTitle>
            <CardDescription>Puntos acumulados por semana</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="puntos" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Diaria</CardTitle>
            <CardDescription>Ejercicios completados esta semana</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ejercicios" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Historial Reciente</CardTitle>
          <CardDescription>Tus últimos ejercicios completados</CardDescription>
        </CardHeader>
        <CardContent>
          {mySubmissions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aún no has completado ejercicios. ¡Empieza ahora!
            </p>
          ) : (
            <div className="space-y-3">
              {mySubmissions
                .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
                .slice(0, 5)
                .map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm">Ejercicio #{submission.exerciseId.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {submission.submittedAt.toLocaleDateString()} a las{' '}
                        {submission.submittedAt.toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg text-blue-600">{submission.points} pts</p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
