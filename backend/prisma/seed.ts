import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { TaskStatus, Priority } from '../src/types/enums';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting TeamTrack Database Seed...');

  // Clean existing database records
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.userStory.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log('[Seed] Cleaned existing database tables.');

  // Create Users
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'demo@teamtrack.com',
      name: 'Alex Rivera',
      passwordHash,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'sarah@teamtrack.com',
      name: 'Sarah Chen',
      passwordHash,
    },
  });

  console.log(`[Seed] Created users: ${user1.email}, ${user2.email}`);

  // Create Project 1
  const project1 = await prisma.project.create({
    data: {
      name: 'TeamTrack Core Web App',
      description: 'Full-Stack Agile Project Management Tool for engineering teams.',
      ownerId: user1.id,
    },
  });

  // Create Project 2
  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile Gateway API',
      description: 'Micro-services integration gateway for iOS & Android applications.',
      ownerId: user2.id,
    },
  });

  console.log(`[Seed] Created projects: "${project1.name}", "${project2.name}"`);

  // Create User Stories for Project 1
  const story1 = await prisma.userStory.create({
    data: {
      title: 'User Authentication & JWT Security',
      description: 'As a user, I want to register and login securely using email and JWT tokens.',
      projectId: project1.id,
    },
  });

  const story2 = await prisma.userStory.create({
    data: {
      title: 'Interactive Kanban Board',
      description: 'As a team member, I want to drag and drop tasks across status columns (TODO, IN PROGRESS, DONE).',
      projectId: project1.id,
    },
  });

  const story3 = await prisma.userStory.create({
    data: {
      title: 'Automated Overdue Task Detection',
      description: 'As a project lead, I want daily cron audits to automatically flag overdue tasks.',
      projectId: project1.id,
    },
  });

  console.log(`[Seed] Created 3 User Stories for "${project1.name}"`);

  // Helper date generators
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Create Tasks for Story 1
  const task1 = await prisma.task.create({
    data: {
      title: 'Implement bcrypt password hashing & validation',
      description: 'Salt passwords using 10 rounds before storing in SQLite.',
      status: TaskStatus.DONE,
      priority: Priority.HIGH,
      dueDate: threeDaysAgo,
      userStoryId: story1.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Setup JWT middleware for express routes',
      description: 'Protect internal endpoints using Bearer authorization headers.',
      status: TaskStatus.DONE,
      priority: Priority.HIGH,
      dueDate: yesterday,
      userStoryId: story1.id,
    },
  });

  // Create Tasks for Story 2
  const task3 = await prisma.task.create({
    data: {
      title: 'Build DnD Kit Board layout with three columns',
      description: 'Implement drag-and-drop mechanics and smooth hover animations.',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      dueDate: tomorrow,
      userStoryId: story2.id,
    },
  });

  // Create Tasks for Story 3 (Overdue task test cases!)
  const task4 = await prisma.task.create({
    data: {
      title: 'Optimistic state updates for Kanban drag',
      description: 'Revert UI state gracefully if backend update fails.',
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      dueDate: threeDaysAgo, // 05/08/2026 Overdue task!
      userStoryId: story3.id,
    },
  });

  const task5 = await prisma.task.create({
    data: {
      title: 'Configure node-cron daily overdue task runner',
      description: 'Run scheduled job at midnight to record activity log for expired tasks.',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      dueDate: yesterday, // 07/08/2026 Overdue task!
      userStoryId: story3.id,
    },
  });

  console.log(`[Seed] Created 5 Tasks across User Stories.`);

  // Create Comments
  await prisma.comment.create({
    data: {
      message: 'Password hashing verified with unit checks.',
      taskId: task1.id,
      userId: user1.id,
    },
  });

  await prisma.comment.create({
    data: {
      message: 'JWT token expiration set to 7 days as agreed.',
      taskId: task2.id,
      userId: user2.id,
    },
  });

  await prisma.comment.create({
    data: {
      message: 'DnD kit event handlers integrated with backend REST API.',
      taskId: task3.id,
      userId: user1.id,
    },
  });

  console.log(`[Seed] Created 3 Comments.`);

  // Create Activity Logs
  await prisma.activityLog.createMany({
    data: [
      {
        action: 'PROJECT_CREATED',
        entityType: 'PROJECT',
        entityId: project1.id,
        details: `Project "${project1.name}" was created by ${user1.name}`,
        userId: user1.id,
      },
      {
        action: 'STORY_CREATED',
        entityType: 'USER_STORY',
        entityId: story1.id,
        details: `User Story "${story1.title}" created in project "${project1.name}"`,
        userId: user1.id,
      },
      {
        action: 'TASK_STATUS_CHANGED',
        entityType: 'TASK',
        entityId: task1.id,
        details: `Task "${task1.title}" moved to DONE`,
        userId: user1.id,
      },
      {
        action: 'TASK_STATUS_CHANGED',
        entityType: 'TASK',
        entityId: task3.id,
        details: `Task "${task3.title}" moved to IN_PROGRESS`,
        userId: user1.id,
      },
    ],
  });

  console.log(`[Seed] Created initial Activity Logs.`);
  console.log('[Seed] Database seeding completed successfully! 🎉');
}

main()
  .catch((e) => {
    console.error('[Seed Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
