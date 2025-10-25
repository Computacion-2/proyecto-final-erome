import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  School,
  Email,
  LocationOn,
  Phone,
  GitHub,
  LinkedIn,
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component='footer'
      sx={{
        py: 4,
        px: 2,
        mt: 'auto',
        backgroundColor: 'primary.main',
        color: 'white',
      }}
    >
      <Container maxWidth='lg'>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'white', color: 'primary.main', mr: 2 }}>
                <School />
              </Avatar>
              <Typography variant='h6' fontWeight='bold'>
                Pensamiento Computacional
              </Typography>
            </Box>
            <Typography variant='body2' sx={{ mb: 2, opacity: 0.9 }}>
              Plataforma educativa gamificada para el aprendizaje de algoritmos
              y programación en Python. Universidad Icesi - Escuela Barbieri.
            </Typography>
            <Typography variant='body2' sx={{ opacity: 0.8 }}>
              © {currentYear} Universidad Icesi. Todos los derechos reservados.
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant='h6' gutterBottom fontWeight='bold'>
              Universidad Icesi
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOn sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant='body2' sx={{ opacity: 0.9 }}>
                Calle 18 No. 122-135, Pance, Cali, Colombia
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Phone sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant='body2' sx={{ opacity: 0.9 }}>
                +57 (2) 555 2334
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Email sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant='body2' sx={{ opacity: 0.9 }}>
                info@icesi.edu.co
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant='h6' gutterBottom fontWeight='bold'>
              Enlaces Útiles
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                href='https://www.icesi.edu.co'
                color='inherit'
                sx={{
                  textDecoration: 'none',
                  opacity: 0.9,
                  '&:hover': { opacity: 1 },
                }}
              >
                Universidad Icesi
              </Link>
              <Link
                href='https://www.icesi.edu.co/escuela-barbieri'
                color='inherit'
                sx={{
                  textDecoration: 'none',
                  opacity: 0.9,
                  '&:hover': { opacity: 1 },
                }}
              >
                Escuela Barbieri
              </Link>
              <Link
                href='https://www.icesi.edu.co/programas/ingenieria-de-sistemas'
                color='inherit'
                sx={{
                  textDecoration: 'none',
                  opacity: 0.9,
                  '&:hover': { opacity: 1 },
                }}
              >
                Ingeniería de Sistemas
              </Link>
              <Link
                href='https://www.icesi.edu.co/recursos-estudiantes'
                color='inherit'
                sx={{
                  textDecoration: 'none',
                  opacity: 0.9,
                  '&:hover': { opacity: 1 },
                }}
              >
                Recursos para Estudiantes
              </Link>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant='h6' gutterBottom>
              Conecta
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                aria-label='GitHub'
                href='https://github.com'
                target='_blank'
                rel='noopener noreferrer'
              >
                <GitHub />
              </IconButton>
              <IconButton
                aria-label='LinkedIn'
                href='https://linkedin.com'
                target='_blank'
                rel='noopener noreferrer'
              >
                <LinkedIn />
              </IconButton>
              <IconButton aria-label='Email' href='mailto:support@example.com'>
                <Email />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{
            borderTop: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)',
            pt: 2,
            mt: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Typography variant='body2' sx={{ opacity: 0.8 }}>
            Desarrollado con ❤️ para la Universidad Icesi
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link
              href='/privacy'
              color='inherit'
              sx={{
                textDecoration: 'none',
                opacity: 0.8,
                '&:hover': { opacity: 1 },
              }}
            >
              Política de Privacidad
            </Link>
            <Link
              href='/terms'
              color='inherit'
              sx={{
                textDecoration: 'none',
                opacity: 0.8,
                '&:hover': { opacity: 1 },
              }}
            >
              Términos de Uso
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
