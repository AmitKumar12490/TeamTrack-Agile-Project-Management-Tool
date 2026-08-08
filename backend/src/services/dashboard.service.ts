import prisma from '../config/prisma';

export class DashboardService {
  static async getMetrics() {
    const now = new Date();

    const [
      totalProjects,
      totalUserStories,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      recentProjects,
      recentActivities,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.userStory.count(),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'DONE' } }),
      prisma.task.count({ where: { status: { in: ['TODO', 'IN_PROGRESS'] } } }),
      prisma.task.count({
        where: {
          status: { not: 'DONE' },
          dueDate: { lt: now },
        },
      }),
      prisma.project.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: {
          owner: { select: { name: true } },
          _count: { select: { userStories: true } },
        },
      }),
      prisma.activityLog.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      }),
    ]);

    return {
      metrics: {
        totalProjects,
        totalUserStories,
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
      },
      recentProjects,
      recentActivities,
    };
  }
}
