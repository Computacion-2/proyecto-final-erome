import React, { useState, useMemo } from 'react';
import { useAuth } from '../AuthContext';
import { useData } from '../DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Users, Search, Mail, Award } from 'lucide-react';

export function ProfessorStudents() {
  const { currentUser, users } = useAuth();
  const { submissions, getCurrentSemester } = useData();
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const currentSemester = getCurrentSemester();
  const myGroups = currentUser?.groups || [];

  const filteredStudents = useMemo(() => {
    let students = users.filter(u => {
      if (u.role !== 'student') return false;
      if (!myGroups.includes(u.group || '')) return false;
      if (selectedGroup !== 'all' && u.group !== selectedGroup) return false;
      if (searchQuery && !u.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    return students.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
  }, [users, myGroups, selectedGroup, searchQuery]);

  const getCategoryInfo = (category?: string) => {
    switch (category) {
      case 'pro':
        return { label: 'Pro', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'killer':
        return { label: 'Killer', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      default:
        return { label: 'Principiante', color: 'bg-green-100 text-green-800 border-green-300' };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-1">Estudiantes Registrados</h2>
        <p className="text-sm text-muted-foreground">
          Semestre {currentSemester} • {filteredStudents.length} estudiante{filteredStudents.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm">Grupo</label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los grupos</SelectItem>
                  {myGroups.map(group => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="size-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery
                ? 'No se encontraron estudiantes con ese nombre'
                : 'No hay estudiantes registrados aún'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => {
            const studentSubmissions = submissions.filter(s => s.studentId === student.id);
            const exercisesCompleted = new Set(studentSubmissions.map(s => s.exerciseId)).size;
            const categoryInfo = getCategoryInfo(student.performanceCategory);

            return (
              <Card key={student.id}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Avatar className="size-12">
                      <AvatarImage src={student.profilePhoto} />
                      <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{student.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 text-xs">
                        <Mail className="size-3" />
                        {student.email}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Grupo:</span>
                    <Badge variant="outline">{student.group}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Puntos:</span>
                    <span className="font-medium text-blue-600">{student.totalPoints || 0}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Ejercicios:</span>
                    <span className="font-medium">{exercisesCompleted}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Nivel inicial:</span>
                    <Badge variant="outline" className="capitalize text-xs">
                      {student.studentRole}
                    </Badge>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Award className="size-3" />
                        Categoría:
                      </div>
                      <Badge className={categoryInfo.color + ' text-xs'}>
                        {categoryInfo.label}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
