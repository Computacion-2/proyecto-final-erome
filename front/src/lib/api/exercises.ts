import { apiClient } from '../api';

export interface Exercise {
  id: number;
  activityId?: number | null;
  title: string;
  statement: string;
  difficulty: number;
  maxPoints: number;
  activity?: any;
}

export const exercisesApi = {
  async getAllExercises(): Promise<Exercise[]> {
    return await apiClient.get<Exercise[]>('/exercises');
  },

  async getExerciseById(id: number): Promise<Exercise> {
    return await apiClient.get<Exercise>(`/exercises/${id}`);
  },

  async getExercisesByActivity(activityId: number): Promise<Exercise[]> {
    return await apiClient.get<Exercise[]>(`/exercises/activity/${activityId}`);
  },

  async createExercise(exercise: Partial<Exercise>): Promise<Exercise> {
    return await apiClient.post<Exercise>('/exercises', exercise);
  },

  async updateExercise(id: number, exercise: Partial<Exercise>): Promise<Exercise> {
    return await apiClient.put<Exercise>(`/exercises/${id}`, exercise);
  },

  async deleteExercise(id: number): Promise<void> {
    return await apiClient.delete(`/exercises/${id}`);
  },
};

