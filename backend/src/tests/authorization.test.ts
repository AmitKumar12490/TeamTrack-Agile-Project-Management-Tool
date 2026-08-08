import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';

describe('Authorization & Resource Ownership Tests', () => {
  let ownerToken: string;
  let ownerId: string;
  let otherToken: string;
  let otherId: string;
  let testProjectId: string;

  beforeAll(async () => {
    // Register owner
    const ownerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Project Owner',
        email: `owner_${Date.now()}@teamtrack.com`,
        password: 'Password123!',
      });
    ownerToken = ownerRes.body.data.token;
    ownerId = ownerRes.body.data.user.id;

    // Register secondary user
    const otherRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Other Team Member',
        email: `other_${Date.now()}@teamtrack.com`,
        password: 'Password123!',
      });
    otherToken = otherRes.body.data.token;
    otherId = otherRes.body.data.user.id;

    // Create a project owned by Owner
    const projRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Protected Project',
        description: 'Testing authorization controls',
      });
    testProjectId = projRes.body.data.id;
  });

  afterAll(async () => {
    if (testProjectId) {
      await prisma.project.deleteMany({ where: { id: testProjectId } });
    }
    await prisma.user.deleteMany({ where: { id: { in: [ownerId, otherId] } } });
  });

  it('should allow project owner to update project details', async () => {
    const res = await request(app)
      .put(`/api/projects/${testProjectId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Updated Protected Project',
        description: 'Updated by owner',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Protected Project');
  });

  it('should reject non-owner updating project with 403 Forbidden', async () => {
    const res = await request(app)
      .put(`/api/projects/${testProjectId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        name: 'Hacked Project Name',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should reject non-owner deleting project with 403 Forbidden', async () => {
    const res = await request(app)
      .delete(`/api/projects/${testProjectId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should reject non-author deleting comment with 403 Forbidden', async () => {
    // 1. Create User Story & Task inside project
    const storyRes = await request(app)
      .post('/api/stories')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Auth Story', projectId: testProjectId });

    const taskRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Auth Task', userStoryId: storyRes.body.data.id });

    // 2. Owner posts comment
    const commentRes = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ taskId: taskRes.body.data.id, message: 'Owner comment' });

    // 3. Secondary user attempts to delete owner comment
    const deleteRes = await request(app)
      .delete(`/api/comments/${commentRes.body.data.id}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(deleteRes.status).toBe(403);
    expect(deleteRes.body.success).toBe(false);
  });
});
