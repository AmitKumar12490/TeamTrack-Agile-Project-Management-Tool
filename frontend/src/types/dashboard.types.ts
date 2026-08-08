import { ActivityItem } from './activity.types';

export interface DashboardMetrics {
  totalProjects: number;
  totalUserStories: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

export interface DashboardRecentProject {
  id: string;
  name: string;
  owner?: { name: string };
  _count?: { userStories: number };
  updatedAt: string;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  recentProjects: DashboardRecentProject[];
  recentActivities: ActivityItem[];
}
