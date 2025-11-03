import api from '../config/api';
import type { Semester } from '../types';

export const semesterService = {
  async getAllSemesters(): Promise<Semester[]> {
    const response = await api.get<Semester[]>('/semesters');
    return response.data;
  },

  async getActiveSemester(): Promise<Semester | null> {
    const semesters = await this.getAllSemesters();
    return semesters.find(s => s.isActive) || null;
  },

  async getSemesterById(id: number): Promise<Semester> {
    const response = await api.get<Semester>(`/semesters/${id}`);
    return response.data;
  },
};

