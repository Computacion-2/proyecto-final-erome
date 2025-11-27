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

  async assignPoints(id: number, points: number, code?: string): Promise<Resolution> {
    return await apiClient.put<Resolution>(`/resolutions/${id}/points`, {
      pointsAwarded: points,
      code: code,
    });
  },
  
  async createOrUpdateResolution(studentId: number, exerciseId: number, points: number, code: string): Promise<Resolution> {
    // Use the new endpoint that handles both create and update
    return await apiClient.post<Resolution>('/resolutions/assign', {
      studentId,
      exerciseId,
      code,
      pointsAwarded: points,
    });
  },
  
  async validateCode(id: number, code: string): Promise<Resolution> {
    return await apiClient.post<Resolution>(`/resolutions/${id}/validate-code`, {
      code,
    });
  },
};

