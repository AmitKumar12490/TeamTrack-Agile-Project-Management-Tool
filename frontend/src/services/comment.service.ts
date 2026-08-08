import api from './api';
import { Comment } from '../types/task.types';

export const commentService = {
  async addComment(taskId: string, message: string): Promise<Comment> {
    const response = await api.post('/comments', { taskId, message });
    return response.data.data;
  },

  async getCommentsByTask(taskId: string): Promise<Comment[]> {
    const response = await api.get('/comments', { params: { taskId } });
    return response.data.data;
  },

  async deleteComment(id: string): Promise<void> {
    await api.delete(`/comments/${id}`);
  },
};
