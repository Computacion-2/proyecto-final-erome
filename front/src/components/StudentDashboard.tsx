import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { DataProvider } from './DataContext';
import { StudentHeader } from './student/StudentHeader';
import { StudentOverview } from './student/StudentOverview';
import { StudentActivities } from './student/StudentActivities';
import { StudentLeaderboard } from './student/StudentLeaderboard';
import { StudentProfile } from './student/StudentProfile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Home, Activity, Trophy, User } from 'lucide-react';

export function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <DataProvider>
      <div className="min-h-screen bg-gray-50">
        <StudentHeader />
        
        <div className="container mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Home className="size-4" />
                <span className="hidden sm:inline">Inicio</span>
              </TabsTrigger>
              <TabsTrigger value="activities" className="flex items-center gap-2">
                <Activity className="size-4" />
                <span className="hidden sm:inline">Actividades</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                <Trophy className="size-4" />
                <span className="hidden sm:inline">Podium</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="size-4" />
                <span className="hidden sm:inline">Perfil</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <StudentOverview />
            </TabsContent>

            <TabsContent value="activities">
              <StudentActivities />
            </TabsContent>

            <TabsContent value="leaderboard">
              <StudentLeaderboard />
            </TabsContent>

            <TabsContent value="profile">
              <StudentProfile />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DataProvider>
  );
}
