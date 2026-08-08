# TeamTrack System Architecture Document

This document provides a comprehensive technical overview of the system architecture, subsystem boundaries, layer responsibilities, authentication pipelines, background jobs, and folder structures for **TeamTrack**.

---

## 1. Architecture Overview

TeamTrack is architected as a modular, decoupled full-stack web application following clean n-tier architecture principles:

1. **Presentation Layer (Frontend)**: React 18 Single-Page Application (SPA) bundled with Vite, using TanStack Query for server-state caching, `@dnd-kit` for Kanban drag-and-drop, Tailwind CSS for dark-mode styling, and React Context for local application state.
2. **REST API Layer (Backend)**: Express server in TypeScript providing JSON API endpoints, validated via Zod schemas, secured via Helmet and JWT middleware, and documented with Swagger/OpenAPI.
3. **Domain & Business Logic Layer**: Service classes containing core domain validation, state mutations, and activity audit logging.
4. **Data Access & Persistence Layer**: Prisma ORM providing type-safe data access over an SQLite embedded database file (`dev.db`).
5. **Background Task Layer**: Embedded `node-cron` scheduler executing periodic background checks for overdue tasks and automatic audit log generation.

---

## 2. High-Level Subsystem Architecture Diagram

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Frontend Subsystem (React 18)                   │
│                                                                        │
│  [ UI Views & Pages ]     [ Client State ]       [ API Layer ]         │
│  • Dashboard              • AuthContext (JWT)    • Axios Interceptor   │
│  • Projects & Hierarchy   • ThemeContext (Dark)  • TanStack Query v5   │
│  • Kanban DnD Board       • React Router v6      • React Hook Form     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST (JSON Payloads)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Backend Subsystem (Node/Express)                │
│                                                                        │
│  [ Middleware ]          [ Controllers ]         [ Services ]          │
│  • Helmet Headers        • AuthController        • AuthService         │
│  • CORS Handler          • ProjectController     • ProjectService      │
│  • JWT Authenticator      • StoryController       • StoryService        │
│  • Zod Validator         • TaskController        • TaskService         │
│  • Central Error Handler • CommentController     • CommentService      │
│  • 404 Fallback          • DashboardController   • DashboardService    │
│                          • ActivityController    • ActivityService     │
│                                                                        │
│  [ Background Jobs ]                                                   │
│  • node-cron Overdue Task Scanner (Daily @ Midnight & Startup)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Prisma Client API
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Data Layer (SQLite Storage)                      │
│                                                                        │
│   users • projects • user_stories • tasks • comments • activity_logs   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Frontend Subsystem Architecture

The frontend is constructed using modern React paradigms and component modularity.

* **React 18.3 + Vite 5.2**: Provides instant hot module replacement (HMR), TypeScript compilation, and optimized production builds.
* **TanStack Query (v5.40)**: Handles server-state fetch requests, query caching, optimistic UI updates, and cache invalidation. `refetchOnWindowFocus` is set to `false` with a single retry strategy.
* **Routing (`react-router-dom` v6)**: Enforces public/protected navigation boundaries using layout wrappers (`AuthLayout`, `MainLayout`) and authorization guards (`ProtectedRoute`).
* **Drag-and-Drop (`@dnd-kit`)**: Enables multi-column Kanban card movement (`TODO`, `IN_PROGRESS`, `DONE`) with sortable list containers and pointer/sensor collision detection.
* **Styling & UI**: Tailwind CSS 3.4 with custom dark mode class toggling, combined with `lucide-react` icon primitives.
* **State Management**: Light client state is managed via React Context:
  - `AuthContext`: Manages JWT token storage in `localStorage`, active user state, and auth actions (`login`, `register`, `logout`).
  - `ThemeContext`: Toggles light/dark themes with system preference fallbacks.

---

## 4. Backend Subsystem Architecture

The backend is built with Express 4.19 and TypeScript in a strict controller-service-repository pattern.

