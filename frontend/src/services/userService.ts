import api from '../config/api';
import type { User } from '../types';

export const userService = {
  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  async getUserById(id: number): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  async createUser(user: Partial<User>): Promise<User> {
    const response = await api.post<User>('/users', user);
    return response.data;
  },

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    const response = await api.put<User>(`/users/${id}`, user);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async getUsersByRole(roleId: number): Promise<User[]> {
    const response = await api.get<User[]>(`/users/role/${roleId}`);
    return response.data;
  },
};

