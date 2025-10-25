import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add,
  MoreVert,
  PlayArrow,
  Pause,
  Edit,
  Delete,
  Visibility,
  Assignment,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { Activity } from '../types';
import Loading from '../components/common/Loading';

const ActivitiesPage: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  // const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  // const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuActivity, setMenuActivity] = useState<Activity | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    isActive: false,
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API call
      // const response = await apiService.getActivities();
      // setActivities(response.data);

      // Mock data for now
      setActivities([
        {
          id: 1,
          name: 'Algoritmos Básicos',
          description: 'Ejercicios de introducción a algoritmos',
          startDate: '2024-01-15T08:00:00Z',
          endDate: '2024-01-15T10:00:00Z',
          isActive: true,
          exercises: [],
          instructor: user!,
          createdAt: '2024-01-10T10:00:00Z',
        },
        {
          id: 2,
          name: 'Estructuras de Datos',
          description: 'Listas, tuplas y diccionarios en Python',
          startDate: '2024-01-20T08:00:00Z',
          endDate: '2024-01-20T12:00:00Z',
          isActive: false,
          exercises: [],
          instructor: user!,
          createdAt: '2024-01-15T10:00:00Z',
        },
      ]);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateActivity = async () => {
    try {
      // TODO: Implement API call
      // await apiService.createActivity(formData);
      setIsCreateDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        isActive: false,
      });
      fetchActivities();
    } catch (error) {
      console.error('Error creating activity:', error);
    }
  };

  // const handleEditActivity = async () => {
  //   try {
  //     // TODO: Implement API call
  //     // await apiService.updateActivity(selectedActivity!.id, formData);
  //     setIsEditDialogOpen(false);
  //     setSelectedActivity(null);
  //     setFormData({
  //       name: '',
  //       description: '',
  //       startDate: '',
  //       endDate: '',
  //       isActive: false,
  //     });
  //     fetchActivities();
  //   } catch (error) {
  //     console.error('Error updating activity:', error);
  //   }
  // };

  const handleToggleActivity = async () => {
    try {
      // TODO: Implement API call
      fetchActivities();
    } catch (error) {
      console.error('Error toggling activity:', error);
    }
  };

  const handleDeleteActivity = async () => {
    try {
      // TODO: Implement API call
      fetchActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    activity: Activity
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuActivity(activity);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuActivity(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityStatus = (activity: Activity) => {
    const now = new Date();
    const startDate = new Date(activity.startDate);
    const endDate = new Date(activity.endDate);

    if (now < startDate) return { status: 'upcoming', color: 'info' };
    if (now > endDate) return { status: 'completed', color: 'default' };
    if (activity.isActive) return { status: 'active', color: 'success' };
    return { status: 'inactive', color: 'warning' };
  };

  if (isLoading) {
    return <Loading message='Cargando actividades...' />;
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant='h4' gutterBottom>
          Actividades
        </Typography>
        <Button
          variant='contained'
          startIcon={<Add />}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          Nueva Actividad
        </Button>
      </Box>

      <Grid container spacing={3}>
        {activities.map(activity => {
          const statusInfo = getActivityStatus(activity);
          return (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={activity.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Typography variant='h6' component='h2' gutterBottom>
                      {activity.name}
                    </Typography>
                    <IconButton
                      size='small'
                      onClick={e => handleMenuOpen(e, activity)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 2 }}
                  >
                    {activity.description}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      gutterBottom
                    >
                      Inicio: {formatDate(activity.startDate)}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Fin: {formatDate(activity.endDate)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Chip
                      label={statusInfo.status}
                      color={statusInfo.color as any}
                      size='small'
                    />
                    <Chip
                      label={`${activity.exercises.length} ejercicios`}
                      variant='outlined'
                      size='small'
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}
                    >
                      <Assignment fontSize='small' />
                    </Avatar>
                    <Typography variant='body2' color='text.secondary'>
                      {activity.instructor.name}
                    </Typography>
                  </Box>
                </CardContent>

                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant='outlined'
                    startIcon={<Visibility />}
                    onClick={() => {
                      /* setSelectedActivity(activity) */
                    }}
                  >
                    Ver Detalles
                  </Button>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Create Activity Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Nueva Actividad</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Nombre de la Actividad'
            fullWidth
            variant='outlined'
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin='dense'
            label='Descripción'
            fullWidth
            multiline
            rows={3}
            variant='outlined'
            value={formData.description}
            onChange={e =>
              setFormData({ ...formData, description: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin='dense'
            label='Fecha de Inicio'
            type='datetime-local'
            fullWidth
            variant='outlined'
            value={formData.startDate}
            onChange={e =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin='dense'
            label='Fecha de Fin'
            type='datetime-local'
            fullWidth
            variant='outlined'
            value={formData.endDate}
            onChange={e =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={e =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
              />
            }
            label='Activar inmediatamente'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreateActivity} variant='contained'>
            Crear Actividad
          </Button>
        </DialogActions>
      </Dialog>

      {/* Activity Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            // setSelectedActivity(menuActivity!);
            setFormData({
              name: menuActivity!.name,
              description: menuActivity!.description,
              startDate: menuActivity!.startDate,
              endDate: menuActivity!.endDate,
              isActive: menuActivity!.isActive,
            });
            // setIsEditDialogOpen(true);
            handleMenuClose();
          }}
        >
          <Edit sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleToggleActivity();
            handleMenuClose();
          }}
        >
          {menuActivity?.isActive ? (
            <Pause sx={{ mr: 1 }} />
          ) : (
            <PlayArrow sx={{ mr: 1 }} />
          )}
          {menuActivity?.isActive ? 'Pausar' : 'Activar'}
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDeleteActivity();
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ActivitiesPage;
