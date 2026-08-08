import prisma from '../config/prisma';
import { processOverdueTasks } from '../jobs/overdueTasks.job';

describe('Overdue Tasks Background Worker Tests', () => {
  let testUserId: string;
  let testTaskId: string;

  beforeAll(async () => {
    // 1. Create seed user
    const user = await prisma.user.create({
      data: {
        name: 'Background Worker User',
        email: `bgworker_${Date.now()}@teamtrack.com`,
        passwordHash: 'hashed_password_sample',
      },
    });
    testUserId = user.id;

    // 2. Create Project & Story
    const project = await prisma.project.create({
      data: { name: 'Cron Test Project', ownerId: user.id },
    });

    const story = await prisma.userStory.create({
      data: { title: 'Cron Test Story', projectId: project.id },
    });

    // 3. Create an overdue task (due yesterday)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const task = await prisma.task.create({
      data: {
        title: 'Overdue Task Item',
        status: 'TODO',
        dueDate: yesterday,
        userStoryId: story.id,
      },
    });
    testTaskId = task.id;
  });

  afterAll(async () => {
    if (testUserId) {
      await prisma.user.deleteMany({ where: { id: testUserId } });
    }
  });

  it('should detect overdue task and create an audit activity log', async () => {
    const result = await processOverdueTasks();

    expect(result.processedCount).toBeGreaterThanOrEqual(1);
    expect(result.flaggedCount).toBeGreaterThanOrEqual(1);

    const log = await prisma.activityLog.findFirst({
      where: {
        entityType: 'TASK',
        entityId: testTaskId,
        action: 'TASK_OVERDUE_FLAGGED',
      },
    });

    expect(log).not.toBeNull();
    expect(log?.details).toContain('Overdue Task Item');
  });

  it('should be idempotent and skip creating duplicate activity logs on second run', async () => {
    const result = await processOverdueTasks();

    // Zero new tasks should be flagged because the log for today already exists
    expect(result.flaggedCount).toBe(0);
  });
});
