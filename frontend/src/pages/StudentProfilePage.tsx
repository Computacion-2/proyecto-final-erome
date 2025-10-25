import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Edit, Assignment, Person } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { StudentProfile, StudentPerformance, StudentActivity } from '../types';
import Loading from '../components/common/Loading';

const StudentProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [performance, setPerformance] = useState<StudentPerformance | null>(
    null
  );
  const [activities, setActivities] = useState<StudentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    programmingLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    interests: [] as string[],
    goals: [] as string[],
    bio: '',
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API calls
      // const [profileRes, performanceRes, activitiesRes] = await Promise.all([
      //   apiService.getStudentProfile(user!.id),
      //   apiService.getStudentPerformance(user!.id),
      //   apiService.getStudentActivities(user!.id),
      // ]);

      // Mock data for now
      const mockStudent = {
        id: 1,
        name: user?.name || 'Estudiante',
        email: user?.email || 'estudiante@u.icesi.edu.co',
        studentId: '2024001',
        semester: {
          id: 1,
          name: '2025-1',
          description: 'Primer Semestre 2025',
          startDate: '2025-01-15',
          endDate: '2025-05-15',
          isActive: true,
        },
        group: 'G1',
        isActive: true,
        createdAt: '2025-01-15T10:00:00Z',
      };

      setProfile({
        id: 1,
        student: mockStudent,
        programmingLevel: 'intermediate',
        interests: ['Algoritmos', 'Estructuras de Datos', 'Python'],
        goals: ['Mejorar en programación', 'Aprender algoritmos avanzados'],
        bio: 'Estudiante apasionado por la programación y los algoritmos.',
        updatedAt: '2025-01-20T10:00:00Z',
      });

      setPerformance({
        student: mockStudent,
        totalPoints: 720,
        completedExercises: 10,
        averageScore: 78.2,
        category: 'killer',
        weeklyProgress: [
          {
            week: 'Semana 1',
            points: 80,
            exercisesCompleted: 2,
            averageScore: 75,
          },
          {
            week: 'Semana 2',
            points: 120,
            exercisesCompleted: 3,
            averageScore: 78,
          },
          {
            week: 'Semana 3',
            points: 180,
            exercisesCompleted: 3,
            averageScore: 82,
          },
          {
            week: 'Semana 4',
            points: 140,
            exercisesCompleted: 2,
            averageScore: 80,
          },
        ],
        groupRank: 2,
        overallRank: 3,
      });

      setActivities([
        {
          id: 1,
          student: mockStudent,
          activity: {
            id: 1,
            name: 'Algoritmos Básicos',
            description: 'Ejercicios de introducción',
            startDate: '2025-01-15T08:00:00Z',
            endDate: '2025-01-15T10:00:00Z',
            isActive: true,
            exercises: [],
            instructor: user!,
            createdAt: '2025-01-10T10:00:00Z',
          },
          totalScore: 85,
          completedExercises: 3,
          totalExercises: 5,
          status: 'completed',
          startedAt: '2025-01-15T08:00:00Z',
          completedAt: '2025-01-15T09:45:00Z',
        },
      ]);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    if (profile) {
      setFormData({
        programmingLevel: profile.programmingLevel,
        interests: profile.interests,
        goals: profile.goals,
        bio: profile.bio || '',
      });
      setIsEditDialogOpen(true);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // TODO: Implement API call
      // await apiService.updateStudentProfile(user!.id, formData);
      setIsEditDialogOpen(false);
      fetchProfileData();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'pro':
        return 'success';
      case 'killer':
        return 'warning';
      case 'beginner':
        return 'info';
      default:
        return 'default';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'pro':
        return 'Pro';
      case 'killer':
        return 'Killer';
      case 'beginner':
        return 'Principiante';
      default:
        return 'Sin categoría';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'advanced':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'beginner':
        return 'info';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return <Loading message='Cargando perfil...' />;
  }

  return (
    <Box>
      <Typography variant='h4' gutterBottom>
        Mi Perfil
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Avatar
                  sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.main' }}
                  src={profile?.profilePicture}
                >
                  <Person fontSize='large' />
                </Avatar>
                <Typography variant='h6' gutterBottom>
                  {user?.name}
                </Typography>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  {user?.email}
                </Typography>
                <Chip
                  label={user?.group || 'Sin grupo'}
                  color='primary'
                  size='small'
                  sx={{ mb: 2 }}
                />
                <Button
                  variant='outlined'
                  startIcon={<Edit />}
                  onClick={handleEditProfile}
                  size='small'
                >
                  Editar Perfil
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant='subtitle2' gutterBottom>
                  Nivel de Programación
                </Typography>
                <Chip
                  label={profile?.programmingLevel || 'beginner'}
                  color={
                    getLevelColor(
                      profile?.programmingLevel || 'beginner'
                    ) as any
                  }
                  size='small'
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant='subtitle2' gutterBottom>
                  Intereses
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {profile?.interests.map((interest, index) => (
                    <Chip
                      key={index}
                      label={interest}
                      size='small'
                      variant='outlined'
                    />
                  ))}
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant='subtitle2' gutterBottom>
                  Objetivos
                </Typography>
                <List dense>
                  {profile?.goals.map((goal, index) => (
                    <ListItem key={index} sx={{ py: 0 }}>
                      <ListItemIcon>
                        <Assignment fontSize='small' />
                      </ListItemIcon>
                      <ListItemText primary={goal} />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {profile?.bio && (
                <Box>
                  <Typography variant='subtitle2' gutterBottom>
                    Biografía
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {profile.bio}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Overview */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={3}>
            {/* Performance Stats */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    Resumen de Rendimiento
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant='h4' color='primary' gutterBottom>
                          {performance?.totalPoints || 0}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          Puntos Totales
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography
                          variant='h4'
                          color='success.main'
                          gutterBottom
                        >
                          {performance?.completedExercises || 0}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          Ejercicios Completados
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography
                          variant='h4'
                          color='warning.main'
                          gutterBottom
                        >
                          {performance?.averageScore?.toFixed(1) || 0}%
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          Promedio
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Chip
                          label={getCategoryLabel(
                            performance?.category || 'beginner'
                          )}
                          color={
                            getCategoryColor(
                              performance?.category || 'beginner'
                            ) as any
                          }
                          sx={{ mb: 1 }}
                        />
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          display='block'
                        >
                          Categoría
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Weekly Progress */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    Progreso Semanal
                  </Typography>
                  {performance?.weeklyProgress.map((week, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 1,
                        }}
                      >
                        <Typography variant='body2'>{week.week}</Typography>
                        <Typography variant='body2' fontWeight='medium'>
                          {week.points} pts
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant='determinate'
                        value={(week.points / 200) * 100}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mt: 0.5,
                        }}
                      >
                        <Typography variant='caption' color='text.secondary'>
                          {week.exercisesCompleted} ejercicios
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {week.averageScore.toFixed(1)}% promedio
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Activities */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    Actividades Recientes
                  </Typography>
                  <List>
                    {activities.map(activity => (
                      <ListItem key={activity.id} divider>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <Assignment />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.activity.name}
                          secondary={
                            <Box>
                              <Typography variant='caption' display='block'>
                                {activity.completedExercises}/
                                {activity.totalExercises} ejercicios
                              </Typography>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                              >
                                {activity.totalScore} puntos
                              </Typography>
                            </Box>
                          }
                        />
                        <Chip
                          label={activity.status}
                          color={
                            activity.status === 'completed'
                              ? 'success'
                              : 'default'
                          }
                          size='small'
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Rankings */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    Clasificaciones
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <Paper
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          bgcolor: 'primary.light',
                          color: 'white',
                        }}
                      >
                        <Typography variant='h4' gutterBottom>
                          #{performance?.groupRank || 0}
                        </Typography>
                        <Typography variant='body2'>
                          En mi grupo ({user?.group})
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <Paper
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          bgcolor: 'success.light',
                          color: 'white',
                        }}
                      >
                        <Typography variant='h4' gutterBottom>
                          #{performance?.overallRank || 0}
                        </Typography>
                        <Typography variant='body2'>General</Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant='subtitle2' gutterBottom>
                          Próximo objetivo
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          Completar 5 ejercicios más para alcanzar la categoría
                          &quot;Pro&quot;
                        </Typography>
                        <LinearProgress
                          variant='determinate'
                          value={75}
                          sx={{ mt: 1, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Editar Perfil</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Biografía'
            fullWidth
            multiline
            rows={3}
            variant='outlined'
            value={formData.bio}
            onChange={e => setFormData({ ...formData, bio: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin='dense'>
            <InputLabel>Nivel de Programación</InputLabel>
            <Select
              value={formData.programmingLevel}
              label='Nivel de Programación'
              onChange={e =>
                setFormData({
                  ...formData,
                  programmingLevel: e.target.value as any,
                })
              }
            >
              <MenuItem value='beginner'>Principiante</MenuItem>
              <MenuItem value='intermediate'>Intermedio</MenuItem>
              <MenuItem value='advanced'>Avanzado</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveProfile} variant='contained'>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentProfilePage;
