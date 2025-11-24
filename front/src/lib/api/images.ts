import { apiClient } from '../api';

export interface ImageUploadResponse {
  key: string;
  url: string;
}

export interface ImageUrlResponse {
  url: string;
}

export const imagesApi = {
  async uploadImage(file: File): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return await apiClient.postFormData<ImageUploadResponse>('/images/upload', formData);
  },

  async getImageUrl(key: string): Promise<ImageUrlResponse> {
    return await apiClient.get<ImageUrlResponse>(`/images/${key}`);
  },

  async deleteImage(key: string): Promise<void> {
    return await apiClient.delete(`/images/${key}`);
  },
};

