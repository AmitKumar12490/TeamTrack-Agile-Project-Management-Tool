import cron from 'node-cron';
import prisma from '../config/prisma';
import { logger } from '../utils/logger';

export function initOverdueTasksCron() {
  logger.info('⏰ Initializing Overdue Tasks node-cron scheduled background workflow');

  // Scheduled to run daily at midnight (0 0 * * *)
  cron.schedule('0 0 * * *', async () => {
    logger.info('[Cron Job] Starting daily overdue task check...');
    await processOverdueTasks();
  });

  // Run initial check on startup after a 5 second delay to catch existing overdue items
  setTimeout(async () => {
    logger.info('[Cron Job Initializer] Running startup check for overdue tasks...');
    await processOverdueTasks();
  }, 5000);
}

export async function processOverdueTasks(): Promise<{ processedCount: number; flaggedCount: number }> {
  let flaggedCount = 0;
  try {
    const now = new Date();

    // Query incomplete tasks past their due date
    const overdueTasks = await prisma.task.findMany({
      where: {
        status: { not: 'DONE' },
        dueDate: { lt: now },
      },
      include: {
        userStory: { select: { title: true } },
      },
    });

    if (overdueTasks.length === 0) {
      logger.info('[Cron Job] No overdue tasks found.');
      return { processedCount: 0, flaggedCount: 0 };
    }

    logger.info(`[Cron Job] Found ${overdueTasks.length} overdue task(s).`);

    // Get system/first user for logging context
    const firstUser = await prisma.user.findFirst();
    if (!firstUser) return { processedCount: overdueTasks.length, flaggedCount: 0 };

    for (const task of overdueTasks) {
      // Check if an activity log for this task's overdue state was already logged today (duplicate prevention)
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const existingLog = await prisma.activityLog.findFirst({
        where: {
          entityType: 'TASK',
          entityId: task.id,
          action: 'TASK_OVERDUE_FLAGGED',
          createdAt: { gte: startOfDay },
        },
      });

      if (!existingLog) {
        await prisma.activityLog.create({
          data: {
            action: 'TASK_OVERDUE_FLAGGED',
            entityType: 'TASK',
            entityId: task.id,
            details: `Task "${task.title}" is overdue (Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'})`,
            userId: firstUser.id,
          },
        });
        flaggedCount++;
        logger.info(`[Cron Job] Flagged overdue task "${task.title}" (ID: ${task.id})`);
      }
    }

    return { processedCount: overdueTasks.length, flaggedCount };
  } catch (error) {
    logger.error('[Cron Job Error] Failed to process overdue tasks:', error);
    return { processedCount: 0, flaggedCount: 0 };
  }
}
