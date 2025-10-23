import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  IconButton,
} from '@mui/material';
import {
  GitHub,
  LinkedIn,
  Email,
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Pensamiento Computacional
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sistema de gestión para el curso de Pensamiento Computacional.
              Herramienta educativa para estudiantes y profesores.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Enlaces Rápidos
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link href="/dashboard" color="inherit" underline="hover">
                Dashboard
              </Link>
              <Link href="/users" color="inherit" underline="hover">
                Usuarios
              </Link>
              <Link href="/students" color="inherit" underline="hover">
                Estudiantes
              </Link>
              <Link href="/settings" color="inherit" underline="hover">
                Configuración
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Soporte
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link href="/help" color="inherit" underline="hover">
                Ayuda
              </Link>
              <Link href="/documentation" color="inherit" underline="hover">
                Documentación
              </Link>
              <Link href="/contact" color="inherit" underline="hover">
                Contacto
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Conecta
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                aria-label="GitHub"
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHub />
              </IconButton>
              <IconButton
                aria-label="LinkedIn"
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedIn />
              </IconButton>
              <IconButton
                aria-label="Email"
                href="mailto:support@example.com"
              >
                <Email />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
        
        <Box
          sx={{
            borderTop: 1,
            borderColor: 'divider',
            pt: 2,
            mt: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Pensamiento Computacional. Todos los derechos reservados.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="/privacy" color="inherit" underline="hover">
              Política de Privacidad
            </Link>
            <Link href="/terms" color="inherit" underline="hover">
              Términos de Uso
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
