import api from './api';
import { UserStory, CreateUserStoryPayload, UpdateUserStoryPayload } from '../types/story.types';

export const storyService = {
  async getStoriesByProject(projectId: string): Promise<UserStory[]> {
    const response = await api.get('/stories', { params: { projectId } });
    return response.data.data;
  },

  async getStoryById(id: string): Promise<UserStory> {
    const response = await api.get(`/stories/${id}`);
    return response.data.data;
  },

  async createStory(payload: CreateUserStoryPayload): Promise<UserStory> {
    const response = await api.post('/stories', payload);
    return response.data.data;
  },

  async updateStory(id: string, payload: UpdateUserStoryPayload): Promise<UserStory> {
    const response = await api.put(`/stories/${id}`, payload);
    return response.data.data;
  },

  async deleteStory(id: string): Promise<void> {
    await api.delete(`/stories/${id}`);
  },
};
