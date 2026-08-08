import prisma from '../config/prisma';
import { ApiError } from '../utils/errors';
import { CreateTaskInput, UpdateTaskInput } from '../validators/task.validator';

export class TaskService {
  static async createTask(userId: string, data: CreateTaskInput) {
    // Verify user story exists
    const story = await prisma.userStory.findUnique({ where: { id: data.userStoryId } });
    if (!story) {
      throw ApiError.notFound('Parent user story not found');
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || 'TODO',
        priority: data.priority || 'MEDIUM',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        userStoryId: data.userStoryId,
      },
      include: {
        userStory: { select: { id: true, title: true, projectId: true } },
        comments: true,
      },
    });

    // Record Activity Log
    await prisma.activityLog.create({
      data: {
        action: 'TASK_CREATED',
        entityType: 'TASK',
        entityId: task.id,
        details: `Task "${task.title}" created in user story "${story.title}"`,
        userId,
      },
    });

    return task;
  }

  static async getTasks(filters?: { userStoryId?: string; status?: string; priority?: string; search?: string }) {
    const where: any = {};

    if (filters?.userStoryId) {
      where.userStoryId = filters.userStoryId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.priority) {
      where.priority = filters.priority;
    }
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    return prisma.task.findMany({
      where,
      include: {
        userStory: {
          select: {
            id: true,
            title: true,
            project: { select: { id: true, name: true } },
          },
        },
        comments: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getTaskById(id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        userStory: {
          include: {
            project: { select: { id: true, name: true } },
          },
        },
        comments: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    return task;
  }

  static async updateTask(id: string, userId: string, data: UpdateTaskInput) {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound('Task not found');
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.userStoryId !== undefined) updateData.userStoryId = data.userStoryId;
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    const updated = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        userStory: { select: { id: true, title: true } },
        comments: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    // Check status change vs general update for logging
    const action = existing.status !== updated.status ? 'TASK_STATUS_CHANGED' : 'TASK_UPDATED';
    const details =
      existing.status !== updated.status
        ? `Task "${updated.title}" status changed from ${existing.status} to ${updated.status}`
        : `Task "${updated.title}" details were updated`;

    await prisma.activityLog.create({
      data: {
        action,
        entityType: 'TASK',
        entityId: updated.id,
        details,
        userId,
      },
    });

    return updated;
  }

  static async deleteTask(id: string, userId: string) {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound('Task not found');
    }

    await prisma.task.delete({ where: { id } });

    // Record Activity Log
    await prisma.activityLog.create({
      data: {
        action: 'TASK_DELETED',
        entityType: 'TASK',
        entityId: id,
        details: `Task "${existing.title}" was deleted`,
        userId,
      },
    });

    return { message: 'Task deleted successfully' };
  }
}
