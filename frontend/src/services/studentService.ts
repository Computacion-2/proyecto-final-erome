import api from '../config/api';
import type { Student, StudentPerformance } from '../types';

export const studentService = {
  async getAllStudents(): Promise<Student[]> {
    const response = await api.get<Student[]>('/students');
    return response.data;
  },

  async getStudentById(id: number): Promise<Student> {
    const response = await api.get<Student>(`/students/${id}`);
    return response.data;
  },

  async getStudentPerformance(studentId: number): Promise<StudentPerformance[]> {
    const response = await api.get<StudentPerformance[]>(`/students/${studentId}/performance`);
    return response.data;
  },
};

