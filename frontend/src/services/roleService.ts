import api from '../config/api';
import type { Role } from '../types';

export const roleService = {
  async getAllRoles(): Promise<Role[]> {
    const response = await api.get<Role[]>('/roles');
    return response.data;
  },

  async getRoleById(id: number): Promise<Role> {
    const response = await api.get<Role>(`/roles/${id}`);
    return response.data;
  },
};

