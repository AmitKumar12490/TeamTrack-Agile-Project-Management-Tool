import { Task } from './task.types';

export interface UserStory {
  id: string;
  title: string;
  description?: string | null;
  projectId: string;
  tasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserStoryPayload {
  title: string;
  description?: string;
  projectId: string;
}

export interface UpdateUserStoryPayload {
  title?: string;
  description?: string;
}
