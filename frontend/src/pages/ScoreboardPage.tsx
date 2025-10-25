import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  IconButton,
  Alert,
} from '@mui/material';
import { Refresh, EmojiEvents, School, Assignment } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { LiveScoreboard, ScoreboardUpdate, Activity } from '../types';
import Loading from '../components/common/Loading';

const ScoreboardPage: React.FC = () => {
  const { user } = useAuth();
  const [scoreboards, setScoreboards] = useState<LiveScoreboard[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    fetchActivities();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedActivity) {
      connectWebSocket();
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [selectedActivity]);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API call
      // const response = await apiService.getActiveActivities();
      // setActivities(response.data);

      // Mock data for now
      setActivities([
        {
          id: 1,
          name: 'Algoritmos Básicos',
          description: 'Ejercicios de introducción a algoritmos',
          startDate: '2025-01-20T08:00:00Z',
          endDate: '2025-01-20T12:00:00Z',
          isActive: true,
          exercises: [],
          instructor: user!,
          createdAt: '2025-01-15T10:00:00Z',
        },
        {
          id: 2,
          name: 'Estructuras de Datos',
          description: 'Listas, tuplas y diccionarios en Python',
          startDate: '2025-01-22T08:00:00Z',
          endDate: '2025-01-22T12:00:00Z',
          isActive: true,
          exercises: [],
          instructor: user!,
          createdAt: '2025-01-18T10:00:00Z',
        },
      ]);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWebSocket = () => {
    try {
      // TODO: Implement WebSocket connection
      // const wsUrl = `ws://localhost:8080/ws/scoreboard/${selectedActivity}`;
      // wsRef.current = new WebSocket(wsUrl);

      // Mock WebSocket connection for now
      setIsConnected(true);

      // Simulate real-time updates
      const interval = setInterval(() => {
        const mockUpdate: ScoreboardUpdate = {
          studentName: `Estudiante ${Math.floor(Math.random() * 10) + 1}`,
          exerciseTitle: `Ejercicio ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
          timestamp: new Date().toISOString(),
          points: Math.floor(Math.random() * 100) + 50,
        };

        setScoreboards(prev => {
          const updated = [...prev];
          const existingIndex = updated.findIndex(
            sb => sb.activityId === selectedActivity
          );

          if (existingIndex >= 0) {
            updated[existingIndex] = {
              ...updated[existingIndex],
              updates: [
                mockUpdate,
                ...updated[existingIndex].updates.slice(0, 9),
              ],
              lastUpdated: new Date().toISOString(),
            };
          } else {
            updated.push({
              activityId: selectedActivity!,
              groupId: 'G1',
              updates: [mockUpdate],
              lastUpdated: new Date().toISOString(),
            });
          }

          return updated;
        });
      }, 3000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setIsConnected(false);
    }
  };

  const handleRefresh = () => {
    if (selectedActivity) {
      fetchScoreboardData();
    }
  };

  const fetchScoreboardData = async () => {
    try {
      // TODO: Implement API call
      // const response = await apiService.getScoreboard(selectedActivity);
      // setScoreboards([response.data]);
    } catch (error) {
      console.error('Error fetching scoreboard data:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActivityStatus = (activity: Activity) => {
    const now = new Date();
    const startDate = new Date(activity.startDate);
    const endDate = new Date(activity.endDate);

    if (now < startDate) return { status: 'upcoming', color: 'info' };
    if (now > endDate) return { status: 'completed', color: 'default' };
    return { status: 'active', color: 'success' };
  };

  const getCurrentScoreboard = () => {
    return scoreboards.find(sb => sb.activityId === selectedActivity);
  };

  if (isLoading) {
    return <Loading message='Cargando actividades...' />;
  }

  const currentScoreboard = getCurrentScoreboard();

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
          Tablero en Tiempo Real
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={isConnected ? 'Conectado' : 'Desconectado'}
            color={isConnected ? 'success' : 'error'}
            size='small'
          />
          <IconButton onClick={handleRefresh} disabled={!selectedActivity}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {!isConnected && (
        <Alert severity='warning' sx={{ mb: 3 }}>
          No hay conexión en tiempo real. Los datos se actualizarán cuando se
          conecte.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Activity Selection */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Actividades Activas
              </Typography>
              <List>
                {activities.map(activity => {
                  const statusInfo = getActivityStatus(activity);
                  return (
                    <ListItem
                      key={activity.id}
                      onClick={() => setSelectedActivity(activity.id)}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        cursor: 'pointer',
                        bgcolor:
                          selectedActivity === activity.id
                            ? 'primary.main'
                            : 'transparent',
                        color:
                          selectedActivity === activity.id
                            ? 'white'
                            : 'inherit',
                        '&:hover': {
                          bgcolor:
                            selectedActivity === activity.id
                              ? 'primary.dark'
                              : 'grey.100',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor:
                              statusInfo.color === 'success'
                                ? 'success.main'
                                : 'grey.300',
                          }}
                        >
                          <Assignment />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.name}
                        secondary={
                          <Box>
                            <Typography variant='caption' display='block'>
                              {new Date(activity.startDate).toLocaleString(
                                'es-CO'
                              )}
                            </Typography>
                            <Chip
                              label={statusInfo.status}
                              color={statusInfo.color as any}
                              size='small'
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Live Updates */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant='h6'>
                  Actualizaciones en Tiempo Real
                </Typography>
                {currentScoreboard && (
                  <Typography variant='caption' color='text.secondary'>
                    Última actualización:{' '}
                    {formatTime(currentScoreboard.lastUpdated)}
                  </Typography>
                )}
              </Box>

              {selectedActivity ? (
                currentScoreboard ? (
                  <Box>
                    <List>
                      {currentScoreboard.updates.map((update, index) => (
                        <ListItem
                          key={index}
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            mb: 1,
                            bgcolor:
                              index === 0
                                ? 'success.light'
                                : 'background.paper',
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <School />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                }}
                              >
                                <Typography variant='body1' fontWeight='medium'>
                                  {update.studentName}
                                </Typography>
                                <Typography
                                  variant='body2'
                                  color='text.secondary'
                                >
                                  resolvió
                                </Typography>
                                <Typography
                                  variant='body1'
                                  fontWeight='medium'
                                  color='primary'
                                >
                                  {update.exerciseTitle}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                  mt: 0.5,
                                }}
                              >
                                <Chip
                                  label={`+${update.points} puntos`}
                                  color='success'
                                  size='small'
                                />
                                <Typography
                                  variant='caption'
                                  color='text.secondary'
                                >
                                  {formatTime(update.timestamp)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant='body1' color='text.secondary'>
                      No hay actualizaciones disponibles para esta actividad.
                    </Typography>
                  </Box>
                )
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant='body1' color='text.secondary'>
                    Selecciona una actividad para ver las actualizaciones en
                    tiempo real.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Group Leaderboard */}
        {selectedActivity && (
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Clasificación por Grupo
                </Typography>
                <Grid container spacing={2}>
                  {['G1', 'G3', 'G5'].map(group => (
                    <Grid size={{ xs: 12, md: 4 }} key={group}>
                      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
                        >
                          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                            <EmojiEvents />
                          </Avatar>
                          <Typography variant='h6'>{group}</Typography>
                        </Box>
                        <List dense>
                          {Array.from({ length: 5 }, (_, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
                              <ListItemAvatar>
                                <Avatar
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    bgcolor:
                                      index < 3 ? 'warning.main' : 'grey.300',
                                  }}
                                >
                                  {index + 1}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={`Estudiante ${index + 1}`}
                                secondary={`${Math.floor(Math.random() * 500) + 200} puntos`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ScoreboardPage;
