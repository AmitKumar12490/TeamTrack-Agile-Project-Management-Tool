import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import storyRoutes from './routes/story.routes';
import taskRoutes from './routes/task.routes';
import commentRoutes from './routes/comment.routes';
import activityRoutes from './routes/activity.routes';
import dashboardRoutes from './routes/dashboard.routes';
import { setupSwagger } from './docs/swagger';
import { notFoundHandler } from './middleware/notFound.middleware';
import { errorHandler } from './middleware/error.middleware';

const app: Application = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Request Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TeamTrack API Engine operational',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Setup Swagger API Documentation at /api/docs
setupSwagger(app);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Fallback & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
