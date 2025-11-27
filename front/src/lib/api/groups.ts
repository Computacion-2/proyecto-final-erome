import { apiClient } from '../api';

export interface Group {
  id: number;
  name: string;
  courseId?: number;
  semesterId?: number;
}

export const groupsApi = {
  async getAllGroups(): Promise<Group[]> {
    return await apiClient.get<Group[]>('/groups');
  },

  async getGroupById(id: number): Promise<Group> {
    return await apiClient.get<Group>(`/groups/${id}`);
  },

  async getGroupByName(name: string): Promise<Group> {
    return await apiClient.get<Group>(`/groups/name/${name}`);
  },
};

