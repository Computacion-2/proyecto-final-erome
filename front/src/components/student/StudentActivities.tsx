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
  const { currentUser, users, updateProfile, refreshCurrentUser, refreshUsers } = useAuth();
  const { activities, exercises, submissions, addSubmission, getActiveActivity, refreshData } = useData();
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [submissionCode, setSubmissionCode] = useState('');
  const [selectedExerciseId, setSelectedExerciseId] = useState('');

  const activeActivity = getActiveActivity(currentUser?.group || '');
  const myActivities = activities.filter(a => a.group === currentUser?.group);
  const mySubmissions = submissions.filter(s => s.studentId === currentUser?.id);
  
  // Find pending resolutions with codes assigned by professor
  const pendingResolutionsWithCode = mySubmissions.filter(s => 
    s.code && s.code.length > 0 && s.points > 0 && 
    !mySubmissions.some(sub => 
      sub.exerciseId === s.exerciseId && 
      sub.activityId === s.activityId && 
      sub.id !== s.id &&
      sub.points === s.points
    )
  );

  const handleValidateCode = async () => {
    if (!selectedExerciseId || !submissionCode) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      // Find the pending resolution for this exercise
      const pendingResolution = mySubmissions.find(s => {
        // Normalize activityId comparison
        const submissionActivityId = s.activityId?.toString().trim() || '';
        const expectedActivityId = selectedActivity?.toString().trim() || '';
        const activityMatches = submissionActivityId === expectedActivityId || 
                                (submissionActivityId === '' && expectedActivityId !== '');
        
        return s.exerciseId === selectedExerciseId && 
               activityMatches &&
               s.status === 'PENDING' &&
               s.code &&
               s.code.length > 0 &&
               s.points > 0;
      });

      if (!pendingResolution) {
        toast.error('No se encontró una resolución pendiente para este ejercicio');
        return;
      }

      // Validate the code with backend
      const { resolutionsApi } = await import('../../lib/api/resolutions');
      const validatedResolution = await resolutionsApi.validateCode(
        parseInt(pendingResolution.id),
        submissionCode.trim().toUpperCase()
      );

      console.log('Validated resolution from backend:', validatedResolution);

      // Update student's total points
      const points = validatedResolution.pointsAwarded || pendingResolution.points || 0;
      const totalPoints = (currentUser?.totalPoints || 0) + points;
      updateProfile({ totalPoints });

      // Automatically categorize student based on performance
      let performanceCategory: 'pro' | 'killer' | 'principiante' = 'principiante';
      if (totalPoints >= 500) performanceCategory = 'pro';
      else if (totalPoints >= 250) performanceCategory = 'killer';
      
      updateProfile({ performanceCategory });

      toast.success(`¡Código validado! +${points} puntos`);
      
      // Close dialog first
      setSubmissionCode('');
      setSelectedExerciseId('');
      setSelectedActivity(null);

      // Refresh current user to get updated totalPoints from backend
      await refreshCurrentUser();
      
      // Refresh all users for podium/leaderboard
      await refreshUsers();
      
      // Refresh data to show updated resolution and update insights
      await refreshData();
      
      // Also trigger a window event to force React to re-render
      window.dispatchEvent(new Event('resolutions-updated'));
    } catch (error: any) {
      console.error('Failed to validate code:', error);
      if (error?.status === 400) {
        toast.error('Código inválido. Por favor verifica el código e intenta de nuevo.');
      } else {
        toast.error('Error al validar el código. Por favor intenta de nuevo.');
      }
    }
  };

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
    return mySubmissions.some(s => {
      // Normalize activityId comparison
      const submissionActivityId = s.activityId?.toString().trim() || '';
      const expectedActivityId = activityId?.toString().trim() || '';
      const activityMatches = submissionActivityId === expectedActivityId || 
                              (submissionActivityId === '' && expectedActivityId !== '');
      
      return activityMatches &&
        s.exerciseId === exerciseId && 
        s.status === 'COMPLETED';
    });
  };
  
  const hasPendingResolutionWithCode = (activityId: string, exerciseId: string) => {
    return mySubmissions.some(s => {
      // Normalize activityId comparison (handle empty strings and nulls)
      const submissionActivityId = s.activityId?.toString().trim() || '';
      const expectedActivityId = activityId?.toString().trim() || '';
      
      // Also check if exercise matches and has code
      const exerciseMatches = s.exerciseId === exerciseId;
      const hasCode = s.code && s.code.length > 0;
      const hasPoints = s.points > 0;
      const isPending = s.status === 'PENDING';
      
      // If activityId is empty in submission, we can still match by exerciseId only
      // This handles cases where the exercise might not have activityId set yet
      const activityMatches = submissionActivityId === expectedActivityId || 
                              (submissionActivityId === '' && expectedActivityId !== '');
      
      return exerciseMatches && activityMatches && isPending && hasCode && hasPoints;
    });
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
                        s => s.activityId === activity.id && 
                        s.exerciseId === exercise.id &&
                        s.status === 'COMPLETED'
                      );
                      
                      // Check if there's a pending resolution with code assigned by professor
                      // Only show if not already completed
                      const pendingWithCode = !isCompleted && hasPendingResolutionWithCode(activity.id, exercise.id);
                      const pendingResolution = !isCompleted ? mySubmissions.find(s => {
                        // Normalize activityId comparison
                        const submissionActivityId = s.activityId?.toString().trim() || '';
                        const expectedActivityId = activity.id?.toString().trim() || '';
                        const activityMatches = submissionActivityId === expectedActivityId || 
                                                (submissionActivityId === '' && expectedActivityId !== '');
                        
                        return activityMatches &&
                          s.exerciseId === exercise.id &&
                          s.status === 'PENDING' &&
                          s.code && 
                          s.code.length > 0 && 
                          s.points > 0;
                      }) : null;

                      return (
                        <div
                          key={exercise.id}
                          className={`p-4 rounded-lg border ${
                            isCompleted ? 'bg-green-50 border-green-200' : 
                            pendingWithCode ? 'bg-yellow-50 border-yellow-200' : 
                            'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4>{exercise.title}</h4>
                                {isCompleted && (
                                  <CheckCircle2 className="size-4 text-green-600" />
                                )}
                                {pendingWithCode && !isCompleted && (
                                  <QrCode className="size-4 text-yellow-600" />
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
                                {pendingWithCode && !isCompleted && pendingResolution && (
                                  <span className="text-sm text-yellow-600 font-medium">
                                    Código asignado: {pendingResolution.points} puntos pendientes
                                  </span>
                                )}
                              </div>
                            </div>
                            {!isCompleted && (
                              <Button
                                size="sm"
                                variant={pendingWithCode ? "default" : "outline"}
                                onClick={() => {
                                  setSelectedActivity(activity.id);
                                  setSelectedExerciseId(exercise.id);
                                }}
                              >
                                {pendingWithCode ? "Validar Código" : activity.isActive ? "Entregar" : "Ver Detalles"}
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
            <DialogTitle>
              {(() => {
                const pending = mySubmissions.find(s => {
                  const submissionActivityId = s.activityId?.toString().trim() || '';
                  const expectedActivityId = selectedActivity?.toString().trim() || '';
                  const activityMatches = submissionActivityId === expectedActivityId || 
                                          (submissionActivityId === '' && expectedActivityId !== '');
                  
                  return activityMatches &&
                    s.exerciseId === selectedExerciseId &&
                    s.status === 'PENDING' &&
                    s.code && 
                    s.code.length > 0 && 
                    s.points > 0;
                });
                return pending ? "Validar Código" : "Entregar Ejercicio";
              })()}
            </DialogTitle>
            <DialogDescription>
              {(() => {
                const pending = mySubmissions.find(s => {
                  const submissionActivityId = s.activityId?.toString().trim() || '';
                  const expectedActivityId = selectedActivity?.toString().trim() || '';
                  const activityMatches = submissionActivityId === expectedActivityId || 
                                          (submissionActivityId === '' && expectedActivityId !== '');
                  
                  return activityMatches &&
                    s.exerciseId === selectedExerciseId &&
                    s.status === 'PENDING' &&
                    s.code && 
                    s.code.length > 0 && 
                    s.points > 0;
                });
                return pending ? (
                  <>
                    El profesor ha asignado puntos a tu entrega. Ingresa el código para validar y recibir los puntos.
                    <span className="block mt-2 text-sm font-medium text-yellow-600">
                      Puntos asignados: {pending.points}
                    </span>
                  </>
                ) : (
                  "Ingresa el código proporcionado por el profesor"
                );
              })()}
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
                {(() => {
                  const pending = mySubmissions.find(s => {
                    const submissionActivityId = s.activityId?.toString().trim() || '';
                    const expectedActivityId = selectedActivity?.toString().trim() || '';
                    const activityMatches = submissionActivityId === expectedActivityId || 
                                            (submissionActivityId === '' && expectedActivityId !== '');
                    
                    return activityMatches &&
                      s.exerciseId === selectedExerciseId &&
                      s.status === 'PENDING' &&
                      s.code && 
                      s.code.length > 0 && 
                      s.points > 0;
                  });
                  return pending ? (
                    "Ingresa el código que el profesor te proporcionó para validar tu entrega y recibir los puntos."
                  ) : (
                    "El profesor te proporcionará este código al revisar tu solución"
                  );
                })()}
              </p>
            </div>
            <Button 
              onClick={
                (() => {
                  const pending = mySubmissions.find(s => {
                    const submissionActivityId = s.activityId?.toString().trim() || '';
                    const expectedActivityId = selectedActivity?.toString().trim() || '';
                    const activityMatches = submissionActivityId === expectedActivityId || 
                                            (submissionActivityId === '' && expectedActivityId !== '');
                    
                    return activityMatches &&
                      s.exerciseId === selectedExerciseId &&
                      s.status === 'PENDING' &&
                      s.code && 
                      s.code.length > 0 && 
                      s.points > 0;
                  });
                  return pending ? handleValidateCode : handleSubmitCode;
                })()
              } 
              className="w-full"
            >
              {(() => {
                const pending = mySubmissions.find(s => {
                  const submissionActivityId = s.activityId?.toString().trim() || '';
                  const expectedActivityId = selectedActivity?.toString().trim() || '';
                  const activityMatches = submissionActivityId === expectedActivityId || 
                                          (submissionActivityId === '' && expectedActivityId !== '');
                  
                  return activityMatches &&
                    s.exerciseId === selectedExerciseId &&
                    s.status === 'PENDING' &&
                    s.code && 
                    s.code.length > 0 && 
                    s.points > 0;
                });
                return pending ? "Validar Código" : "Confirmar Entrega";
              })()}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}