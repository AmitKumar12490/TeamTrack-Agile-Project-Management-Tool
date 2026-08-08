import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';

describe('Domain Hierarchy CRUD & Validation Tests', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'CRUD Test User',
        email: `crud_${Date.now()}@teamtrack.com`,
        password: 'Password123!',
      });
    authToken = userRes.body.data.token;
    userId = userRes.body.data.user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  it('should create Project -> Story -> Task hierarchy successfully', async () => {
    // 1. Create Project
    const projRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Sprint Alpha', description: 'Core feature development' });

    expect(projRes.status).toBe(201);
    const projectId = projRes.body.data.id;

    // 2. Create User Story
    const storyRes = await request(app)
      .post('/api/stories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'As a user I want login', projectId });

    expect(storyRes.status).toBe(201);
    const userStoryId = storyRes.body.data.id;

    // 3. Create Task
    const taskRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Design JWT auth middleware',
        userStoryId,
        priority: 'HIGH',
        status: 'TODO',
      });

    expect(taskRes.status).toBe(201);
    expect(taskRes.body.data.userStoryId).toBe(userStoryId);

    // 4. Update Task Status
    const updateRes = await request(app)
      .patch(`/api/tasks/${taskRes.body.data.id}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'IN_PROGRESS' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.status).toBe('IN_PROGRESS');
  });

  it('should reject invalid input payload with Zod validation error (400)', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: '' }); // Name must not be empty

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
