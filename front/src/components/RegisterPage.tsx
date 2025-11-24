import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { GraduationCap, AlertCircle, Upload } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    group: '',
    studentRole: 'principiante' as 'pro' | 'killer' | 'principiante',
    profilePhoto: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.email.endsWith('@u.icesi.edu.co')) {
      setError('Debes usar tu correo institucional (@u.icesi.edu.co)');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    const success = await register({
      name: formData.name,
      email: formData.email,
      role: 'student',
      group: formData.group,
      studentRole: formData.studentRole,
      profilePhoto: formData.profilePhoto || undefined,
    }, formData.password);

    if (!success) {
      setError('Este correo ya está registrado');
      setLoading(false);
      return;
    }

    // Registration successful, user will be logged in automatically
    setLoading(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePhoto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <GraduationCap className="size-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Registro de Estudiante</CardTitle>
          <CardDescription>
            Crea tu cuenta para acceder a la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo institucional</Label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@u.icesi.edu.co"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="group">Grupo</Label>
              <Select
                value={formData.group}
                onValueChange={(value) => setFormData({ ...formData, group: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="G1">G1</SelectItem>
                  <SelectItem value="G2">G2</SelectItem>
                  <SelectItem value="G3">G3</SelectItem>
                  <SelectItem value="G4">G4</SelectItem>
                  <SelectItem value="G5">G5</SelectItem>
                  <SelectItem value="G6">G6</SelectItem>
                  <SelectItem value="G7">G7</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentRole">Tu nivel de programación</Label>
              <Select
                value={formData.studentRole}
                onValueChange={(value: any) => setFormData({ ...formData, studentRole: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="principiante">Principiante (Nunca he programado)</SelectItem>
                  <SelectItem value="killer">Killer (Tengo experiencia media)</SelectItem>
                  <SelectItem value="pro">Pro (Ya sé programar bien)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Foto de perfil (opcional)</Label>
              <div className="flex items-center gap-2">
                {formData.profilePhoto && (
                  <img
                    src={formData.profilePhoto}
                    alt="Preview"
                    className="size-12 rounded-full object-cover"
                  />
                )}
                <Label
                  htmlFor="photo"
                  className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent"
                >
                  <Upload className="size-4" />
                  Subir foto
                </Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:underline"
              >
                Inicia sesión
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
