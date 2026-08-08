import api from './api';
import { Project, CreateProjectPayload, UpdateProjectPayload } from '../types/project.types';

export const projectService = {
  async getProjects(search?: string): Promise<Project[]> {
    const response = await api.get('/projects', { params: { search } });
    return response.data.data;
  },

  async getProjectById(id: string): Promise<Project> {
    const response = await api.get(`/projects/${id}`);
    return response.data.data;
  },

  async createProject(payload: CreateProjectPayload): Promise<Project> {
    const response = await api.post('/projects', payload);
    return response.data.data;
  },

  async updateProject(id: string, payload: UpdateProjectPayload): Promise<Project> {
    const response = await api.put(`/projects/${id}`, payload);
    return response.data.data;
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },
};
