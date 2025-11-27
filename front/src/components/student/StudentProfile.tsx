import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Upload, User, Mail, Users, Award, Trophy } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { imagesApi } from '../../lib/api/images';

export function StudentProfile() {
  const { currentUser, updateProfile, refreshCurrentUser } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Listen for resolution updates to refresh user data
  useEffect(() => {
    const handleUpdate = () => {
      refreshCurrentUser().then(() => {
        setRefreshKey(prev => prev + 1);
      });
    };
    
    window.addEventListener('resolutions-updated', handleUpdate);
    // Also refresh on mount to ensure we have latest data
    refreshCurrentUser();
    
    return () => window.removeEventListener('resolutions-updated', handleUpdate);
  }, [refreshCurrentUser]);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    profilePhoto: currentUser?.profilePhoto || '',
  });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingPhoto(true);
      try {
        const response = await imagesApi.uploadImage(file);
        setFormData({ ...formData, profilePhoto: response.url });
        toast.success('Foto subida exitosamente');
      } catch (error) {
        console.error('Failed to upload photo:', error);
        toast.error('Error al subir la foto. Por favor intenta de nuevo.');
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    }
  };

  const getCategoryInfo = (category?: string) => {
    switch (category) {
      case 'pro':
        return { label: 'Pro', color: 'bg-purple-100 text-purple-800 border-purple-300', description: '500+ puntos' };
      case 'killer':
        return { label: 'Killer', color: 'bg-blue-100 text-blue-800 border-blue-300', description: '250-499 puntos' };
      default:
        return { label: 'Principiante', color: 'bg-green-100 text-green-800 border-green-300', description: '0-249 puntos' };
    }
  };

  const categoryInfo = getCategoryInfo(currentUser?.performanceCategory);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mi Perfil</CardTitle>
          <CardDescription>Información personal y estadísticas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Photo */}
          <div className="flex items-center gap-6">
            <Avatar className="size-24">
              <AvatarImage src={isEditing ? formData.profilePhoto : currentUser?.profilePhoto} />
              <AvatarFallback className="text-2xl">
                {currentUser?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <div>
                <Label
                  htmlFor="photo-upload"
                  className={`flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent ${uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="size-4" />
                  {uploadingPhoto ? 'Subiendo...' : 'Cambiar foto'}
                </Label>
                <Input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                <User className="size-4 inline mr-2" />
                Nombre
              </Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-md">{currentUser?.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                <Mail className="size-4 inline mr-2" />
                Correo electrónico
              </Label>
              <p className="px-3 py-2 bg-gray-50 rounded-md">{currentUser?.email}</p>
            </div>

            <div className="space-y-2">
              <Label>
                <Users className="size-4 inline mr-2" />
                Grupo
              </Label>
              <p className="px-3 py-2 bg-gray-50 rounded-md">{currentUser?.group || 'No asignado'}</p>
            </div>

            <div className="space-y-2">
              <Label>
                <Trophy className="size-4 inline mr-2 text-yellow-600" />
                Puntos Totales
              </Label>
              <div className="px-4 py-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-md border-2 border-yellow-300">
                <div className="flex items-center gap-2">
                  <Trophy className="size-5 text-yellow-600" />
                  <p className="text-3xl font-bold text-yellow-700">{currentUser?.totalPoints || 0}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Puntos acumulados</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                <Award className="size-4 inline mr-2" />
                Nivel inicial seleccionado
              </Label>
              <p className="px-3 py-2 bg-gray-50 rounded-md capitalize">
                {currentUser?.studentRole || 'No seleccionado'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave}>Guardar cambios</Button>
                <Button variant="outline" onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: currentUser?.name || '',
                    profilePhoto: currentUser?.profilePhoto || '',
                  });
                }}>
                  Cancelar
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Editar perfil</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Category */}
      <Card>
        <CardHeader>
          <CardTitle>Categoría de Desempeño</CardTitle>
          <CardDescription>Basada en tu rendimiento actual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Badge className={categoryInfo.color + ' text-lg px-4 py-2'}>
                {categoryInfo.label}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                {categoryInfo.description}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <Trophy className="size-6 text-yellow-600" />
                <p className="text-3xl font-bold">{currentUser?.totalPoints || 0}</p>
              </div>
              <p className="text-sm text-muted-foreground">puntos totales</p>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <p className="text-sm">Progreso al siguiente nivel:</p>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{
                  width: `${Math.min(
                    ((currentUser?.totalPoints || 0) % 250) / 250 * 100,
                    100
                  )}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {currentUser?.performanceCategory === 'pro'
                ? '¡Ya alcanzaste el nivel máximo!'
                : `${250 - ((currentUser?.totalPoints || 0) % 250)} puntos para el siguiente nivel`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
