import prisma from '../config/prisma';
import { ApiError } from '../utils/errors';
import { CreateStoryInput, UpdateStoryInput } from '../validators/story.validator';

export class StoryService {
  static async createStory(userId: string, data: CreateStoryInput) {
    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: data.projectId } });
    if (!project) {
      throw ApiError.notFound('Parent project not found');
    }

    const story = await prisma.userStory.create({
      data: {
        title: data.title,
        description: data.description,
        projectId: data.projectId,
      },
      include: {
        project: { select: { id: true, name: true } },
        tasks: true,
      },
    });

    // Record Activity Log
    await prisma.activityLog.create({
      data: {
        action: 'STORY_CREATED',
        entityType: 'USER_STORY',
        entityId: story.id,
        details: `User Story "${story.title}" created in project "${project.name}"`,
        userId,
      },
    });

    return story;
  }

  static async getStoriesByProject(projectId: string) {
    return prisma.userStory.findMany({
      where: { projectId },
      include: {
        tasks: {
          include: {
            comments: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getStoryById(id: string) {
    const story = await prisma.userStory.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
        tasks: {
          include: {
            comments: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!story) {
      throw ApiError.notFound('User story not found');
    }

    return story;
  }

  static async updateStory(id: string, userId: string, data: UpdateStoryInput) {
    const existing = await prisma.userStory.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound('User story not found');
    }

    const updated = await prisma.userStory.update({
      where: { id },
      data,
      include: { tasks: true },
    });

    // Record Activity Log
    await prisma.activityLog.create({
      data: {
        action: 'STORY_UPDATED',
        entityType: 'USER_STORY',
        entityId: updated.id,
        details: `User Story "${updated.title}" was updated`,
        userId,
      },
    });

    return updated;
  }

  static async deleteStory(id: string, userId: string) {
    const existing = await prisma.userStory.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound('User story not found');
    }

    await prisma.userStory.delete({ where: { id } });

    // Record Activity Log
    await prisma.activityLog.create({
      data: {
        action: 'STORY_DELETED',
        entityType: 'USER_STORY',
        entityId: id,
        details: `User Story "${existing.title}" was deleted`,
        userId,
      },
    });

    return { message: 'User story deleted successfully' };
  }
}