* **Application Entry Point (`server.ts`)**: Initializes HTTP server listening on configured port (default `5000`), handles process signal traps (`SIGTERM`, `SIGINT`) for graceful database disconnection, and starts the `node-cron` background scheduler.
* **App Orchestrator (`app.ts`)**: Configures top-level middleware (Helmet, CORS, JSON body parser), mounts API routers (`/api/auth`, `/api/projects`, `/api/stories`, `/api/tasks`, `/api/comments`, `/api/activities`, `/api/dashboard`), attaches Swagger documentation at `/api/docs`, and mounts fallback error handlers.

---

## 5. Middleware Layer

The middleware pipeline processes every incoming HTTP request:

1. **Helmet Middleware**: Inject security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, HSTS, CSP).
2. **CORS Middleware**: Restricts cross-origin resource access based on `CORS_ORIGIN` configuration (`http://localhost:3000`).
3. **Zod Validation Middleware (`validation.middleware.ts`)**: Validates `req.body`, `req.query`, and `req.params` against strict schemas before controller execution. On failure, yields `400 Bad Request` with field error lists.
4. **JWT Authentication Middleware (`auth.middleware.ts`)**: Extracts Bearer tokens from `Authorization` headers, verifies HMAC SHA-256 signatures, and populates `req.user`.
5. **Centralized Error Handler (`error.middleware.ts`)**: Intercepts `ApiError` instances, Prisma database exceptions (`P2002` unique conflict, `P2025` not found), and unhandled runtime errors, returning standard JSON error envelopes.
6. **404 Not Found Handler (`notFound.middleware.ts`)**: Captures requests to non-existent API routes.

---

## 6. Controller Layer

Controllers in `backend/src/controllers/` parse HTTP inputs, invoke business services, and construct HTTP responses:

- `AuthController`: Handles registration, login, profile fetch, password reset requests.
- `ProjectController`: Handles project creation, listing, detail retrieval, updates, and deletion.
- `StoryController`: Handles user story CRUD operations scoped to parent projects.
- `TaskController`: Handles task CRUD operations, query filtering, and status patch updates.
- `CommentController`: Handles task comment creation, retrieval, and deletion.
- `ActivityController`: Exposes chronological audit log history streams.
- `DashboardController`: Aggregates project, task, and activity statistics for dashboard display.

---

## 7. Service Layer

Business services in `backend/src/services/` encapsulate pure application logic and orchestrate domain mutations:

- `AuthService`: Password hashing via `bcryptjs` (10 rounds), credential verification, JWT token issuance.
- `ProjectService`: Manages project creation, query searches, detailed tree inclusions, cascade deletions, and `PROJECT_*` activity logs.
- `StoryService`: Validates project parent existence, manages story lifecycle, and records `STORY_*` activity logs.
- `TaskService`: Enforces parent story constraints, handles status updates (`TODO`, `IN_PROGRESS`, `DONE`), records `TASK_STATUS_CHANGED` and `TASK_UPDATED` logs.
- `CommentService`: Validates target task existence, manages user comments, and records `COMMENT_ADDED` audit logs.
- `ActivityService`: Provides query access to `ActivityLog` records filtered by entity type/id.
- `DashboardService`: Executes concurrent database counting queries (`Promise.all`) for project counts, task status breakdowns, overdue task checks, and recent activities.

---

## 8. Database Layer

* **ORM**: Prisma ORM v5.14 providing type-safe model definitions and automatic SQL query construction.
* **Database Engine**: SQLite stored in an embedded database file (`prisma/dev.db`).
* **Migrations**: Schema versions are managed via Prisma migration scripts (`prisma/migrations`).
* **Cascading Operations**: Foreign key constraints define `onDelete: Cascade` rules across `User -> Project`, `Project -> UserStory`, `UserStory -> Task`, `Task -> Comment`, and `User -> ActivityLog`.

---

## 9. Request Lifecycle Walkthrough

