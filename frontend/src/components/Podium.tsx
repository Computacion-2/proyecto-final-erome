import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

interface PodiumStudent {
  id: number;
  name: string;
  points: number;
  group?: string;
}

interface PodiumProps {
  students: PodiumStudent[];
  showAllGroups?: boolean;
}

export const Podium: React.FC<PodiumProps> = ({ students, showAllGroups = false }) => {
  const topStudents = students.slice(0, 5);

  const getMedal = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 1:
        return <Medal className="h-8 w-8 text-gray-400" />;
      case 2:
        return <Medal className="h-8 w-8 text-amber-600" />;
      default:
        return <Award className="h-6 w-6 text-primary-500" />;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 0:
        return 'bg-yellow-100 border-yellow-300';
      case 1:
        return 'bg-gray-100 border-gray-300';
      case 2:
        return 'bg-amber-100 border-amber-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Podium - Top 5</h2>
      <div className="space-y-4">
        {topStudents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay estudiantes en el podium aún</p>
        ) : (
          topStudents.map((student, index) => (
            <div
              key={student.id}
              className={`flex items-center space-x-4 p-4 rounded-lg border-2 ${getPositionColor(index)}`}
            >
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-50">
                  <span className="text-xl font-bold text-primary-600">#{index + 1}</span>
                </div>
              </div>
              <div className="flex-shrink-0">{getMedal(index)}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{student.name}</h3>
                {showAllGroups && student.group && (
                  <p className="text-sm text-gray-500">{student.group}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-600">{student.points}</p>
                <p className="text-xs text-gray-500">puntos</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

