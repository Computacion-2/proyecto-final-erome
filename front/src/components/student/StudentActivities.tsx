import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useData } from '../DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Clock, CheckCircle2, Lock, AlertCircle, QrCode } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { LiveScoreboard } from './LiveScoreboard';
import { safeLocalStorage } from '../../lib/storage';

export function StudentActivities() {
  const { currentUser, users, updateProfile } = useAuth();
  const { activities, exercises, submissions, addSubmission, getActiveActivity } = useData();
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [submissionCode, setSubmissionCode] = useState('');
  const [selectedExerciseId, setSelectedExerciseId] = useState('');

  const activeActivity = getActiveActivity(currentUser?.group || '');
  const myActivities = activities.filter(a => a.group === currentUser?.group);
  const mySubmissions = submissions.filter(s => s.studentId === currentUser?.id);

  const handleSubmitCode = () => {
    if (!selectedExerciseId || !submissionCode) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    // In a real app, this would validate the code with the backend
    // For now, we'll generate random points
    const points = Math.floor(Math.random() * 50) + 50;

    const newSubmission = {
      id: Date.now().toString(),
      studentId: currentUser!.id,
      activityId: selectedActivity!,
      exerciseId: selectedExerciseId,
      points,
      submittedAt: new Date(),
      code: submissionCode,
    };

    addSubmission(newSubmission);

    // Update student's total points
    const totalPoints = (currentUser?.totalPoints || 0) + points;
    updateProfile({ totalPoints });

    // Automatically categorize student based on performance
    let performanceCategory: 'pro' | 'killer' | 'principiante' = 'principiante';
    if (totalPoints >= 500) performanceCategory = 'pro';
    else if (totalPoints >= 250) performanceCategory = 'killer';
    
    updateProfile({ performanceCategory });

    toast.success(`¡Ejercicio completado! +${points} puntos`);
    setSubmissionCode('');
    setSelectedExerciseId('');
    setSelectedActivity(null);

    // Broadcast to other students (simulated)
    broadcastSubmission(currentUser!.name, selectedExerciseId);
  };

  const broadcastSubmission = (studentName: string, exerciseId: string) => {
    // In a real app with WebSockets, this would broadcast to all connected clients
    // For now, we'll use localStorage events
    const event = {
      type: 'exercise_completed',
      studentName,
      exerciseId,
      timestamp: Date.now(),
    };
    safeLocalStorage.setItem('scoreboard_event', JSON.stringify(event));
    window.dispatchEvent(new Event('storage'));
  };

  const isExerciseCompleted = (activityId: string, exerciseId: string) => {
    return mySubmissions.some(s => s.activityId === activityId && s.exerciseId === exerciseId);
  };

  return (
    <div className="space-y-6">
      {/* Active Activity Alert */}
      {activeActivity && (
        <Alert className="border-green-200 bg-green-50">
          <AlertCircle className="size-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ¡Actividad en curso! <strong>{activeActivity.title}</strong> está activa ahora.
          </AlertDescription>
        </Alert>
      )}

      {/* Live Scoreboard for Active Activity */}
      {activeActivity && (
        <LiveScoreboard activityId={activeActivity.id} />
      )}

      {/* Activities List */}
      <div className="space-y-4">
        {myActivities.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No hay actividades disponibles para tu grupo
            </CardContent>
          </Card>
        ) : (
          myActivities
            .sort((a, b) => (b.startTime?.getTime() || 0) - (a.startTime?.getTime() || 0))
            .map((activity) => {
              const activityExercises = exercises.filter(e =>
                activity.exerciseIds.includes(e.id)
              );
              const completedCount = activityExercises.filter(e =>
                isExerciseCompleted(activity.id, e.id)
              ).length;

              return (
                <Card key={activity.id} className={activity.isActive ? 'border-blue-500' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {activity.title}
                          {activity.isActive && (
                            <Badge className="bg-green-500">Activa</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {activityExercises.length} ejercicios • {completedCount} completados
                        </CardDescription>
                      </div>
                      {activity.isActive ? (
                        <Clock className="size-5 text-green-600" />
                      ) : (
                        <Lock className="size-5 text-gray-400" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activityExercises.map((exercise) => {
                      const isCompleted = isExerciseCompleted(activity.id, exercise.id);
                      const submission = mySubmissions.find(
                        s => s.activityId === activity.id && s.exerciseId === exercise.id
                      );

                      return (
                        <div
                          key={exercise.id}
                          className={`p-4 rounded-lg border ${
                            isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4>{exercise.title}</h4>
                                {isCompleted && (
                                  <CheckCircle2 className="size-4 text-green-600" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {exercise.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <Badge variant="outline">
                                  Dificultad: {exercise.difficulty}/10
                                </Badge>
                                {isCompleted && submission && (
                                  <span className="text-sm text-green-600">
                                    {submission.points} puntos
                                  </span>
                                )}
                              </div>
                            </div>
                            {activity.isActive && !isCompleted && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedActivity(activity.id);
                                  setSelectedExerciseId(exercise.id);
                                }}
                              >
                                Entregar
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {!activity.isActive && (
                      <p className="text-sm text-center text-muted-foreground py-2">
                        Esta actividad ha finalizado
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })
        )}
      </div>

      {/* Submission Dialog */}
      <Dialog
        open={selectedActivity !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedActivity(null);
            setSelectedExerciseId('');
            setSubmissionCode('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entregar Ejercicio</DialogTitle>
            <DialogDescription>
              Ingresa el código proporcionado por el profesor
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código de verificación</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  placeholder="Ej: ABC123 o escanea QR"
                  value={submissionCode}
                  onChange={(e) => setSubmissionCode(e.target.value.toUpperCase())}
                />
                <Button variant="outline" size="icon">
                  <QrCode className="size-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                El profesor te proporcionará este código al revisar tu solución
              </p>
            </div>
            <Button onClick={handleSubmitCode} className="w-full">
              Confirmar Entrega
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}