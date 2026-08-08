import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { ApiError } from '../utils/errors';
import { CreateProjectInput, UpdateProjectInput } from '../validators/project.validator';

export class ProjectService {
  static async createProject(userId: string, data: CreateProjectInput) {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        ownerId: userId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { userStories: true },
        },
      },
    });

    // Record Activity Log
    await prisma.activityLog.create({
      data: {
        action: 'PROJECT_CREATED',
        entityType: 'PROJECT',
        entityId: project.id,
        details: `Project "${project.name}" was created`,
        userId,
      },
    });

    return project;
  }

  static async getProjects(search?: string) {
    const where: Prisma.ProjectWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    return prisma.project.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        userStories: {
          include: {
            tasks: {
              select: { id: true, status: true, priority: true },
            },
          },
        },
        _count: {
          select: { userStories: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getProjectById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        userStories: {
          include: {
            tasks: {
              include: {
                comments: {
                  include: {
                    user: { select: { id: true, name: true, email: true } },
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    return project;
  }

  static async updateProject(id: string, userId: string, data: UpdateProjectInput) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound('Project not found');
    }

    if (existing.ownerId !== userId) {
      throw ApiError.forbidden('Only the project owner can update this project');
    }

    const updated = await prisma.project.update({
      where: { id },
      data,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Record Activity Log
    await prisma.activityLog.create({
      data: {
        action: 'PROJECT_UPDATED',
        entityType: 'PROJECT',
        entityId: updated.id,
        details: `Project "${updated.name}" details were updated`,
        userId,
      },
    });

    return updated;
  }

  static async deleteProject(id: string, userId: string) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound('Project not found');
    }

    if (existing.ownerId !== userId) {
      throw ApiError.forbidden('Only the project owner can delete this project');
    }

    await prisma.project.delete({ where: { id } });

    // Record Activity Log
    await prisma.activityLog.create({
      data: {
        action: 'PROJECT_DELETED',
        entityType: 'PROJECT',
        entityId: id,
        details: `Project "${existing.name}" was deleted`,
        userId,
      },
    });

    return { message: 'Project deleted successfully' };
  }
}
