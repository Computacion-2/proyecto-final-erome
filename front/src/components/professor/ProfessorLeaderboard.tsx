import React, { useState, useMemo } from 'react';
import { useAuth } from '../AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Trophy, Medal, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function ProfessorLeaderboard() {
  const { currentUser, users } = useAuth();
  const myGroups = currentUser?.groups || [];
  const [selectedGroup, setSelectedGroup] = useState<string>(myGroups[0] || '');

  const getGroupLeaderboard = (group: string) => {
    return users
      .filter(u => u.role === 'student' && u.group === group)
      .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
      .slice(0, 5);
  };

  const allStudentsLeaderboard = useMemo(() => {
    return users
      .filter(u => u.role === 'student' && myGroups.includes(u.group || ''))
      .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
      .slice(0, 10);
  }, [users, myGroups]);

  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return 'text-yellow-600';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-orange-600';
      default:
        return 'text-gray-300';
    }
  };

  const getMedalIcon = (position: number) => {
    if (position === 1) return Trophy;
    if (position <= 3) return Medal;
    return Award;
  };

  const renderPodium = (students: any[]) => {
    if (students.length === 0) {
      return (
        <p className="text-center text-muted-foreground py-8">
          No hay estudiantes registrados en este grupo
        </p>
      );
    }

    return (
      <div className="space-y-4">
        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Second Place */}
          {students[1] && (
            <div className="flex flex-col items-center pt-8">
              <Avatar className="size-16 mb-2 border-4 border-gray-300">
                <AvatarImage src={students[1].profilePhoto} />
                <AvatarFallback>{students[1].name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Medal className="size-8 text-gray-400 mb-2" />
              <p className="text-sm text-center">{students[1].name}</p>
              <Badge variant="secondary" className="mt-1">
                {students[1].totalPoints || 0} pts
              </Badge>
            </div>
          )}

          {/* First Place */}
          {students[0] && (
            <div className="flex flex-col items-center">
              <Avatar className="size-20 mb-2 border-4 border-yellow-400">
                <AvatarImage src={students[0].profilePhoto} />
                <AvatarFallback>{students[0].name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Trophy className="size-10 text-yellow-600 mb-2" />
              <p className="text-sm text-center">{students[0].name}</p>
              <Badge className="mt-1 bg-yellow-600">
                {students[0].totalPoints || 0} pts
              </Badge>
            </div>
          )}

          {/* Third Place */}
          {students[2] && (
            <div className="flex flex-col items-center pt-12">
              <Avatar className="size-14 mb-2 border-4 border-orange-400">
                <AvatarImage src={students[2].profilePhoto} />
                <AvatarFallback>{students[2].name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Medal className="size-7 text-orange-600 mb-2" />
              <p className="text-sm text-center">{students[2].name}</p>
              <Badge variant="secondary" className="mt-1">
                {students[2].totalPoints || 0} pts
              </Badge>
            </div>
          )}
        </div>

        {/* Positions 4-5 */}
        {students.slice(3).map((student, index) => {
          const position = index + 4;
          const Icon = getMedalIcon(position);

          return (
            <div
              key={student.id}
              className="flex items-center gap-4 p-4 rounded-lg bg-gray-50"
            >
              <div className="flex items-center justify-center size-10 rounded-full bg-white">
                <Icon className={`size-5 ${getMedalColor(position)}`} />
              </div>
              <Avatar className="size-12">
                <AvatarImage src={student.profilePhoto} />
                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{student.name}</p>
                <p className="text-sm text-muted-foreground">Posición {position}</p>
              </div>
              <Badge variant="secondary">{student.totalPoints || 0} pts</Badge>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-1">Podium de Estudiantes</h2>
        <p className="text-sm text-muted-foreground">
          Top 5 estudiantes por grupo y ranking general
        </p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todos los grupos</TabsTrigger>
          {myGroups.map(group => (
            <TabsTrigger key={group} value={group}>
              {group}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="size-6 text-yellow-600" />
                Ranking General
              </CardTitle>
              <CardDescription>Top 10 estudiantes de todos tus grupos</CardDescription>
            </CardHeader>
            <CardContent>
              {allStudentsLeaderboard.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay estudiantes registrados aún
                </p>
              ) : (
                <div className="space-y-2">
                  {allStudentsLeaderboard.map((student, index) => {
                    const position = index + 1;
                    const Icon = getMedalIcon(position);

                    return (
                      <div
                        key={student.id}
                        className={`flex items-center gap-4 p-4 rounded-lg ${
                          position <= 3 ? 'bg-gradient-to-r from-yellow-50 to-white' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-center size-10 rounded-full bg-white border-2">
                          {position <= 3 ? (
                            <Icon className={`size-5 ${getMedalColor(position)}`} />
                          ) : (
                            <span className="text-sm font-medium">{position}</span>
                          )}
                        </div>
                        <Avatar className="size-12">
                          <AvatarImage src={student.profilePhoto} />
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">Grupo {student.group}</p>
                        </div>
                        <Badge variant="secondary" className="text-base px-3 py-1">
                          {student.totalPoints || 0} pts
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {myGroups.map(group => (
          <TabsContent key={group} value={group} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="size-6 text-yellow-600" />
                  Podium - Grupo {group}
                </CardTitle>
                <CardDescription>Top 5 estudiantes del grupo</CardDescription>
              </CardHeader>
              <CardContent>
                {renderPodium(getGroupLeaderboard(group))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
