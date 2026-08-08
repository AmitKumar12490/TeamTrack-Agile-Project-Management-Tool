import prisma from '../config/prisma';
import { ApiError } from '../utils/errors';
import { CreateCommentInput } from '../validators/comment.validator';

export class CommentService {
  static async addComment(userId: string, data: CreateCommentInput) {
    const task = await prisma.task.findUnique({ where: { id: data.taskId } });
    if (!task) {
      throw ApiError.notFound('Target task not found');
    }

    const comment = await prisma.comment.create({
      data: {
        message: data.message,
        taskId: data.taskId,
        userId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Record Activity Log
    await prisma.activityLog.create({
      data: {
        action: 'COMMENT_ADDED',
        entityType: 'COMMENT',
        entityId: comment.id,
        details: `Comment added to task "${task.title}"`,
        userId,
      },
    });

    return comment;
  }

  static async getCommentsByTask(taskId: string) {
    return prisma.comment.findMany({
      where: { taskId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async deleteComment(id: string, userId: string) {
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      throw ApiError.notFound('Comment not found');
    }

    if (comment.userId !== userId) {
      throw ApiError.forbidden('You are not authorized to delete this comment');
    }

    await prisma.comment.delete({ where: { id } });

    return { message: 'Comment deleted successfully' };
  }
}
