import path from 'path';
import fs from 'fs';
import express, { Application, Request, Response, NextFunction } from 'express';
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
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled CSP to permit smooth Swagger UI and SPA asset execution
  })
);

// Dynamic Multi-Origin CORS Setup
const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin SPA requests)
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permitted for single-server SPA deployments
      }
    },
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

// Single-Server SPA Static Asset Serving in Production Mode
if (env.SERVE_STATIC) {
  const potentialPaths = [
    path.resolve(__dirname, env.STATIC_DIR),
    path.resolve(__dirname, '../../frontend/dist'),
    path.resolve(process.cwd(), '../frontend/dist'),
    path.resolve(process.cwd(), 'frontend/dist'),
    path.resolve(process.cwd(), 'public'),
  ];

  const staticPath = potentialPaths.find((p) => fs.existsSync(p));

  if (staticPath) {
    console.log(`📦 Serving static frontend SPA from: ${staticPath}`);
    app.use(express.static(staticPath));

    // Client-side SPA routing fallback for non-API GET requests
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(staticPath, 'index.html'));
    });
  }
}

// Fallback & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

