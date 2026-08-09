# TeamTrack — Production-Grade Agile Project Management Tool

> A full-stack, production-minded Agile Project Management application designed for small teams (3–10 users). Features strict 3-tier domain hierarchy, interactive Kanban board drag-and-drop, executive sprint dashboard, automated background overdue task workflows, and live Swagger/OpenAPI documentation.

> 🎬 **[Watch Video Walkthrough](./demoVideo/TeamTrack-Walkthrough.mp4)**


---

## 🌟 Key Features & Capabilities

- 🎯 **Strict 3-Tier Domain Hierarchy**: Enforces `Project → User Story → Task` data integrity with zero orphan records.
- 📋 **Interactive Drag-and-Drop Kanban Board**: Real-time task status updates powered by `@dnd-kit` with optimistic state handling.
- 📊 **Executive Sprint Dashboard**: Real-time task completion statistics, priority distribution, pending/overdue counters, and recent activity audit logs.
- ⏰ **Automated Background Task Worker**: Periodic overdue task detection powered by `node-cron` with idempotency guards and automatic audit logging.
- 🔒 **Application Security Controls**: Stateless JWT authentication, single-use SHA-256 hashed password reset tokens, bcrypt password hashing (10 rounds), resource ownership authorization checks, endpoint rate limiting, Helmet headers, CORS protection, and strict Zod runtime payload validation.
- 📚 **Live Swagger / OpenAPI Documentation**: Interactive API explorer hosted at `http://localhost:5000/api/docs`.

---

## 🏗️ Technology Stack

| Layer | Technologies & Libraries |
|---|---|
| **Frontend SPA** | React 18.3, Vite 5.2, TypeScript 5.4, React Router DOM v6 |
| **Server State & UI** | TanStack Query v5 (caching & optimistic updates), Tailwind CSS 3.4 (Dark Mode), `@dnd-kit` |
| **Backend REST API** | Node.js, Express 4.19, TypeScript, Zod Schema Validation |
| **Persistence Layer** | Prisma ORM 5.14, Embedded SQLite Database (`dev.db`) |
| **Background Scheduler** | `node-cron` 3.0 (daily cron @ midnight & startup scanner) |
| **Security & Auth** | JWT (jsonwebtoken 9.0), bcryptjs 2.4, Helmet 7.1, CORS 2.8 |
| **API Documentation** | Swagger UI (`swagger-ui-express`, `swagger-jsdoc`) |

---

## 📐 Domain Model & System Architecture

### 1. Domain Hierarchy
```text
Project (Container / Scope)
   └── User Story (Feature Specification)
          └── Task (Granular Work Unit)
                 ├── Comment (Discussion Stream)
                 └── ActivityLog (Security & Domain Audit Event)
```
* **Hierarchy Integrity**: Every User Story belongs to a parent `Project` (`projectId`). Every Task belongs to a parent `UserStory` (`userStoryId`). Deletions cascade down automatically (`onDelete: Cascade`).

### 2. Full-Stack System Flow
```text
┌─────────────────────────────────────────────────────────────┐
│                 Client Layer (React 18 SPA)                 │
│      [ Pages / Views ]    [ TanStack Query ]    [ Context ] │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST (JSON)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Backend Server (Express API)                │
│   Middleware: Helmet | CORS | JWT Bearer | Zod Validation   │
│   Controllers ──► Business Services ──► Activity Logger     │
│   Background Worker: node-cron (Overdue Tasks Scheduler)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Prisma Client API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Database Layer (SQLite)                     │
│    users • projects • user_stories • tasks • comments       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide & Local Setup

### Prerequisites
- **Node.js**: v18.x or v20.x recommended
- **Package Manager**: `npm` (v9+) or `yarn`

### 1. Install Dependencies
```bash
# Clone repository and install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

### 2. Environment Configuration
Create or verify `.env` files in both backend and frontend directories:

**Backend Environment** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET=JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

