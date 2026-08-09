import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().transform((val) => parseInt(val, 10)).default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  JWT_SECRET: z.string().default('replace-with-a-long-random-secret'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment configuration');
}

if (_env.data.NODE_ENV === 'production' && (_env.data.JWT_SECRET === 'replace-with-a-long-random-secret' || _env.data.JWT_SECRET === 'super-secret-teamtrack-jwt-key-2026')) {
  console.error('❌ FATAL: Insecure default JWT_SECRET used in production environment.');
  throw new Error('FATAL: Insecure default JWT_SECRET in production. Set a strong JWT_SECRET environment variable.');
}

export const env = _env.data;
