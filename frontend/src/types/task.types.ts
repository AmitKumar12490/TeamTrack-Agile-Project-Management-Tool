export type TaskStatusType = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type PriorityType = 'LOW' | 'MEDIUM' | 'HIGH';

export interface CommentUser {
  id: string;
  name: string;
  email: string;
}

export interface Comment {
  id: string;
  message: string;
  taskId: string;
  userId: string;
  user?: CommentUser;
  createdAt: string;
  updatedAt: string;
}

export interface TaskUserStory {
  id: string;
  title: string;
  projectId: string;
  project?: {
    id: string;
    name: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatusType;
  priority: PriorityType;
  dueDate?: string | null;
  userStoryId: string;
  userStory?: TaskUserStory;
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatusType;
  priority?: PriorityType;
  dueDate?: string | null;
  userStoryId: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatusType;
  priority?: PriorityType;
  dueDate?: string | null;
}
