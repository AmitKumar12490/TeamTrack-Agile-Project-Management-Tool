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
        'Official OpenAPI specification for TeamTrack Agile Project Management Tool. Supports authentication, hierarchy (Project -> User Story -> Task -> Comment), activity audit logs, and dashboard metrics.',
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
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error description message' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/health': {
        get: {
          summary: 'Check API engine operational health status',
          tags: ['Health'],
          security: [],
          responses: {
            200: { description: 'API engine is healthy and operational' },
          },
        },
      },
      '/auth/register': {
        post: {
          summary: 'Register a new user account',
          tags: ['Authentication'],
          security: [],
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
          security: [],
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
            429: { description: 'Rate limit exceeded' },
          },
        },
      },
      '/auth/forgot-password': {
        post: {
          summary: 'Request password reset instructions for email',
          tags: ['Authentication'],
          security: [],
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
            200: { description: 'Generic password reset request acknowledgment' },
            400: { description: 'Validation error' },
            429: { description: 'Rate limit exceeded' },
          },
        },
      },
      '/auth/reset-password': {
        post: {
          summary: 'Reset account password using cryptographically verified token',
          tags: ['Authentication'],
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['token', 'newPassword'],
                  properties: {
                    token: { type: 'string', example: 'd41d8cd98f00b204e9800998ecf8427e' },
                    newPassword: { type: 'string', example: 'NewSecurePassword123!' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Password reset successfully' },
            400: { description: 'Invalid or expired password reset token' },
            429: { description: 'Rate limit exceeded' },
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
          summary: 'List projects with optional search filter',
          tags: ['Projects'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'search', in: 'query', schema: { type: 'string' } }],
          responses: {
            200: { description: 'List of projects' },
            401: { description: 'Unauthorized' },
          },
        },
        post: {
          summary: 'Create a new project (caller becomes Project Owner)',
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
                    name: { type: 'string', example: 'Sprint Alpha' },
                    description: { type: 'string', example: 'Core application redesign' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Project created successfully' },
            400: { description: 'Validation error' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/projects/{id}': {
        get: {
          summary: 'Get single project details by ID with nested user stories & tasks',
          tags: ['Projects'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Project details' },
            401: { description: 'Unauthorized' },
            404: { description: 'Project not found' },
          },
        },
        put: {
          summary: 'Update project details (Project Owner only)',
          tags: ['Projects'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Project updated successfully' },
            400: { description: 'Validation error' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden (Not project owner)' },
            404: { description: 'Project not found' },
          },
        },
        delete: {
          summary: 'Delete project and cascade delete nested stories/tasks (Project Owner only)',
          tags: ['Projects'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Project deleted successfully' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden (Not project owner)' },
            404: { description: 'Project not found' },
          },
        },
      },
      '/stories': {
        get: {
          summary: 'Get user stories for a parent project',
          tags: ['User Stories'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'projectId', in: 'query', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'List of user stories' },
            401: { description: 'Unauthorized' },
          },
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
                    title: { type: 'string', example: 'As a user, I can reset my password' },
                    description: { type: 'string', example: 'Enable self-service password recovery' },
                    projectId: { type: 'string', format: 'uuid' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'User story created successfully' },
            400: { description: 'Validation error' },
            401: { description: 'Unauthorized' },
            404: { description: 'Parent project not found' },
          },
        },
      },
      '/stories/{id}': {
        get: {
          summary: 'Get single user story details by ID with nested tasks and comments',
          tags: ['User Stories'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'User story details' },
            401: { description: 'Unauthorized' },
            404: { description: 'User story not found' },
          },
        },
        put: {
          summary: 'Update user story title or description',
          tags: ['User Stories'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'User story updated successfully' },
            400: { description: 'Validation error' },
            401: { description: 'Unauthorized' },
            404: { description: 'User story not found' },
          },
        },
        delete: {
          summary: 'Delete user story and cascade delete nested tasks',
          tags: ['User Stories'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'User story deleted successfully' },
            401: { description: 'Unauthorized' },
            404: { description: 'User story not found' },
          },
        },
      },
      '/tasks': {
        get: {
          summary: 'List tasks with status, priority, story, and search filters',
          tags: ['Tasks'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'userStoryId', in: 'query', schema: { type: 'string', format: 'uuid' } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] } },
            { name: 'priority', in: 'query', schema: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'List of tasks' },
            401: { description: 'Unauthorized' },
          },
        },
        post: {
          summary: 'Create a task scoped to a user story',
          tags: ['Tasks'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'userStoryId'],
                  properties: {
                    title: { type: 'string', example: 'Implement SHA-256 token hashing' },
                    description: { type: 'string' },
                    status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'], default: 'TODO' },
                    priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
                    dueDate: { type: 'string', format: 'date-time' },
                    userStoryId: { type: 'string', format: 'uuid' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Task created successfully' },
            400: { description: 'Validation error' },
            401: { description: 'Unauthorized' },
            404: { description: 'Parent user story not found' },
          },
        },
      },
      '/tasks/{id}': {
        get: {
          summary: 'Get single task details by ID with comments',
          tags: ['Tasks'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Task details' },
            401: { description: 'Unauthorized' },
            404: { description: 'Task not found' },
          },
        },
        put: {
          summary: 'Update task properties (title, description, status, priority, due date, story)',
          tags: ['Tasks'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] },
                    priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
                    dueDate: { type: 'string', format: 'date-time', nullable: true },
                    userStoryId: { type: 'string', format: 'uuid' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Task updated successfully' },
            400: { description: 'Validation error' },
            401: { description: 'Unauthorized' },
            404: { description: 'Task or parent user story not found' },
          },
        },
        delete: {
          summary: 'Delete task and associated comments',
          tags: ['Tasks'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Task deleted successfully' },
            401: { description: 'Unauthorized' },
            404: { description: 'Task not found' },
          },
        },
      },
      '/tasks/{id}/status': {
        patch: {
          summary: 'Update task workflow status (Kanban drag-and-drop)',
          tags: ['Tasks'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
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
          responses: {
            200: { description: 'Status updated successfully' },
            400: { description: 'Validation error' },
            401: { description: 'Unauthorized' },
            404: { description: 'Task not found' },
          },
        },
      },
      '/comments': {
        get: {
          summary: 'Get comments list for a specific task',
          tags: ['Comments'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'taskId', in: 'query', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'List of comments for the task' },
            401: { description: 'Unauthorized' },
          },
        },
        post: {
          summary: 'Add a comment to a task',
          tags: ['Comments'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['taskId', 'message'],
                  properties: {
                    taskId: { type: 'string', format: 'uuid' },
                    message: { type: 'string', example: 'PR ready for review.' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Comment created successfully' },
            400: { description: 'Validation error' },
            401: { description: 'Unauthorized' },
            404: { description: 'Target task not found' },
          },
        },
      },
      '/comments/{id}': {
        delete: {
          summary: 'Delete comment (Comment author only)',
          tags: ['Comments'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Comment deleted successfully' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden (Not comment author)' },
            404: { description: 'Comment not found' },
          },
        },
      },
      '/dashboard': {
        get: {
          summary: 'Get dashboard summary metrics and statistics',
          tags: ['Dashboard'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Aggregate task, story, and project metrics' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/activities': {
        get: {
          summary: 'Get chronological activity audit history logs',
          tags: ['Activity History'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Activity log records' },
            401: { description: 'Unauthorized' },
          },
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
