import React, { useMemo } from 'react';
import { useAuth } from '../AuthContext';
import { useData } from '../DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Users, BookOpen, Activity, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6'];

export function ProfessorOverview() {
  const { currentUser, users } = useAuth();
  const { exercises, activities, submissions, getCurrentSemester } = useData();

  const currentSemester = getCurrentSemester();
  const myGroups = currentUser?.groups || [];
  
  const myStudents = users.filter(
    u => u.role === 'student' && myGroups.includes(u.group || '')
  );

  const myExercises = exercises.filter(e => e.createdBy === currentUser?.id);
  const myActivities = activities.filter(a => a.createdBy === currentUser?.id && a.semester === currentSemester);
  const activeActivities = myActivities.filter(a => a.isActive);

  // Category distribution
  const categoryData = useMemo(() => {
    const categories = { principiante: 0, killer: 0, pro: 0 };
    myStudents.forEach(student => {
      const category = student.performanceCategory || 'principiante';
      categories[category]++;
    });
    return [
      { name: 'Principiante', value: categories.principiante },
      { name: 'Killer', value: categories.killer },
      { name: 'Pro', value: categories.pro },
    ];
  }, [myStudents]);

  // Group distribution
  const groupData = useMemo(() => {
    return myGroups.map(group => ({
      group,
      estudiantes: myStudents.filter(s => s.group === group).length,
    }));
  }, [myGroups, myStudents]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Estudiantes Registrados</CardTitle>
            <Users className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{myStudents.length}</div>
            <p className="text-xs text-muted-foreground">
              En {myGroups.length} grupo{myGroups.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Ejercicios Creados</CardTitle>
            <BookOpen className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{myExercises.length}</div>
            <p className="text-xs text-muted-foreground">
              Disponibles para actividades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Actividades</CardTitle>
            <Activity className="size-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{myActivities.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeActivities.length} activa{activeActivities.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Promedio de Puntos</CardTitle>
            <TrendingUp className="size-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {myStudents.length > 0
                ? Math.round(
                    myStudents.reduce((sum, s) => sum + (s.totalPoints || 0), 0) / myStudents.length
                  )
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Por estudiante
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Grupo</CardTitle>
            <CardDescription>Estudiantes registrados por grupo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={groupData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="group" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="estudiantes" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categorías de Desempeño</CardTitle>
            <CardDescription>Distribución de estudiantes por nivel</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Active Activities */}
      {activeActivities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Actividades Activas</CardTitle>
            <CardDescription>En curso en este momento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeActivities.map(activity => {
                const activitySubmissions = submissions.filter(s => s.activityId === activity.id);
                const uniqueStudents = new Set(activitySubmissions.map(s => s.studentId)).size;
                const groupStudents = myStudents.filter(s => s.group === activity.group).length;

                return (
                  <div key={activity.id} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Grupo {activity.group} • {activity.exerciseIds.length} ejercicios
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {uniqueStudents}/{groupStudents} estudiantes
                        </p>
                        <p className="text-xs text-muted-foreground">participando</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
