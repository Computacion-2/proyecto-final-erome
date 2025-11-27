import React, { useState } from 'react';
import { useAuth, User } from './AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { GraduationCap, LogOut, Plus, Edit2, Trash2, Users, UserPlus, Shield } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function AdminDashboard() {
  const { currentUser, logout, users, updateUser, deleteUser, addUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'professor' | 'admin',
    group: '',
    groups: [] as string[],
  });
  const [filter, setFilter] = useState<'all' | 'student' | 'professor' | 'admin'>('all');

  const allGroups = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7'];

  const filteredUsers = users.filter(u => {
    if (filter === 'all') return true;
    return u.role === filter;
  });

  const stats = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    professors: users.filter(u => u.role === 'professor').length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || (!editingUser && !formData.password)) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (formData.role === 'student' && !formData.group) {
      toast.error('Los estudiantes deben tener un grupo asignado');
      return;
    }

    if (formData.role === 'professor' && formData.groups.length === 0) {
      toast.error('Los profesores deben tener al menos un grupo asignado');
      return;
    }

    if (editingUser) {
      // Update existing user
      updateUser(editingUser.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role, // Include role so backend knows if it's a professor
        group: formData.role === 'student' ? formData.group : undefined,
        groups: formData.role === 'professor' ? formData.groups : undefined,
      });
      toast.success('Usuario actualizado');
    } else {
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        group: formData.role === 'student' ? formData.group : undefined,
        groups: formData.role === 'professor' ? formData.groups : undefined,
        totalPoints: formData.role === 'student' ? 0 : undefined,
        performanceCategory: formData.role === 'student' ? 'principiante' : undefined,
      };
      addUser(newUser, formData.password);
      toast.success('Usuario creado');
    }

    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'student',
      group: '',
      groups: [],
    });
    setEditingUser(null);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      group: user.group || '',
      groups: user.groups || [],
    });
    setOpen(true);
  };

  const handleDelete = (userId: string) => {
    if (userId === currentUser?.id) {
      toast.error('No puedes eliminar tu propia cuenta');
      return;
    }
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      deleteUser(userId);
      toast.success('Usuario eliminado');
    }
  };

  const toggleGroup = (group: string) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.includes(group)
        ? prev.groups.filter(g => g !== group)
        : [...prev.groups, group],
    }));
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500">Admin</Badge>;
      case 'professor':
        return <Badge className="bg-blue-500">Profesor</Badge>;
      default:
        return <Badge variant="secondary">Estudiante</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-600 p-2 rounded-lg">
                <Shield className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg">Panel de Administración</h1>
                <p className="text-sm text-muted-foreground">Gestión de usuarios</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={currentUser?.profilePhoto} />
                  <AvatarFallback>{currentUser?.name?.charAt(0) || 'A'}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm">{currentUser?.name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Usuarios</CardTitle>
              <Users className="size-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Estudiantes</CardTitle>
              <GraduationCap className="size-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.students}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Profesores</CardTitle>
              <UserPlus className="size-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.professors}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Administradores</CardTitle>
              <Shield className="size-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.admins}</div>
            </CardContent>
          </Card>
        </div>

        {/* Users Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>Ver, agregar, editar o eliminar usuarios</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="student">Estudiantes</SelectItem>
                    <SelectItem value="professor">Profesores</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
                <Dialog open={open} onOpenChange={(isOpen) => {
                  setOpen(isOpen);
                  if (!isOpen) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="size-4 mr-2" />
                      Nuevo Usuario
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingUser ? 'Modifica la información del usuario' : 'Crea un nuevo usuario en el sistema'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>

                      {!editingUser && (
                        <div className="space-y-2">
                          <Label htmlFor="password">Contraseña</Label>
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="role">Rol</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Estudiante</SelectItem>
                            <SelectItem value="professor">Profesor</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.role === 'student' && (
                        <div className="space-y-2">
                          <Label htmlFor="group">Grupo</Label>
                          <Select
                            value={formData.group}
                            onValueChange={(value) => setFormData({ ...formData, group: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un grupo" />
                            </SelectTrigger>
                            <SelectContent>
                              {allGroups.map(group => (
                                <SelectItem key={group} value={group}>
                                  {group}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {formData.role === 'professor' && (
                        <div className="space-y-2">
                          <Label>Grupos asignados ({formData.groups.length})</Label>
                          <div className="grid grid-cols-4 gap-2">
                            {allGroups.map(group => (
                              <Button
                                key={group}
                                type="button"
                                variant={formData.groups.includes(group) ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => toggleGroup(group)}
                              >
                                {group}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button onClick={handleSubmit} className="w-full">
                        {editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Detalles</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarImage src={user.profilePhoto} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-sm">
                      {user.role === 'student' && `Grupo ${user.group}`}
                      {user.role === 'professor' && `Grupos: ${user.groups?.join(', ')}`}
                      {user.role === 'admin' && '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit2 className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          disabled={user.id === currentUser?.id}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
