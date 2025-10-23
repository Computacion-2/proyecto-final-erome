import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
} from '@mui/material';
import {
  People,
  School,
  Assignment,
  TrendingUp,
  Person,
  Group,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/api';
import Loading from '../components/common/Loading';
import { User, Student, Role } from '../types';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalRoles: 0,
    activeUsers: 0,
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        const [usersResponse, studentsResponse, rolesResponse] = await Promise.all([
          apiService.getUsers(),
          apiService.getStudents(),
          apiService.getRoles(),
        ]);

        const users = usersResponse.data;
        const students = studentsResponse.data;
        const roles = rolesResponse.data;

        setStats({
          totalUsers: users.length,
          totalStudents: students.length,
          totalRoles: roles.length,
          activeUsers: users.filter(u => u.isActive).length,
        });

        // Get recent users (last 5)
        setRecentUsers(users.slice(0, 5));
        setRecentStudents(students.slice(0, 5));

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <Loading message="Cargando dashboard..." />;
  }

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color = 'primary' 
  }: { 
    title: string; 
    value: number; 
    icon: React.ReactNode; 
    color?: string;
  }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.main`, mr: 2 }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            <Typography color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Bienvenido, {user?.name || 'Usuario'}
      </Typography>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Usuarios"
            value={stats.totalUsers}
            icon={<People />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Estudiantes"
            value={stats.totalStudents}
            icon={<School />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Roles"
            value={stats.totalRoles}
            icon={<Assignment />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Usuarios Activos"
            value={stats.activeUsers}
            icon={<TrendingUp />}
            color="warning"
          />
        </Grid>

        {/* Recent Users */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Usuarios Recientes
            </Typography>
            <List>
              {recentUsers.map((user) => (
                <ListItem key={user.id} divider>
                  <ListItemIcon>
                    <Avatar src={user.photoUrl}>
                      <Person />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={user.name}
                    secondary={
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip 
                          label={user.email} 
                          size="small" 
                          variant="outlined" 
                        />
                        {user.roles.map((role) => (
                          <Chip
                            key={role.id}
                            label={role.name}
                            size="small"
                            color="primary"
                          />
                        ))}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Students */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Estudiantes Recientes
            </Typography>
            <List>
              {recentStudents.map((student) => (
                <ListItem key={student.id} divider>
                  <ListItemIcon>
                    <Avatar>
                      <School />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={student.name}
                    secondary={
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip 
                          label={student.studentId} 
                          size="small" 
                          variant="outlined" 
                        />
                        <Chip
                          label={student.semester.name}
                          size="small"
                          color="secondary"
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* User Info */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Información del Usuario
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Nombre:
                </Typography>
                <Typography variant="body1">
                  {user?.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Email:
                </Typography>
                <Typography variant="body1">
                  {user?.email}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Grupo:
                </Typography>
                <Typography variant="body1">
                  {user?.group || 'No asignado'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Roles:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {user?.roles.map((role) => (
                    <Chip
                      key={role.id}
                      label={role.name}
                      size="small"
                      color="primary"
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
