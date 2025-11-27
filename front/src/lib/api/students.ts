import { apiClient } from '../api';

export interface Student {
  id: number;
  name: string;
  email: string;
  group?: string;
  totalPoints?: number;
  performanceCategory?: string;
}

export const studentsApi = {
  async getAllStudents(): Promise<Student[]> {
    return await apiClient.get<Student[]>('/students');
  },

  async getStudentById(id: number): Promise<Student> {
    return await apiClient.get<Student>(`/students/${id}`);
  },

  async getStudentsByGroup(groupName: string): Promise<Student[]> {
    return await apiClient.get<Student[]>(`/students/group/${groupName}`);
  },
};

