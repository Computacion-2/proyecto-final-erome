import React, { useMemo, useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Trophy, Medal, Award } from 'lucide-react';

export function StudentLeaderboard() {
  const { currentUser, users, refreshUsers } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  // Listen for user updates
  useEffect(() => {
    const handleUpdate = () => {
      refreshUsers().then(() => {
        setRefreshKey(prev => prev + 1);
      });
    };
    
    window.addEventListener('resolutions-updated', handleUpdate);
    return () => window.removeEventListener('resolutions-updated', handleUpdate);
  }, [refreshUsers]);

  const groupStudents = useMemo(() => {
    if (!currentUser?.group) return [];
    
    return users
      .filter(u => {
        // Normalize group comparison
        const userGroup = u.group?.toString().trim() || '';
        const currentGroup = currentUser.group?.toString().trim() || '';
        return u.role === 'student' && userGroup === currentGroup;
      })
      .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
  }, [users, currentUser, refreshKey]);

  const topFive = groupStudents.slice(0, 5);
  const myPosition = groupStudents.findIndex(s => s.id === currentUser?.id) + 1;

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="size-6 text-yellow-600" />
            Podium - Grupo {currentUser?.group}
          </CardTitle>
          <CardDescription>Top 5 estudiantes con mejor desempeño</CardDescription>
        </CardHeader>
        <CardContent>
          {groupStudents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {!currentUser?.group 
                ? "No tienes un grupo asignado. Contacta a tu profesor."
                : "No hay estudiantes en tu grupo aún"}
            </p>
          ) : topFive.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay estudiantes con puntos aún
            </p>
          ) : (
            <div className="space-y-4">
              {/* Top 3 Podium */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* Second Place */}
                {topFive[1] && (
                  <div className="flex flex-col items-center pt-8">
                    <Avatar className="size-16 mb-2 border-4 border-gray-300">
                      <AvatarImage src={topFive[1].profilePhoto} />
                      <AvatarFallback>{topFive[1].name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Medal className="size-8 text-gray-400 mb-2" />
                    <p className="text-sm text-center">{topFive[1].name}</p>
                    <Badge variant="secondary" className="mt-1">
                      {topFive[1].totalPoints || 0} pts
                    </Badge>
                  </div>
                )}

                {/* First Place */}
                {topFive[0] && (
                  <div className="flex flex-col items-center">
                    <Avatar className="size-20 mb-2 border-4 border-yellow-400">
                      <AvatarImage src={topFive[0].profilePhoto} />
                      <AvatarFallback>{topFive[0].name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Trophy className="size-10 text-yellow-600 mb-2" />
                    <p className="text-sm text-center">{topFive[0].name}</p>
                    <Badge className="mt-1 bg-yellow-600">
                      {topFive[0].totalPoints || 0} pts
                    </Badge>
                  </div>
                )}

                {/* Third Place */}
                {topFive[2] && (
                  <div className="flex flex-col items-center pt-12">
                    <Avatar className="size-14 mb-2 border-4 border-orange-400">
                      <AvatarImage src={topFive[2].profilePhoto} />
                      <AvatarFallback>{topFive[2].name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Medal className="size-7 text-orange-600 mb-2" />
                    <p className="text-sm text-center">{topFive[2].name}</p>
                    <Badge variant="secondary" className="mt-1">
                      {topFive[2].totalPoints || 0} pts
                    </Badge>
                  </div>
                )}
              </div>

              {/* Positions 4-5 */}
              {topFive.slice(3).map((student, index) => {
                const position = index + 4;
                const Icon = getMedalIcon(position);

                return (
                  <div
                    key={student.id}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      student.id === currentUser?.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50'
                    }`}
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
          )}
        </CardContent>
      </Card>

      {/* My Position */}
      {myPosition > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tu Posición</CardTitle>
          </CardHeader>
          <CardContent>
            {myPosition <= 5 ? (
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-center size-10 rounded-full bg-white">
                  <Trophy className="size-5 text-yellow-600" />
                </div>
                <Avatar className="size-12">
                  <AvatarImage src={currentUser?.profilePhoto} />
                  <AvatarFallback>{currentUser?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{currentUser?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ¡Estás en el Top 5! Posición #{myPosition}
                  </p>
                </div>
                <Badge className="bg-yellow-600">{currentUser?.totalPoints || 0} pts</Badge>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center size-10 rounded-full bg-white">
                  <span className="font-medium">{myPosition}</span>
                </div>
                <Avatar className="size-12">
                  <AvatarImage src={currentUser?.profilePhoto} />
                  <AvatarFallback>{currentUser?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{currentUser?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {topFive.length > 0 && topFive[4] && (
                      <>A {Math.abs((topFive[4]?.totalPoints || 0) - (currentUser?.totalPoints || 0))} puntos del top 5</>
                    )}
                  </p>
                </div>
                <Badge variant="secondary">{currentUser?.totalPoints || 0} pts</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
