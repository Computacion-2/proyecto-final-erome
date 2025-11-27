import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useData } from '../DataContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { QrCode } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { safeLocalStorage } from '../../lib/storage';
import { studentsApi } from '../../lib/api/students';
import type { Student } from '../../lib/api/students';

interface AssignPointsDialogProps {
  activityId: string;
  onClose: () => void;
}

export function AssignPointsDialog({ activityId, onClose }: AssignPointsDialogProps) {
  const { users, updateProfile } = useAuth();
  const { activities, exercises, addSubmission } = useData();
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [points, setPoints] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [groupStudents, setGroupStudents] = useState<Student[]>([]);

  const activity = activities.find(a => a.id === activityId);
  
  useEffect(() => {
    const loadStudents = async () => {
      if (!activity?.group) {
        console.log('AssignPointsDialog: No activity group found', activity);
        toast.error('La actividad no tiene un grupo asignado');
        return;
      }
      
      const groupName = activity.group.trim();
      console.log('AssignPointsDialog: Loading students for group:', groupName);
      console.log('AssignPointsDialog: Activity:', activity);
      console.log('AssignPointsDialog: Total users in context:', users.length);
      console.log('AssignPointsDialog: Students in context:', users.filter(u => u.role === 'student').map(u => ({ name: u.name, group: u.group })));
      
      // Always try to get students from users context first (most reliable)
      const studentsFromContext = users
        .filter(u => {
          if (u.role !== 'student') return false;
          const userGroup = (u.group || '').trim();
          const matches = userGroup.toLowerCase() === groupName.toLowerCase() || 
                         userGroup === groupName;
          if (matches) {
            console.log(`AssignPointsDialog: Found student in context: ${u.name} (group: "${userGroup}")`);
          }
          return matches;
        })
        .map(u => ({
          id: parseInt(u.id),
          name: u.name,
          email: u.email,
          group: u.group,
          totalPoints: u.totalPoints || 0,
          performanceCategory: u.performanceCategory,
        }));
      
      console.log('AssignPointsDialog: Students from context:', studentsFromContext);
      
      // If we found students in context, use them immediately
      if (studentsFromContext.length > 0) {
        setGroupStudents(studentsFromContext);
        console.log('AssignPointsDialog: Using students from context');
      } else {
        // Try API as fallback
        try {
          const students = await studentsApi.getStudentsByGroup(groupName);
          console.log('AssignPointsDialog: Students loaded from API:', students);
          
          if (students.length > 0) {
            setGroupStudents(students);
          } else {
            console.warn('AssignPointsDialog: No students found from API or context for group:', groupName);
            console.warn('AssignPointsDialog: All students in context:', users.filter(u => u.role === 'student').map(u => ({ name: u.name, group: u.group })));
            toast.error(`No se encontraron estudiantes en el grupo "${groupName}". Verifica que los estudiantes estén asignados a este grupo desde el panel de administración.`);
            setGroupStudents([]);
          }
        } catch (error: any) {
          console.error('AssignPointsDialog: Failed to load students from API:', error);
          console.warn('AssignPointsDialog: No students found for group:', groupName);
          console.warn('AssignPointsDialog: All students in context:', users.filter(u => u.role === 'student').map(u => ({ name: u.name, group: u.group })));
          toast.error(`Error al cargar estudiantes. No se encontraron estudiantes en el grupo "${groupName}". Verifica que los estudiantes estén asignados a este grupo desde el panel de administración.`);
          setGroupStudents([]);
        }
      }
    };
    
    // Only load if we have users loaded
    if (users.length > 0 || activity?.group) {
      loadStudents();
    }
  }, [activity?.group, activity?.id, users]);

  if (!activity) return null;

  const activityExercises = exercises.filter(e => activity.exerciseIds.includes(e.id));

  const generateCode = async () => {
    if (!selectedStudent || !selectedExercise || !points) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedCode(code);

    try {
      // Create or update resolution with code in backend
      const { resolutionsApi } = await import('../../lib/api/resolutions');
      const resolution = await resolutionsApi.createOrUpdateResolution(
        parseInt(selectedStudent),
        parseInt(selectedExercise),
        parseInt(points),
        code
      );

      // Don't call addSubmission here - the resolution is already created in the backend
      // The student will see it when they refresh their data
      
      toast.success(`Código generado: ${code}. El estudiante debe ingresar este código para confirmar la entrega y recibir los puntos.`);
      
      // Reset form
      handleReset();
    } catch (error) {
      console.error('Failed to create/update resolution:', error);
      toast.error('Error al guardar el código. Por favor intenta de nuevo.');
    }
  };

  const handleReset = () => {
    setSelectedStudent('');
    setSelectedExercise('');
    setPoints('');
    setGeneratedCode('');
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar Puntos</DialogTitle>
          <DialogDescription>
            Genera un código para que el estudiante confirme su entrega
            {activity.group && (
              <span className="block mt-1 text-xs text-muted-foreground">
                Grupo: {activity.group}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Estudiante</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estudiante" />
              </SelectTrigger>
              <SelectContent>
                {groupStudents.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    <div className="font-medium">No hay estudiantes en el grupo "{activity.group}"</div>
                    <div className="text-xs mt-2 space-y-1">
                      <div>• Verifica que los estudiantes estén asignados a este grupo desde el panel de administración.</div>
                      <div>• Asegúrate de que el nombre del grupo coincida exactamente (incluyendo mayúsculas/minúsculas).</div>
                      <div className="mt-2 text-xs font-mono bg-gray-100 p-1 rounded">
                        Grupo buscado: "{activity.group}"
                      </div>
                    </div>
                  </div>
                ) : (
                  groupStudents.map(student => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      <div className="flex items-center gap-2">
                        {student.name}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ejercicio</Label>
            <Select value={selectedExercise} onValueChange={setSelectedExercise}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un ejercicio" />
              </SelectTrigger>
              <SelectContent>
                {activityExercises.map(exercise => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    {exercise.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="points">Puntos (0-100)</Label>
            <Input
              id="points"
              type="number"
              min="0"
              max="100"
              placeholder="Ej: 85"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />
          </div>

          {generatedCode ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <QrCode className="size-12 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-muted-foreground mb-1">Código generado:</p>
              <p className="text-2xl font-mono tracking-wider text-green-700">{generatedCode}</p>
              <p className="text-xs text-muted-foreground mt-2">
                El estudiante debe ingresar este código para confirmar
              </p>
              <Button variant="outline" size="sm" className="mt-3" onClick={handleReset}>
                Generar otro código
              </Button>
            </div>
          ) : (
            <Button onClick={generateCode} className="w-full">
              <QrCode className="size-4 mr-2" />
              Generar Código
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}