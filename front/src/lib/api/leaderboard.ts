import { apiClient } from '../api';
import { User } from './auth';

export const leaderboardApi = {
  async getGroupLeaderboard(groupName: string): Promise<User[]> {
    return await apiClient.get<User[]>(`/leaderboard/group/${groupName}`);
  },

  async getAllGroupsLeaderboard(): Promise<Record<string, User[]>> {
    return await apiClient.get<Record<string, User[]>>('/leaderboard/all');
  },
};