**Frontend Environment** (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Database Migration & Seeding
Initialize the SQLite database schema and load sample seed data:
```bash
cd backend
npx prisma db push
npx ts-node-dev prisma/seed.ts
```

### 4. Run Development Servers
Start backend REST server and frontend client concurrently:

```bash
# Terminal 1: Backend API Server (Port 5000)
cd backend
npm run dev

# Terminal 2: Frontend SPA Client (Port 3000)
cd frontend
npm run dev
```

### 5. Run Automated Tests
Execute the full integration test suite (14 passing tests across Auth, Authorization, CRUD, and Background Worker):

```bash
cd backend
npm test
```

### 🔑 Pre-Configured Demo Credentials
Log in with the seeded demo user credentials:
- **Email**: `demo@teamtrack.com`
- **Password**: `Password123!`

---

## ⏱️ Asynchronous Background Workflow & Reliability

### Overdue Task Detection Scheduler
TeamTrack implements an automated background task scanner to eliminate manual inspection of task deadlines:

- **Engine**: `node-cron` (`backend/src/jobs/overdueTasks.job.ts`)
- **Schedule**: Daily execution at midnight (`0 0 * * *`) and an automated catch-up scan 5 seconds after server boot.
- **Workflow**:
  1. Identifies incomplete tasks past their expiration date (`dueDate < NOW` AND `status != 'DONE'`).
  2. Evaluates daily idempotency against the `ActivityLog` table to prevent duplicate alerts.
  3. Writes `TASK_OVERDUE_FLAGGED` audit log entries for overdue tasks.

### Resilience & Failure Handling Strategies
1. **Isolated Execution**: Executed within async `try-catch` wrappers so database or background errors never disrupt active HTTP REST endpoints.
2. **Idempotent Audit Guard**: Checks existing daily logs (`createdAt >= startOfDay`) to prevent duplicate logs.
3. **Boot Scan Catch-Up**: Executes an immediate evaluation on boot if the server was offline during midnight execution.

---

## 📚 Technical Documentation Directory

Complete technical documentation is available inside the [`docs/`](./docs/) folder:

| Document | Description | Link |
|---|---|---|
| 📖 **API Reference** | Detailed HTTP REST endpoint specifications, request/response formats, parameters, and status codes. | [API_REFERENCE.md](./docs/API_REFERENCE.md) |
| 🏛️ **System Architecture** | Subsystem boundaries, layer responsibilities, authentication pipelines, background workers, and folder trees. | [SYSTEM_ARCHITECTURE.md](./docs/SYSTEM_ARCHITECTURE.md) |
| 🗄️ **Database Schema** | Relational data design, ERD diagrams, Prisma models, foreign key cascades, and database indexes. | [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) |
| 🚀 **Deployment Guide** | Multi-platform production deployment instructions (Render, VPS, Docker, PM2, Vercel) and database persistence. | [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) |
| ⚖️ **Engineering Decisions** | Architectural trade-off analysis, technology selections, current limitations, and evolution paths. | [ENGINEERING_DECISIONS.md](./docs/ENGINEERING_DECISIONS.md) |
| 🔮 **Future Enhancements** | Scope extension roadmap including PostgreSQL, WebSockets, RBAC, cloud attachments, and Slack webhooks. | [FUTURE_ENHANCEMENTS.md](./docs/FUTURE_ENHANCEMENTS.md) |
| 🤖 **AI Usage Disclosure** | Transparent disclosure of AI-assisted pair programming, code review, debugging, and developer verification. | [AI_USAGE.md](./docs/AI_USAGE.md) |

---

## 🔌 API Endpoints Overview

Interactive Swagger UI documentation is served live at `http://localhost:5000/api/docs`.

```text
Authentication       POST /api/auth/register, POST /api/auth/login, GET /api/auth/me, POST /api/auth/forgot-password, POST /api/auth/reset-password
Projects             GET /api/projects, POST /api/projects, GET /api/projects/:id, PUT /api/projects/:id, DELETE /api/projects/:id
User Stories         GET /api/stories?projectId=, POST /api/stories, GET /api/stories/:id, PUT /api/stories/:id, DELETE /api/stories/:id
Tasks                GET /api/tasks, POST /api/tasks, GET /api/tasks/:id, PUT /api/tasks/:id, PATCH /api/tasks/:id/status, DELETE /api/tasks/:id
Comments             POST /api/comments, GET /api/comments?taskId=, DELETE /api/comments/:id
Metrics & History    GET /api/dashboard, GET /api/activities, GET /api/health
```

---

## 🔒 Security Architecture

- **Token-Based Password Reset**: Single-use, SHA-256 hashed password reset tokens (`crypto.randomBytes(32)`) with a 1-hour expiration timestamp.
- **Resource Ownership Safeguards**: Owner checks on Project modifications/deletions and Comment deletions, returning `403 Forbidden` for unauthorized actions.
- **Rate Limiting Protection**: `express-rate-limit` middleware protecting sensitive authentication endpoints (`/register`, `/login`, `/forgot-password`, `/reset-password`) against brute-force attacks.
- **Password Hashing**: `bcryptjs` with 10 salt rounds. Plaintext credentials are never stored or logged.
- **Stateless Bearer Tokens**: HMAC SHA-256 signed JWTs (`7d` validity) extracted via `Authorization: Bearer <token>`.
- **Runtime Payload Defense**: Incoming body, query, and path parameters validated against strict Zod schemas.
- **HTTP Header & CORS Protection**: Helmet.js injected security headers and strict CORS origin restriction.

---


