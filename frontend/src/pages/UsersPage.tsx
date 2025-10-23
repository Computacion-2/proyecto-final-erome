import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import { Add, Edit, Delete, Person } from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import apiService from '../services/api';
import Loading from '../components/common/Loading';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { User, Role, UserFormData } from '../types';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    group: '',
    roles: [],
    isActive: true,
  });
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await apiService.getRoles();
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      group: '',
      roles: [],
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      group: user.group || '',
      roles: user.roles.map(role => role.id),
      isActive: user.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteUser = (userId: number) => {
    setConfirmDialog({
      open: true,
      title: 'Eliminar Usuario',
      message: '¿Estás seguro de que quieres eliminar este usuario?',
      onConfirm: async () => {
        try {
          await apiService.deleteUser(userId);
          setUsers(users.filter(user => user.id !== userId));
          setConfirmDialog(prev => ({ ...prev, open: false }));
        } catch (error) {
          console.error('Error deleting user:', error);
        }
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (editingUser) {
        await apiService.updateUser(editingUser.id, formData);
        fetchUsers(); // Refresh the list to get updated data
      } else {
        await apiService.createUser(formData);
        fetchUsers(); // Refresh the list
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al guardar usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRoleChange = (roleIds: number[]) => {
    setFormData(prev => ({
      ...prev,
      roles: roleIds,
    }));
  };

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
    },
    {
      field: 'name',
      headerName: 'Nombre',
      width: 200,
      renderCell: params => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person />
          {params.value}
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
    },
    {
      field: 'group',
      headerName: 'Grupo',
      width: 150,
      renderCell: params => params.value || 'No asignado',
    },
    {
      field: 'roles',
      headerName: 'Roles',
      width: 200,
      renderCell: params => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {params.value.map((role: Role) => (
            <Chip
              key={role.id}
              label={role.name}
              size='small'
              color='primary'
            />
          ))}
        </Box>
      ),
    },
    {
      field: 'isActive',
      headerName: 'Activo',
      width: 100,
      renderCell: params => (
        <Chip
          label={params.value ? 'Activo' : 'Inactivo'}
          color={params.value ? 'success' : 'default'}
          size='small'
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      width: 120,
      getActions: params => [
        <GridActionsCellItem
          key='edit'
          icon={<Edit />}
          label='Editar'
          onClick={() => handleEditUser(params.row)}
        />,
        <GridActionsCellItem
          key='delete'
          icon={<Delete />}
          label='Eliminar'
          onClick={() => handleDeleteUser(params.row.id)}
        />,
      ],
    },
  ];

  if (isLoading) {
    return <Loading message='Cargando usuarios...' />;
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
        <Typography variant='h4'>Gestión de Usuarios</Typography>
        <Button variant='contained' startIcon={<Add />} onClick={handleAddUser}>
          Agregar Usuario
        </Button>
      </Box>

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          disableRowSelectionOnClick
        />
      </Paper>

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>
          {editingUser ? 'Editar Usuario' : 'Agregar Usuario'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label='Nombre'
              name='name'
              value={formData.name}
              onChange={handleChange}
              required
              margin='normal'
            />

            <TextField
              fullWidth
              label='Email'
              name='email'
              type='email'
              value={formData.email}
              onChange={handleChange}
              required
              margin='normal'
            />

            <TextField
              fullWidth
              label='Contraseña'
              name='password'
              type='password'
              value={formData.password}
              onChange={handleChange}
              required={!editingUser}
              margin='normal'
              helperText={
                editingUser
                  ? 'Dejar vacío para mantener la contraseña actual'
                  : ''
              }
            />

            <TextField
              fullWidth
              label='Grupo'
              name='group'
              value={formData.group}
              onChange={handleChange}
              margin='normal'
            />

            <FormControl fullWidth margin='normal'>
              <InputLabel>Roles</InputLabel>
              <Select
                multiple
                value={formData.roles}
                onChange={e => handleRoleChange(e.target.value as number[])}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map(roleId => {
                      const role = roles.find(r => r.id === roleId);
                      return (
                        <Chip key={roleId} label={role?.name} size='small' />
                      );
                    })}
                  </Box>
                )}
              >
                {roles.map(role => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                />
              }
              label='Usuario Activo'
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button type='submit' variant='contained' disabled={isSubmitting}>
              {editingUser ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
      />
    </Box>
  );
};

export default UsersPage;
