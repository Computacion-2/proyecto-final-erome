import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  School,
  EmojiEvents,
  Download,
  Visibility,
  Assessment,
} from '@mui/icons-material';
import { StudentPerformance, GroupStatistics } from '../types';
import Loading from '../components/common/Loading';

const PerformancePage: React.FC = () => {
  const [performances, setPerformances] = useState<StudentPerformance[]>([]);
  const [groupStats, setGroupStats] = useState<GroupStatistics[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, [selectedGroup]);

  const fetchPerformanceData = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API calls
      // const [performancesRes, statsRes, leaderboardsRes] = await Promise.all([
      //   apiService.getStudentPerformances(selectedGroup),
      //   apiService.getGroupStatistics(),
      //   apiService.getLeaderboards(),
      // ]);

      // Mock data for now
      setPerformances([
        {
          student: {
            id: 1,
            name: 'Santiago Rendón',
            email: 'santiago.rendon@u.icesi.edu.co',
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
          },
          totalPoints: 850,
          completedExercises: 12,
          averageScore: 85.5,
          category: 'pro',
          weeklyProgress: [
            {
              week: 'Semana 1',
              points: 100,
              exercisesCompleted: 2,
              averageScore: 80,
            },
            {
              week: 'Semana 2',
              points: 150,
              exercisesCompleted: 3,
              averageScore: 85,
            },
            {
              week: 'Semana 3',
              points: 200,
              exercisesCompleted: 4,
              averageScore: 90,
            },
            {
              week: 'Semana 4',
              points: 150,
              exercisesCompleted: 3,
              averageScore: 87,
            },
          ],
          groupRank: 1,
          overallRank: 1,
        },
        {
          student: {
            id: 2,
            name: 'María González',
            email: 'maria.gonzalez@u.icesi.edu.co',
            studentId: '2024002',
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
          },
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
        },
      ]);

      setGroupStats([
        {
          groupName: 'G1',
          totalStudents: 25,
          averageScore: 78.5,
          completionRate: 85.2,
          topPerformers: [],
        },
        {
          groupName: 'G3',
          totalStudents: 23,
          averageScore: 75.8,
          completionRate: 82.1,
          topPerformers: [],
        },
      ]);

      // setLeaderboards([
      //   {
      //     groupName: 'G1',
      //     students: [],
      //     lastUpdated: '2025-01-20T15:30:00Z',
      //   },
      // ]);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setIsLoading(false);
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

  const exportToPDF = async () => {
    try {
      // TODO: Implement PDF export
      console.log('Exporting to PDF...');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };

  if (isLoading) {
    return <Loading message='Cargando datos de rendimiento...' />;
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
          Análisis de Rendimiento
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size='small' sx={{ minWidth: 120 }}>
            <InputLabel>Grupo</InputLabel>
            <Select
              value={selectedGroup}
              label='Grupo'
              onChange={e => setSelectedGroup(e.target.value)}
            >
              <MenuItem value='all'>Todos los grupos</MenuItem>
              <MenuItem value='G1'>G1</MenuItem>
              <MenuItem value='G3'>G3</MenuItem>
              <MenuItem value='G5'>G5</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant='contained'
            startIcon={<Download />}
            onClick={exportToPDF}
          >
            Exportar PDF
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <School />
                </Avatar>
                <Box>
                  <Typography variant='h4' component='div'>
                    {performances.length}
                  </Typography>
                  <Typography color='text.secondary'>Estudiantes</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant='h4' component='div'>
                    {Math.round(
                      performances.reduce((acc, p) => acc + p.averageScore, 0) /
                        performances.length
                    ) || 0}
                    %
                  </Typography>
                  <Typography color='text.secondary'>
                    Promedio General
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <EmojiEvents />
                </Avatar>
                <Box>
                  <Typography variant='h4' component='div'>
                    {performances.filter(p => p.category === 'pro').length}
                  </Typography>
                  <Typography color='text.secondary'>
                    Estudiantes Pro
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <Assessment />
                </Avatar>
                <Box>
                  <Typography variant='h4' component='div'>
                    {Math.round(
                      performances.reduce(
                        (acc, p) => acc + p.completedExercises,
                        0
                      ) / performances.length
                    ) || 0}
                  </Typography>
                  <Typography color='text.secondary'>
                    Ejercicios Promedio
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Table */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Rendimiento de Estudiantes
              </Typography>
              <TableContainer component={Paper} variant='outlined'>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Estudiante</TableCell>
                      <TableCell align='center'>Grupo</TableCell>
                      <TableCell align='center'>Puntos</TableCell>
                      <TableCell align='center'>Ejercicios</TableCell>
                      <TableCell align='center'>Promedio</TableCell>
                      <TableCell align='center'>Categoría</TableCell>
                      <TableCell align='center'>Ranking</TableCell>
                      <TableCell align='center'>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {performances.map(performance => (
                      <TableRow key={performance.student.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
                              {performance.student.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant='body2' fontWeight='medium'>
                                {performance.student.name}
                              </Typography>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                              >
                                {performance.student.studentId}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align='center'>
                          <Chip
                            label={performance.student.group}
                            size='small'
                          />
                        </TableCell>
                        <TableCell align='center'>
                          <Typography variant='body2' fontWeight='medium'>
                            {performance.totalPoints}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography variant='body2'>
                            {performance.completedExercises}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography variant='body2' fontWeight='medium'>
                            {performance.averageScore.toFixed(1)}%
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Chip
                            label={getCategoryLabel(performance.category)}
                            color={
                              getCategoryColor(performance.category) as any
                            }
                            size='small'
                          />
                        </TableCell>
                        <TableCell align='center'>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                            }}
                          >
                            <Typography variant='body2' fontWeight='medium'>
                              #{performance.groupRank}
                            </Typography>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              en grupo
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align='center'>
                          <Tooltip title='Ver detalles'>
                            <IconButton size='small'>
                              <Visibility fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Group Statistics */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Estadísticas por Grupo
              </Typography>
              {groupStats.map(stat => (
                <Box key={stat.groupName} sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography variant='body2' fontWeight='medium'>
                      {stat.groupName}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {stat.totalStudents} estudiantes
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 0.5,
                      }}
                    >
                      <Typography variant='caption'>
                        Promedio del grupo
                      </Typography>
                      <Typography variant='caption'>
                        {stat.averageScore.toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate'
                      value={stat.averageScore}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 0.5,
                      }}
                    >
                      <Typography variant='caption'>
                        Tasa de finalización
                      </Typography>
                      <Typography variant='caption'>
                        {stat.completionRate.toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate'
                      value={stat.completionRate}
                      color='success'
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performers */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Top 5 Estudiantes
              </Typography>
              {performances.slice(0, 5).map((performance, index) => (
                <Box
                  key={performance.student.id}
                  sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      mr: 2,
                      bgcolor: index < 3 ? 'warning.main' : 'grey.300',
                    }}
                  >
                    {index + 1}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant='body2' fontWeight='medium'>
                      {performance.student.name}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {performance.totalPoints} puntos •{' '}
                      {performance.student.group}
                    </Typography>
                  </Box>
                  <Chip
                    label={getCategoryLabel(performance.category)}
                    color={getCategoryColor(performance.category) as any}
                    size='small'
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerformancePage;
