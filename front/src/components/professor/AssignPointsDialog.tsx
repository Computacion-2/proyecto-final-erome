import React, { useState } from 'react';
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

  const activity = activities.find(a => a.id === activityId);
  if (!activity) return null;

  const activityExercises = exercises.filter(e => activity.exerciseIds.includes(e.id));
  const groupStudents = users.filter(u => u.role === 'student' && u.group === activity.group);

  const generateCode = () => {
    if (!selectedStudent || !selectedExercise || !points) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedCode(code);

    // Immediately assign the points
    const student = groupStudents.find(s => s.id === selectedStudent);
    const submission = {
      id: Date.now().toString(),
      studentId: selectedStudent,
      activityId,
      exerciseId: selectedExercise,
      points: parseInt(points),
      submittedAt: new Date(),
      code,
    };

    addSubmission(submission);

    // Update student's total points
    const currentPoints = student?.totalPoints || 0;
    const newTotalPoints = currentPoints + parseInt(points);
    
    // Update performance category
    let performanceCategory: 'pro' | 'killer' | 'principiante' = 'principiante';
    if (newTotalPoints >= 500) performanceCategory = 'pro';
    else if (newTotalPoints >= 250) performanceCategory = 'killer';

    // We need to update the student's profile through the auth context
    // Since we don't have direct access here, we'll store it in localStorage
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = allUsers.map((u: any) => 
      u.id === selectedStudent 
        ? { ...u, totalPoints: newTotalPoints, performanceCategory }
        : u
    );
    safeLocalStorage.setItem('users', JSON.stringify(updatedUsers));

    toast.success(`Código generado: ${code}. El estudiante puede usarlo para confirmar la entrega.`);
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
                {groupStudents.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    <div className="flex items-center gap-2">
                      {student.name}
                    </div>
                  </SelectItem>
                ))}
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