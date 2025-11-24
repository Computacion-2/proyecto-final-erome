import { apiClient } from '../api';

export interface Activity {
  id: number;
  groupId: number;
  professorId: number;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  group?: any;
  professor?: any;
}

export const activitiesApi = {
  async getAllActivities(): Promise<Activity[]> {
    return await apiClient.get<Activity[]>('/activities');
  },

  async getActivityById(id: number): Promise<Activity> {
    return await apiClient.get<Activity>(`/activities/${id}`);
  },

  async getActiveActivities(): Promise<Activity[]> {
    return await apiClient.get<Activity[]>('/activities/active');
  },

  async createActivity(activity: Partial<Activity>): Promise<Activity> {
    return await apiClient.post<Activity>('/activities', activity);
  },

  async updateActivity(id: number, activity: Partial<Activity>): Promise<Activity> {
    return await apiClient.put<Activity>(`/activities/${id}`, activity);
  },

  async deleteActivity(id: number): Promise<void> {
    return await apiClient.delete(`/activities/${id}`);
  },
};

