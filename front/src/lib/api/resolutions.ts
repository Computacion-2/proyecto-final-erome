import { apiClient } from '../api';

export interface Resolution {
  id: number;
  studentId: number;
  exerciseId: number;
  pointsAwarded?: number;
  awardedBy?: number;
  status: string;
  attemptNo: number;
  submittedAt: string;
  code?: string;
  student?: any;
  exercise?: any;
  awardedByProfessor?: any;
}

export const resolutionsApi = {
  async submitResolution(resolution: Partial<Resolution>): Promise<Resolution> {
    return await apiClient.post<Resolution>('/resolutions', resolution);
  },

  async getStudentResolutions(studentId: number): Promise<Resolution[]> {
    return await apiClient.get<Resolution[]>(`/resolutions/student/${studentId}`);
  },

  async getActivityResolutions(activityId: number): Promise<Resolution[]> {
    return await apiClient.get<Resolution[]>(`/resolutions/activity/${activityId}`);
  },

  async assignPoints(id: number, points: number): Promise<Resolution> {
    return await apiClient.put<Resolution>(`/resolutions/${id}/points`, {
      pointsAwarded: points,
    });
  },
};