```text
1. Client HTTP Request (e.g. PATCH /api/tasks/:id/status)
   │
2. Helmet & CORS Middleware (Validate origin & inject security headers)
   │
3. Express JSON Parser (Parse payload body)
   │
4. Auth Middleware (Validate Bearer token JWT signature -> attach req.user)
   │
5. Validation Middleware (Validate payload against updateTaskStatusSchema)
   │
6. TaskController.updateStatus (Extract params, body, userId)
   │
7. TaskService.updateTask (Query existing task, update Prisma DB, create ActivityLog entry)
   │
8. Prisma Client ORM (Execute SQL UPDATE & INSERT inside SQLite)
   │
9. TaskController Response (Format 200 OK JSON success envelope)
   │
10. Client receives updated Task object & invalidates TanStack Query cache
```

---

## 10. Authentication Flow

```text
[ User Inputs Email & Password ]
              │
              ▼
    POST /api/auth/login
              │
              ▼
   AuthService.login() ──► Lookup User by Email ──► Compare bcrypt Hash
              │
              ▼
   Generate JWT Token (HMAC-SHA256, 7d Expiration)
              │
              ▼
   Client stores Token in AuthContext & localStorage
              │
              ▼
   Subsequent API Requests send Header:
   Authorization: Bearer <token>
              │
              ▼
   auth.middleware.ts verifies signature & populates req.user
```

---

## 11. Background Job Architecture

TeamTrack incorporates an in-process background job worker powered by `node-cron` (`backend/src/jobs/overdueTasks.job.ts`).

* **Execution Schedule**:
  - Daily scheduled cron execution at midnight (`0 0 * * *`).
  - Startup initialization scan executed 5 seconds after server boot.
* **Workflow Logic**:
  1. Queries all incomplete tasks (`status != 'DONE'`) where `dueDate < now`.
  2. For each overdue task, queries `ActivityLog` to check if a `TASK_OVERDUE_FLAGGED` action was already created *today* for that task ID.
  3. If no log exists for the current calendar date, creates a new `ActivityLog` audit entry (`action: 'TASK_OVERDUE_FLAGGED'`, `entityType: 'TASK'`, `entityId: task.id`) to notify users without spamming duplicate entries.

---

## 12. Repository Folder Structure

```text
TeamTrack/
├── backend/
│   ├── prisma/
│   │   ├── migrations/         # Prisma migration history
│   │   ├── schema.prisma       # Prisma data model definition
│   │   └── seed.ts             # Database seed data script
│   ├── src/
│   │   ├── config/             # Environment variables & Prisma client instance
│   │   ├── controllers/        # Express HTTP controllers
│   │   ├── docs/               # OpenAPI / Swagger configuration
│   │   ├── jobs/               # node-cron background task workers
│   │   ├── middleware/         # Auth, validation, security, error handling
│   │   ├── routes/             # Express API route modules
│   │   ├── services/           # Business logic & domain services
│   │   ├── types/              # Express & TypeScript type definitions
│   │   ├── utils/              # JWT, password hashing, logger utilities
│   │   ├── validators/         # Zod request validation schemas
│   │   ├── app.ts              # Express application setup
│   │   └── server.ts           # Server entry point & shutdown handlers
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── assets/             # Images & static assets
│   │   ├── components/         # Reusable UI components (Kanban, Navbar, Modals)
│   │   ├── context/            # AuthContext & ThemeContext React providers
│   │   ├── layouts/            # AuthLayout & MainLayout route containers
│   │   ├── pages/              # View pages (Dashboard, Projects, Kanban, etc.)
│   │   ├── schemas/            # Frontend Zod validation schemas
│   │   ├── services/           # Axios HTTP API client services
│   │   ├── types/              # Frontend TypeScript interfaces
│   │   ├── App.tsx             # Root router & provider wrapper
│   │   ├── main.tsx            # React application entry point
│   │   └── index.css           # Tailwind CSS directives & theme styles
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── docs/                       # Technical documentation folder
```
