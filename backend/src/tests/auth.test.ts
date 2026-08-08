import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';

describe('Authentication API Tests', () => {
  const testUser = {
    name: 'Auth Test User',
    email: `authtest_${Date.now()}@teamtrack.com`,
    password: 'Password123!',
  };

  afterAll(async () => {
    await prisma.passwordResetToken.deleteMany({});
    await prisma.activityLog.deleteMany({ where: { user: { email: testUser.email } } });
    await prisma.user.deleteMany({ where: { email: testUser.email } });
  });

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.token).toBeDefined();
  });

  it('should reject duplicate email registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should authenticate user with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword123!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should generate password reset token and allow password reset', async () => {
    // 1. Request reset
    const forgotRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: testUser.email });

    expect(forgotRes.status).toBe(200);
    expect(forgotRes.body.data.resetToken).toBeDefined();
    const resetToken = forgotRes.body.data.resetToken;

    // 2. Perform reset with token
    const newPassword = 'NewSecretPassword123!';
    const resetRes = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        newPassword,
      });

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);

    // 3. Login with new password
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: newPassword,
      });

    expect(loginRes.status).toBe(200);
  });

  it('should reject reset password with invalid or reused token', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: 'invalid-token-12345',
        newPassword: 'SomePassword123!',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
