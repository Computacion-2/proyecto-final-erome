import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Box,
  Typography,
  Link,
  Alert,
  Container,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useAuth } from '../hooks/useAuth';
import FormWrapper from '../components/forms/FormWrapper';
import { RegisterRequest } from '../types';

const RegisterPage: React.FC = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<RegisterRequest>({
    name: '',
    email: '',
    password: '',
    group: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await register(formData);
      setSuccess('Registro exitoso. Ahora puedes iniciar sesión.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Error al registrarse. Intenta de nuevo.'
      );
    }
  };

  return (
    <Container maxWidth="sm">
      <FormWrapper
        title="Registrarse"
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitText="Registrarse"
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Nombre Completo"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          margin="normal"
          autoComplete="name"
          autoFocus
        />

        <TextField
          fullWidth
          label="Correo Electrónico"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          margin="normal"
          autoComplete="email"
        />

        <TextField
          fullWidth
          label="Grupo (Opcional)"
          name="group"
          value={formData.group}
          onChange={handleChange}
          margin="normal"
          placeholder="Ej: Grupo A, Sección 1"
        />

        <TextField
          fullWidth
          label="Contraseña"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          margin="normal"
          autoComplete="new-password"
        />

        <TextField
          fullWidth
          label="Confirmar Contraseña"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          margin="normal"
          autoComplete="new-password"
        />

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            ¿Ya tienes una cuenta?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/login')}
            >
              Inicia sesión aquí
            </Link>
          </Typography>
        </Box>
      </FormWrapper>
    </Container>
  );
};

export default RegisterPage;
