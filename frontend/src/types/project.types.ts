import { UserStory } from './story.types';

export interface ProjectOwner {
  id: string;
  name: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  owner?: ProjectOwner;
  userStories?: UserStory[];
  _count?: {
    userStories: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
}
