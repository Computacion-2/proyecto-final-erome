import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  TextField,
  Box,
  Typography,
  Link,
  Alert,
  Container,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import FormWrapper from '../components/forms/FormWrapper';
import { LoginRequest } from '../types';

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');

  const from = (location.state as any)?.from?.pathname || '/dashboard';

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

    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Error al iniciar sesión. Verifica tus credenciales.'
      );
    }
  };

  return (
    <Container maxWidth='sm'>
      <FormWrapper
        title='Iniciar Sesión'
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitText='Iniciar Sesión'
      >
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label='Correo Electrónico'
          name='email'
          type='email'
          value={formData.email}
          onChange={handleChange}
          required
          margin='normal'
          autoComplete='email'
          autoFocus
        />

        <TextField
          fullWidth
          label='Contraseña'
          name='password'
          type='password'
          value={formData.password}
          onChange={handleChange}
          required
          margin='normal'
          autoComplete='current-password'
        />

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant='body2'>
            ¿No tienes una cuenta?{' '}
            <Link
              component='button'
              variant='body2'
              onClick={() => navigate('/register')}
            >
              Regístrate aquí
            </Link>
          </Typography>
        </Box>
      </FormWrapper>
    </Container>
  );
};

export default LoginPage;
