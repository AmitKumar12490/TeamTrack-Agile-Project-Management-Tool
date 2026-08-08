import api from './api';
import { ActivityItem } from '../types/activity.types';

export const activityService = {
  async getActivities(limit = 50): Promise<ActivityItem[]> {
    const response = await api.get('/activities', { params: { limit } });
    return response.data.data;
  },
};
