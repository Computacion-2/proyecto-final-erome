import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useData } from '../DataContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function ProfessorExercises() {
  const { currentUser } = useAuth();
  const { exercises, addExercise, updateExercise, deleteExercise } = useData();
  const [open, setOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 5,
  });

  const myExercises = exercises.filter(e => e.createdBy === currentUser?.id);

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      if (editingExercise) {
        await updateExercise(editingExercise, formData);
        toast.success('Ejercicio actualizado');
        setOpen(false);
        resetForm();
      } else {
        await addExercise({
          id: Date.now().toString(),
          ...formData,
          createdBy: currentUser!.id,
        });
        toast.success('Ejercicio creado');
        setOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving exercise:', error);
      toast.error('Error al guardar el ejercicio. Por favor intenta de nuevo.');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', difficulty: 5 });
    setEditingExercise(null);
  };

  const handleEdit = (exercise: any) => {
    setFormData({
      title: exercise.title,
      description: exercise.description,
      difficulty: exercise.difficulty,
    });
    setEditingExercise(exercise.id);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este ejercicio?')) {
      deleteExercise(id);
      toast.success('Ejercicio eliminado');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Banco de Ejercicios</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona los ejercicios de programación
          </p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Nuevo Ejercicio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingExercise ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
              </DialogTitle>
              <DialogDescription>
                Crea un ejercicio de programación para usar en actividades
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título del ejercicio</Label>
                <Input
                  id="title"
                  placeholder="Ej: Suma de dos números"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Enunciado / Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el problema que los estudiantes deben resolver..."
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">
                  Nivel de dificultad: {formData.difficulty}/10
                </Label>
                <Slider
                  id="difficulty"
                  min={0}
                  max={10}
                  step={1}
                  value={[formData.difficulty]}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value[0] })}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Muy fácil</span>
                  <span>Muy difícil</span>
                </div>
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingExercise ? 'Actualizar Ejercicio' : 'Crear Ejercicio'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {myExercises.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="size-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No has creado ejercicios aún. Comienza creando tu primer ejercicio.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {myExercises.map((exercise) => (
            <Card key={exercise.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{exercise.title}</CardTitle>
                    <CardDescription className="mt-2">{exercise.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    Dificultad: {exercise.difficulty}/10
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(exercise)}
                    >
                      <Edit2 className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(exercise.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
