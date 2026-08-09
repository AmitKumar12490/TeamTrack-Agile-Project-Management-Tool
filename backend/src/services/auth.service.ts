import crypto from 'crypto';
import prisma from '../config/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { ApiError } from '../utils/errors';
import { logger } from '../utils/logger';
import { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from '../validators/auth.validator';

export class AuthService {
  static async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw ApiError.badRequest('A user with this email address already exists');
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    const token = generateToken({ userId: user.id, email: user.email });

    return { user, token };
  }

  static async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = generateToken({ userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  static async forgotPassword(data: ForgotPasswordInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      // Security best practice: don't reveal user existence
      return { message: 'If an account exists for this email, password reset instructions have been sent.' };
    }

    // Generate cryptographically secure token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

    // Clean up any existing tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Store hashed token
    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    // Record activity log for password reset request
    await prisma.activityLog.create({
      data: {
        action: 'PASSWORD_RESET_REQUESTED',
        entityType: 'USER',
        entityId: user.id,
        details: `Password reset requested for email ${user.email}`,
        userId: user.id,
      },
    });

    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      logger.info(`[DEV ONLY] Password reset token for ${user.email}: ${rawToken}`);
    }

    return {
      message: 'If an account exists for this email, password reset instructions have been sent.',
    };
  }

  static async resetPassword(data: ResetPasswordInput) {
    const tokenHash = crypto.createHash('sha256').update(data.token).digest('hex');

    const resetTokenRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetTokenRecord || resetTokenRecord.expiresAt < new Date()) {
      if (resetTokenRecord) {
        await prisma.passwordResetToken.delete({ where: { id: resetTokenRecord.id } });
      }
      throw ApiError.badRequest('Invalid or expired password reset token');
    }

    const newPasswordHash = await hashPassword(data.newPassword);

    await prisma.user.update({
      where: { id: resetTokenRecord.userId },
      data: { passwordHash: newPasswordHash },
    });

    // Invalidate token (single use)
    await prisma.passwordResetToken.deleteMany({
      where: { userId: resetTokenRecord.userId },
    });

    // Record activity log for password update
    await prisma.activityLog.create({
      data: {
        action: 'PASSWORD_RESET_COMPLETED',
        entityType: 'USER',
        entityId: resetTokenRecord.userId,
        details: `Password was updated successfully for user ${resetTokenRecord.user.name}`,
        userId: resetTokenRecord.userId,
      },
    });

    return { message: 'Password reset successful. You may now log in with your new password.' };
  }
}
