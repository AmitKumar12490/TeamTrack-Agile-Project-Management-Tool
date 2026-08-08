import api from './api';
import { Task, CreateTaskPayload, UpdateTaskPayload, TaskStatusType } from '../types/task.types';

export const taskService = {
  async getTasks(params?: { userStoryId?: string; status?: string; priority?: string; search?: string }): Promise<Task[]> {
    const response = await api.get('/tasks', { params });
    return response.data.data;
  },

  async getTaskById(id: string): Promise<Task> {
    const response = await api.get(`/tasks/${id}`);
    return response.data.data;
  },

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    const response = await api.post('/tasks', payload);
    return response.data.data;
  },

  async updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
    const response = await api.put(`/tasks/${id}`, payload);
    return response.data.data;
  },

  async updateTaskStatus(id: string, status: TaskStatusType): Promise<Task> {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
};
