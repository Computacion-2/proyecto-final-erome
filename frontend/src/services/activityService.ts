import api from '../config/api';
import type { Activity, Exercise } from '../types';

export const activityService = {
  async getAllActivities(): Promise<Activity[]> {
    const response = await api.get<Activity[]>('/activities');
    return response.data;
  },

  async getActivityById(id: number): Promise<Activity> {
    const response = await api.get<Activity>(`/activities/${id}`);
    return response.data;
  },

  async createActivity(activity: Partial<Activity>): Promise<Activity> {
    const response = await api.post<Activity>('/activities', activity);
    return response.data;
  },

  async updateActivity(id: number, activity: Partial<Activity>): Promise<Activity> {
    const response = await api.put<Activity>(`/activities/${id}`, activity);
    return response.data;
  },

  async deleteActivity(id: number): Promise<void> {
    await api.delete(`/activities/${id}`);
  },

  async getExercisesByActivity(activityId: number): Promise<Exercise[]> {
    const response = await api.get<Exercise[]>(`/activities/${activityId}/exercises`);
    return response.data;
  },

  async createExercise(exercise: Partial<Exercise>): Promise<Exercise> {
    const response = await api.post<Exercise>('/exercises', exercise);
    return response.data;
  },
};

