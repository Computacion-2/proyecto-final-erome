import React, { useState } from 'react';
import { DataProvider } from './DataContext';
import { ProfessorHeader } from './professor/ProfessorHeader';
import { ProfessorOverview } from './professor/ProfessorOverview';
import { ProfessorExercises } from './professor/ProfessorExercises';
import { ProfessorActivities } from './professor/ProfessorActivities';
import { ProfessorStudents } from './professor/ProfessorStudents';
import { ProfessorLeaderboard } from './professor/ProfessorLeaderboard';
import { ProfessorAnalytics } from './professor/ProfessorAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Home, BookOpen, Activity, Users, Trophy, BarChart3 } from 'lucide-react';

export function ProfessorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <DataProvider>
      <div className="min-h-screen bg-gray-50">
        <ProfessorHeader />
        
        <div className="container mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6 max-w-4xl mx-auto mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Home className="size-4" />
                <span className="hidden sm:inline">Inicio</span>
              </TabsTrigger>
              <TabsTrigger value="exercises" className="flex items-center gap-2">
                <BookOpen className="size-4" />
                <span className="hidden sm:inline">Ejercicios</span>
              </TabsTrigger>
              <TabsTrigger value="activities" className="flex items-center gap-2">
                <Activity className="size-4" />
                <span className="hidden sm:inline">Actividades</span>
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center gap-2">
                <Users className="size-4" />
                <span className="hidden sm:inline">Estudiantes</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                <Trophy className="size-4" />
                <span className="hidden sm:inline">Podium</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="size-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <ProfessorOverview />
            </TabsContent>

            <TabsContent value="exercises">
              <ProfessorExercises />
            </TabsContent>

            <TabsContent value="activities">
              <ProfessorActivities />
            </TabsContent>

            <TabsContent value="students">
              <ProfessorStudents />
            </TabsContent>

            <TabsContent value="leaderboard">
              <ProfessorLeaderboard />
            </TabsContent>

            <TabsContent value="analytics">
              <ProfessorAnalytics />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DataProvider>
  );
}
