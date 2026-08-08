import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import prisma from './config/prisma';
import { initOverdueTasksCron } from './jobs/overdueTasks.job';

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 TeamTrack REST Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  logger.info(`🔗 Health check available at http://localhost:${env.PORT}/api/health`);
  logger.info(`📚 Swagger docs available at http://localhost:${env.PORT}/api/docs`);

  // Initialize node-cron background workflow
  initOverdueTasksCron();
});

// Graceful Shutdown Handling
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Gracefully shutting down TeamTrack server...`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Database connection closed. Process exited.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
