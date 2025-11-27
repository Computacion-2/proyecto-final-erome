import { apiClient } from '../api';
import { User } from './auth';

export interface CreateUserRequest extends Partial<User> {
  password?: string;
}

export const usersApi = {
  async getAllUsers(): Promise<User[]> {
    return await apiClient.get<User[]>('/users');
  },

  async getUserById(id: number): Promise<User> {
    return await apiClient.get<User>(`/users/${id}`);
  },

  async createUser(user: CreateUserRequest): Promise<User> {
    return await apiClient.post<User>('/users', user);
  },

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    return await apiClient.put<User>(`/users/${id}`, user);
  },

  async deleteUser(id: number): Promise<void> {
    return await apiClient.delete(`/users/${id}`);
  },
};

