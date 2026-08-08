import api from './api';
import { DashboardData } from '../types/dashboard.types';

export const dashboardService = {
  async getMetrics(): Promise<DashboardData> {
    const response = await api.get('/dashboard');
    return response.data.data;
  },
};
