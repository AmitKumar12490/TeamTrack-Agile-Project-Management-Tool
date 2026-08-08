import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TeamTrack REST API Specification',
      version: '1.0.0',
      description:
        'Official OpenAPI specification for TeamTrack Agile Project Management Tool. Supports authentication, hierarchy (Project -> User Story -> Task), comments, activities, and dashboard metrics.',
      contact: {
        name: 'TeamTrack Engineering',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Project: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            ownerId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        UserStory: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string', nullable: true },
            projectId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
            dueDate: { type: 'string', format: 'date-time', nullable: true },
            userStoryId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            message: { type: 'string' },
            taskId: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/auth/register': {
        post: {
          summary: 'Register a new user account',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'Alex Rivera' },
                    email: { type: 'string', example: 'alex@teamtrack.com' },
                    password: { type: 'string', example: 'Password123!' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'User registered successfully' },
            400: { description: 'Validation error or email already exists' },
          },
        },
      },
      '/auth/login': {
        post: {
          summary: 'Log in with email & password',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'demo@teamtrack.com' },
                    password: { type: 'string', example: 'Password123!' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'User authenticated, returns JWT token' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/auth/forgot-password': {
        post: {
          summary: 'Request password reset instructions for email',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email'],
                  properties: {
                    email: { type: 'string', example: 'demo@teamtrack.com' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Password reset request acknowledged' },
          },
        },
      },
      '/auth/reset-password': {
        post: {
          summary: 'Reset account password with new value',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'newPassword'],
                  properties: {
                    email: { type: 'string', example: 'demo@teamtrack.com' },
                    newPassword: { type: 'string', example: 'NewSecurePassword123!' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Password reset successfully' },
          },
        },
      },
      '/auth/me': {
        get: {
          summary: 'Get currently authenticated user profile',
          tags: ['Authentication'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Authenticated user profile' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/projects': {
        get: {
          summary: 'List projects with optional search query',
          tags: ['Projects'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'search', in: 'query', schema: { type: 'string' } }],
          responses: { 200: { description: 'List of projects' } },
        },
        post: {
          summary: 'Create a new project',
          tags: ['Projects'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Project created' } },
        },
      },
      '/stories': {
        get: {
          summary: 'Get user stories for a parent project',
          tags: ['User Stories'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'projectId', in: 'query', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'List of user stories' } },
        },
        post: {
          summary: 'Create a new user story inside a project',
          tags: ['User Stories'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'projectId'],
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    projectId: { type: 'string', format: 'uuid' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'User story created' } },
        },
      },
      '/tasks': {
        get: {
          summary: 'List tasks with status & priority filters',
          tags: ['Tasks'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'userStoryId', in: 'query', schema: { type: 'string' } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] } },
            { name: 'priority', in: 'query', schema: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] } },
          ],
          responses: { 200: { description: 'List of tasks' } },
        },
        post: {
          summary: 'Create a task scoped to a user story',
          tags: ['Tasks'],
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Task created' } },
        },
      },
      '/tasks/{id}/status': {
        patch: {
          summary: 'Update task workflow status (Kanban drag-and-drop)',
          tags: ['Tasks'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Status updated' } },
        },
      },
      '/dashboard': {
        get: {
          summary: 'Get dashboard summary metrics and statistics',
          tags: ['Dashboard'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Aggregate task and project metrics' } },
        },
      },
      '/activities': {
        get: {
          summary: 'Get chronological activity audit history',
          tags: ['Activity History'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Activity log records' } },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Application) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
