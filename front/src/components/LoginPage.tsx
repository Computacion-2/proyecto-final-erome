import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { GraduationCap, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export function LoginPage({ onSwitchToRegister }: LoginPageProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    console.log('Login form submitted', { email, hasPassword: !!password, passwordLength: password?.length, passwordValue: password ? '***' : 'empty' });
    
    if (!email || !email.trim()) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }
    
    if (!password) {
      setError('Por favor ingresa tu contraseña');
      return;
    }
    
    if (password.trim().length === 0) {
      setError('Por favor ingresa tu contraseña');
      return;
    }
    
    setLoading(true);

    try {
      console.log('Calling login function', { email: email.trim(), passwordLength: password.length, passwordValue: password ? '***' : 'empty' });
      const success = await login(email.trim(), password);
      
      if (!success) {
        setError('Correo o contraseña incorrectos');
      }
    } catch (err: any) {
      console.error('Login error caught in handleSubmit:', err);
      setError(err?.message || 'Error al iniciar sesión. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <GraduationCap className="size-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Pensamiento Computacional</CardTitle>
          <CardDescription>
            Universidad Icesi - Facultad Barbieri
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
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@u.icesi.edu.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              ¿Eres estudiante y no tienes cuenta?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-blue-600 hover:underline"
              >
                Regístrate aquí
              </button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-center text-muted-foreground mb-2">
                Cuentas de prueba:
              </p>
              <div className="space-y-1 text-xs text-center text-muted-foreground">
                <p>Admin: admin@u.icesi.edu.co / admin123</p>
                <p>Profesor: jorge.quesada@icesi.edu.co / prof123</p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
