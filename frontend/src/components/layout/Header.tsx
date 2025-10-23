import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Button,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Dashboard,
  People,
  School,
  Settings,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
    { label: 'Usuarios', path: '/users', icon: <People /> },
    { label: 'Estudiantes', path: '/students', icon: <School /> },
    { label: 'Configuración', path: '/settings', icon: <Settings /> },
  ];

  const drawer = (
    <Box sx={{ width: 250 }}>
      <List>
        {navigationItems.map(item => (
          <ListItemButton
            key={item.path}
            onClick={() => handleNavigation(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar position='static' elevation={2}>
      <Toolbar>
        {isMobile && (
          <IconButton
            edge='start'
            color='inherit'
            aria-label='menu'
            onClick={() => setMobileMenuOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant='h6'
          component='div'
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Pensamiento Computacional
        </Typography>

        {!isMobile && isAuthenticated && (
          <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
            {navigationItems.map(item => (
              <Button
                key={item.path}
                color='inherit'
                onClick={() => navigate(item.path)}
                startIcon={item.icon}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              size='large'
              aria-label='account of current user'
              aria-controls='menu-appbar'
              aria-haspopup='true'
              onClick={handleMenuOpen}
              color='inherit'
            >
              {user?.photoUrl ? (
                <Avatar src={user.photoUrl} sx={{ width: 32, height: 32 }} />
              ) : (
                <AccountCircle />
              )}
            </IconButton>
            <Menu
              id='menu-appbar'
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem
                onClick={() => {
                  navigate('/profile');
                  handleMenuClose();
                }}
              >
                <AccountCircle sx={{ mr: 1 }} />
                Perfil
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Cerrar Sesión
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box>
            <Button color='inherit' onClick={() => navigate('/login')}>
              Iniciar Sesión
            </Button>
            <Button color='inherit' onClick={() => navigate('/register')}>
              Registrarse
            </Button>
          </Box>
        )}
      </Toolbar>

      <Drawer
        anchor='left'
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Header;
