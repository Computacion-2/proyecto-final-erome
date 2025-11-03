import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Trophy, Zap } from 'lucide-react';

interface ScoreboardEvent {
  id: number;
  studentName: string;
  exerciseTitle: string;
  message: string;
  timestamp: string;
}

interface ScoreboardProps {
  activityId: number;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ activityId }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [events, setEvents] = useState<ScoreboardEvent[]>([]);
  const [leaderboard, setLeaderboard] = useState<Array<{ name: string; points: number }>>([]);

  useEffect(() => {
    // Conectar al WebSocket
    const newSocket = io('http://localhost:8080', {
      path: '/pensamientoComputacional-0.0.1-SNAPSHOT/ws',
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
      newSocket.emit('joinActivity', activityId);
    });

    newSocket.on('scoreboardEvent', (event: ScoreboardEvent) => {
      setEvents((prev) => [event, ...prev].slice(0, 20)); // Mantener últimos 20 eventos
    });

    newSocket.on('leaderboardUpdate', (leaderboard: Array<{ name: string; points: number }>) => {
      setLeaderboard(leaderboard);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [activityId]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Zap className="h-6 w-6 mr-2 text-yellow-500" />
          Scoreboard en Tiempo Real
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay actividad aún</p>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 animate-pulse-once"
                >
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{event.studentName}</span>{' '}
                    {event.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{event.exerciseTitle}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
            Ranking
          </h3>
          <div className="space-y-2">
            {leaderboard.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay participantes aún</p>
            ) : (
              leaderboard.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-primary-600">#{index + 1}</span>
                    <span className="font-medium text-gray-900">{entry.name}</span>
                  </div>
                  <span className="font-semibold text-primary-600">{entry.points} pts</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

