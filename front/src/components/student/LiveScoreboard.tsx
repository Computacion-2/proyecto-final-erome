import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useData } from '../DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Trophy, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { safeLocalStorage } from '../../lib/storage';

interface ScoreboardEvent {
  type: string;
  studentName: string;
  exerciseId: string;
  timestamp: number;
}

export function LiveScoreboard({ activityId }: { activityId: string }) {
  const { currentUser, users } = useAuth();
  const { submissions, exercises } = useData();
  const [recentEvents, setRecentEvents] = useState<ScoreboardEvent[]>([]);
  const [leaderboard, setLeaderboard] = useState<Array<{ name: string; points: number; count: number }>>([]);

  useEffect(() => {
    // Listen for submission events (simulating WebSocket)
    const handleStorageChange = () => {
      const eventData = safeLocalStorage.getItem('scoreboard_event');
      if (eventData) {
        const event: ScoreboardEvent = JSON.parse(eventData);
        setRecentEvents(prev => [event, ...prev.slice(0, 4)]);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    // Calculate leaderboard for this activity
    const activitySubmissions = submissions.filter(s => s.activityId === activityId);
    const studentScores = new Map<string, { points: number; count: number }>();

    activitySubmissions.forEach(submission => {
      const existing = studentScores.get(submission.studentId) || { points: 0, count: 0 };
      studentScores.set(submission.studentId, {
        points: existing.points + submission.points,
        count: existing.count + 1,
      });
    });

    const leaderboardData = Array.from(studentScores.entries())
      .map(([studentId, data]) => {
        const user = users.find(u => u.id === studentId);
        return {
          name: user?.name || 'Desconocido',
          points: data.points,
          count: data.count,
        };
      })
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);

    setLeaderboard(leaderboardData);
  }, [submissions, activityId, users]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="size-5 text-yellow-600" />
            Actividad en Vivo
          </CardTitle>
          <CardDescription>Ejercicios resueltos en tiempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {recentEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Esperando actividad...
              </p>
            ) : (
              <div className="space-y-2">
                {recentEvents.map((event, index) => (
                  <motion.div
                    key={event.timestamp}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <p className="text-sm">
                      <span className="font-medium text-green-700">{event.studentName}</span>
                      {' '}ha resuelto un ejercicio
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Hace {Math.floor((Date.now() - event.timestamp) / 1000)}s
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="size-5 text-yellow-600" />
            Tabla de Posiciones
          </CardTitle>
          <CardDescription>Ranking de la actividad actual</CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aún no hay puntuaciones
            </p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    entry.name === currentUser?.name ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center size-8 rounded-full bg-white border-2">
                    {index < 3 ? (
                      <Trophy
                        className={`size-4 ${
                          index === 0
                            ? 'text-yellow-600'
                            : index === 1
                            ? 'text-gray-400'
                            : 'text-orange-600'
                        }`}
                      />
                    ) : (
                      <span className="text-sm">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.count} ejercicio{entry.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Badge variant="secondary">{entry.points} pts</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}