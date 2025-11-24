import React, { useState, useMemo } from 'react';
import { useAuth } from '../AuthContext';
import { useData } from '../DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Download, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { toast } from 'sonner@2.0.3';
import jsPDF from 'jspdf';

export function ProfessorAnalytics() {
  const { currentUser, users } = useAuth();
  const { submissions, exercises } = useData();
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  const myGroups = currentUser?.groups || [];

  const groupStudents = useMemo(() => {
    return users.filter(u => {
      if (u.role !== 'student') return false;
      if (!myGroups.includes(u.group || '')) return false;
      if (selectedGroup !== 'all' && u.group !== selectedGroup) return false;
      return true;
    });
  }, [users, myGroups, selectedGroup]);

  // Calculate metrics
  const analytics = useMemo(() => {
    const points = groupStudents.map(s => s.totalPoints || 0);
    const total = points.reduce((sum, p) => sum + p, 0);
    const count = groupStudents.length;
    const average = count > 0 ? total / count : 0;
    const max = Math.max(...points, 0);
    const min = Math.min(...points.filter(p => p > 0), 0);
    
    // Standard deviation
    const variance = count > 0
      ? points.reduce((sum, p) => sum + Math.pow(p - average, 2), 0) / count
      : 0;
    const stdDev = Math.sqrt(variance);

    // Participation rate
    const studentsWithSubmissions = new Set(submissions.map(s => s.studentId)).size;
    const participationRate = count > 0 ? (studentsWithSubmissions / count) * 100 : 0;

    return {
      average: Math.round(average),
      max,
      min: min === Infinity ? 0 : min,
      stdDev: Math.round(stdDev),
      participationRate: Math.round(participationRate),
      totalStudents: count,
    };
  }, [groupStudents, submissions]);

  // Performance distribution
  const distributionData = useMemo(() => {
    const ranges = [
      { range: '0-100', min: 0, max: 100, count: 0 },
      { range: '101-200', min: 101, max: 200, count: 0 },
      { range: '201-300', min: 201, max: 300, count: 0 },
      { range: '301-400', min: 301, max: 400, count: 0 },
      { range: '401-500', min: 401, max: 500, count: 0 },
      { range: '500+', min: 501, max: Infinity, count: 0 },
    ];

    groupStudents.forEach(student => {
      const points = student.totalPoints || 0;
      const range = ranges.find(r => points >= r.min && points <= r.max);
      if (range) range.count++;
    });

    return ranges;
  }, [groupStudents]);

  // Category distribution
  const categoryData = useMemo(() => {
    return [
      {
        category: 'Principiante',
        estudiantes: groupStudents.filter(s => s.performanceCategory === 'principiante').length,
      },
      {
        category: 'Killer',
        estudiantes: groupStudents.filter(s => s.performanceCategory === 'killer').length,
      },
      {
        category: 'Pro',
        estudiantes: groupStudents.filter(s => s.performanceCategory === 'pro').length,
      },
    ];
  }, [groupStudents]);

  // Exercise difficulty vs completion rate
  const exerciseAnalytics = useMemo(() => {
    const myExercises = exercises.filter(e => e.createdBy === currentUser?.id);
    return myExercises.map(exercise => {
      const exerciseSubmissions = submissions.filter(s => s.exerciseId === exercise.id);
      const uniqueStudents = new Set(exerciseSubmissions.map(s => s.studentId)).size;
      const completionRate = groupStudents.length > 0
        ? (uniqueStudents / groupStudents.length) * 100
        : 0;
      const avgPoints = exerciseSubmissions.length > 0
        ? exerciseSubmissions.reduce((sum, s) => sum + s.points, 0) / exerciseSubmissions.length
        : 0;

      return {
        title: exercise.title,
        difficulty: exercise.difficulty,
        completion: Math.round(completionRate),
        avgPoints: Math.round(avgPoints),
      };
    }).slice(0, 10);
  }, [exercises, submissions, groupStudents, currentUser]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    const groupLabel = selectedGroup === 'all' ? 'Todos los grupos' : `Grupo ${selectedGroup}`;
    
    // Header
    doc.setFontSize(20);
    doc.text('Reporte de Desempeño', 20, 20);
    doc.setFontSize(12);
    doc.text(`Profesor: ${currentUser?.name}`, 20, 30);
    doc.text(groupLabel, 20, 37);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 44);

    // Metrics
    doc.setFontSize(14);
    doc.text('Métricas Generales', 20, 60);
    doc.setFontSize(10);
    doc.text(`Total de estudiantes: ${analytics.totalStudents}`, 25, 70);
    doc.text(`Promedio de puntos: ${analytics.average}`, 25, 77);
    doc.text(`Puntos máximos: ${analytics.max}`, 25, 84);
    doc.text(`Puntos mínimos: ${analytics.min}`, 25, 91);
    doc.text(`Desviación estándar: ${analytics.stdDev}`, 25, 98);
    doc.text(`Tasa de participación: ${analytics.participationRate}%`, 25, 105);

    // Students
    doc.setFontSize(14);
    doc.text('Estudiantes', 20, 120);
    doc.setFontSize(9);
    
    let y = 130;
    groupStudents.slice(0, 20).forEach((student, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const text = `${index + 1}. ${student.name} - ${student.totalPoints || 0} pts (${student.performanceCategory})`;
      doc.text(text, 25, y);
      y += 7;
    });

    doc.save(`reporte_${selectedGroup}_${Date.now()}.pdf`);
    toast.success('Reporte exportado correctamente');
  };

  const getTrendIcon = (value: number, threshold: number) => {
    if (value > threshold) return <TrendingUp className="size-4 text-green-600" />;
    if (value < threshold) return <TrendingDown className="size-4 text-red-600" />;
    return <Minus className="size-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-1">Analytics y Estadísticas</h2>
          <p className="text-sm text-muted-foreground">
            Análisis detallado del desempeño de los estudiantes
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los grupos</SelectItem>
              {myGroups.map(group => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={exportToPDF}>
            <Download className="size-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Promedio del Grupo</CardTitle>
            {getTrendIcon(analytics.average, 200)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{analytics.average} puntos</div>
            <p className="text-xs text-muted-foreground">
              De {analytics.totalStudents} estudiante{analytics.totalStudents !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Desviación Estándar</CardTitle>
            <BarChart3 className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{analytics.stdDev}</div>
            <p className="text-xs text-muted-foreground">
              Dispersión de los datos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Tasa de Participación</CardTitle>
            {getTrendIcon(analytics.participationRate, 70)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{analytics.participationRate}%</div>
            <p className="text-xs text-muted-foreground">
              Estudiantes activos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Puntos</CardTitle>
            <CardDescription>Estudiantes por rango de puntos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categorías de Desempeño</CardTitle>
            <CardDescription>Estudiantes por nivel</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="estudiantes" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Exercise Analytics */}
      {exerciseAnalytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Análisis por Ejercicio</CardTitle>
            <CardDescription>Dificultad vs tasa de completación</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={exerciseAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="difficulty"
                  stroke="#8b5cf6"
                  name="Dificultad (0-10)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="completion"
                  stroke="#10b981"
                  name="% Completación"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detailed Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas Detalladas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Puntuación Máxima</p>
                <p className="text-2xl">{analytics.max}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Puntuación Mínima</p>
                <p className="text-2xl">{analytics.min}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Rango</p>
                <p className="text-2xl">{analytics.max - analytics.min}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Mediana</p>
                <p className="text-2xl">
                  {groupStudents.length > 0
                    ? groupStudents.sort((a, b) => (a.totalPoints || 0) - (b.totalPoints || 0))[
                        Math.floor(groupStudents.length / 2)
                      ]?.totalPoints || 0
                    : 0}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
