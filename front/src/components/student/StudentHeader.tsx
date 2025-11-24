import React from 'react';
import { useAuth } from '../AuthContext';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { GraduationCap, LogOut } from 'lucide-react';
import { Badge } from '../ui/badge';

export function StudentHeader() {
  const { currentUser, logout } = useAuth();

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'pro':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'killer':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'pro':
        return 'Pro';
      case 'killer':
        return 'Killer';
      default:
        return 'Principiante';
    }
  };

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <GraduationCap className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg">Pensamiento Computacional</h1>
              <p className="text-sm text-muted-foreground">Grupo {currentUser?.group}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge className={getCategoryColor(currentUser?.performanceCategory)}>
              {getCategoryLabel(currentUser?.performanceCategory)}
            </Badge>
            
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={currentUser?.profilePhoto} />
                <AvatarFallback>{currentUser?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm">{currentUser?.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser?.totalPoints || 0} puntos</p>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
