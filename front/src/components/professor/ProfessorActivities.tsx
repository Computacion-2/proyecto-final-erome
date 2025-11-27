import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useData } from '../DataContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Plus, Play, Square, Users, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { AssignPointsDialog } from './AssignPointsDialog';

export function ProfessorActivities() {
  const { currentUser, users } = useAuth();
  const { exercises, activities, addActivity, updateActivity, submissions, getCurrentSemester } = useData();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    group: '',
    selectedExercises: [] as string[],
  });
  const [assignPointsActivity, setAssignPointsActivity] = useState<string | null>(null);
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);

  React.useEffect(() => {
    const loadGroups = async () => {
      try {
        const { groupsApi } = await import('../../lib/api/groups');
        const groups = await groupsApi.getAllGroups();
        setAvailableGroups(groups.map(g => g.name));
      } catch (error) {
        console.error('Failed to load groups:', error);
        // Fallback to user groups if API fails
        setAvailableGroups(currentUser?.groups || []);
      }
    };
    loadGroups();
  }, [currentUser]);

  const currentSemester = getCurrentSemester();
  const myGroups = availableGroups.length > 0 ? availableGroups : (currentUser?.groups || []);
  const myExercises = exercises.filter(e => e.createdBy === currentUser?.id);
  const myActivities = activities.filter(
    a => a.createdBy === currentUser?.id && a.semester === currentSemester
  );

  const handleSubmit = async () => {
    if (!formData.title || !formData.group || formData.selectedExercises.length === 0) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      await addActivity({
        id: Date.now().toString(),
        title: formData.title,
        group: formData.group,
        exerciseIds: formData.selectedExercises,
        createdBy: currentUser!.id,
        isActive: false,
        semester: currentSemester,
      });

      toast.success('Actividad creada');
      setOpen(false);
      setFormData({ title: '', group: '', selectedExercises: [] });
    } catch (error) {
      console.error('Error creating activity:', error);
      toast.error('Error al crear la actividad. Por favor intenta de nuevo.');
    }
  };

  const handleToggleActivity = (activityId: string, currentStatus: boolean) => {
    if (!currentStatus) {
      // Activating
      const activity = activities.find(a => a.id === activityId);
      if (activity) {
        updateActivity(activityId, {
          isActive: true,
          startTime: new Date(),
        });
        toast.success(`Actividad "${activity.title}" activada`);
      }
    } else {
      // Deactivating
      updateActivity(activityId, {
        isActive: false,
        endTime: new Date(),
      });
      toast.success('Actividad finalizada');
    }
  };

  const toggleExercise = (exerciseId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedExercises: prev.selectedExercises.includes(exerciseId)
        ? prev.selectedExercises.filter(id => id !== exerciseId)
        : [...prev.selectedExercises, exerciseId],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Actividades</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona las actividades de clase
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Nueva Actividad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nueva Actividad</DialogTitle>
              <DialogDescription>
                Crea una actividad compuesta por uno o más ejercicios
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título de la actividad</Label>
                <Input
                  id="title"
                  placeholder="Ej: Práctica de Condicionales"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="group">Grupo</Label>
                <Select
                  value={formData.group}
                  onValueChange={(value) => setFormData({ ...formData, group: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {myGroups.map(group => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ejercicios ({formData.selectedExercises.length} seleccionados)</Label>
                {myExercises.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg">
                    No tienes ejercicios creados. Crea ejercicios primero.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                    {myExercises.map(exercise => (
                      <div
                        key={exercise.id}
                        className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg"
                      >
                        <Checkbox
                          id={exercise.id}
                          checked={formData.selectedExercises.includes(exercise.id)}
                          onCheckedChange={() => toggleExercise(exercise.id)}
                        />
                        <div className="flex-1">
                          <Label htmlFor={exercise.id} className="cursor-pointer">
                            {exercise.title}
                          </Label>
                          <p className="text-xs text-muted-foreground">{exercise.description}</p>
                          <Badge variant="outline" className="mt-1">
                            Dificultad: {exercise.difficulty}/10
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={handleSubmit} className="w-full">
                Crear Actividad
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {myActivities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="size-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No has creado actividades aún. Comienza creando tu primera actividad.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {myActivities
            .sort((a, b) => (b.startTime?.getTime() || 0) - (a.startTime?.getTime() || 0))
            .map((activity) => {
              const activityExercises = exercises.filter(e =>
                activity.exerciseIds.includes(e.id)
              );
              const activitySubmissions = submissions.filter(s => s.activityId === activity.id);
              const uniqueStudents = new Set(activitySubmissions.map(s => s.studentId)).size;
              const groupStudents = users.filter(
                u => u.role === 'student' && u.group === activity.group
              ).length;

              return (
                <Card key={activity.id} className={activity.isActive ? 'border-green-500' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle>{activity.title}</CardTitle>
                          {activity.isActive && (
                            <Badge className="bg-green-500">Activa</Badge>
                          )}
                        </div>
                        <CardDescription className="mt-2">
                          Grupo {activity.group} • {activityExercises.length} ejercicios
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={activity.isActive ? 'destructive' : 'default'}
                          onClick={() => handleToggleActivity(activity.id, activity.isActive)}
                        >
                          {activity.isActive ? (
                            <>
                              <Square className="size-4 mr-2" />
                              Finalizar
                            </>
                          ) : (
                            <>
                              <Play className="size-4 mr-2" />
                              Activar
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAssignPointsActivity(activity.id)}
                        >
                          <CheckCircle2 className="size-4 mr-2" />
                          Asignar Puntos
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          {uniqueStudents}/{groupStudents} estudiantes participando
                        </span>
                        <span>•</span>
                        <span>
                          {activitySubmissions.length} ejercicios entregados
                        </span>
                      </div>

                      <div className="grid gap-2">
                        {activityExercises.map(exercise => (
                          <div
                            key={exercise.id}
                            className="p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm">{exercise.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {exercise.description}
                                </p>
                              </div>
                              <Badge variant="outline">
                                {activitySubmissions.filter(s => s.exerciseId === exercise.id).length} entregas
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}

      {assignPointsActivity && (
        <AssignPointsDialog
          activityId={assignPointsActivity}
          onClose={() => setAssignPointsActivity(null)}
        />
      )}
    </div>
  );
}
