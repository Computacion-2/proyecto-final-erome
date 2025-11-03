import api from '../config/api';
import type { Group } from '../types';

export const groupService = {
  async getAllGroups(): Promise<Group[]> {
    const response = await api.get<Group[]>('/groups');
    return response.data;
  },

  async getGroupsBySemester(semesterId: number): Promise<Group[]> {
    const response = await api.get<Group[]>(`/groups/semester/${semesterId}`);
    return response.data;
  },

  async getGroupById(id: number): Promise<Group> {
    const response = await api.get<Group>(`/groups/${id}`);
    return response.data;
  },
};

