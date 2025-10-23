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
import {
  Add,
  Edit,
  Delete,
  School,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import apiService from '../services/api';
import Loading from '../components/common/Loading';
import { Student, Semester, StudentFormData } from '../types';

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    email: '',
    studentId: '',
    semesterId: 0,
    group: '',
    isActive: true,
  });
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchSemesters();
  }, []);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getStudents();
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSemesters = async () => {
    try {
      const response = await apiService.getSemesters();
      setSemesters(response.data);
    } catch (error) {
      console.error('Error fetching semesters:', error);
    }
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      email: '',
      studentId: '',
      semesterId: 0,
      group: '',
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      studentId: student.studentId,
      semesterId: student.semester.id,
      group: student.group || '',
      isActive: student.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este estudiante?')) {
      try {
        await apiService.deleteStudent(studentId);
        setStudents(students.filter(student => student.id !== studentId));
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (editingStudent) {
        await apiService.updateStudent(editingStudent.id, formData);
        setStudents(students.map(student => 
          student.id === editingStudent.id 
            ? { ...student, ...formData }
            : student
        ));
      } else {
        await apiService.createStudent(formData);
        fetchStudents(); // Refresh the list
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al guardar estudiante');
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
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <School />
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
      field: 'studentId',
      headerName: 'ID Estudiante',
      width: 150,
    },
    {
      field: 'semester',
      headerName: 'Semestre',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value.name}
          color="secondary"
          size="small"
        />
      ),
    },
    {
      field: 'group',
      headerName: 'Grupo',
      width: 150,
      renderCell: (params) => params.value || 'No asignado',
    },
    {
      field: 'isActive',
      headerName: 'Activo',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Activo' : 'Inactivo'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Edit />}
          label="Editar"
          onClick={() => handleEditStudent(params.row)}
        />,
        <GridActionsCellItem
          icon={<Delete />}
          label="Eliminar"
          onClick={() => handleDeleteStudent(params.row.id)}
        />,
      ],
    },
  ];

  if (isLoading) {
    return <Loading message="Cargando estudiantes..." />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Gestión de Estudiantes
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddStudent}
        >
          Agregar Estudiante
        </Button>
      </Box>

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={students}
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

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingStudent ? 'Editar Estudiante' : 'Agregar Estudiante'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Nombre"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              margin="normal"
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
            />

            <TextField
              fullWidth
              label="ID Estudiante"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              required
              margin="normal"
            />

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Semestre</InputLabel>
              <Select
                value={formData.semesterId}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  semesterId: e.target.value as number,
                }))}
              >
                {semesters.map((semester) => (
                  <MenuItem key={semester.id} value={semester.id}>
                    {semester.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Grupo"
              name="group"
              value={formData.group}
              onChange={handleChange}
              margin="normal"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))}
                />
              }
              label="Estudiante Activo"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {editingStudent ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default StudentsPage;
