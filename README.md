# TeamTrack — Production-Grade Agile Project Management Tool

> A full-stack, production-minded Agile Project Management application designed for small teams (3–10 users). Features strict 3-tier domain hierarchy, interactive Kanban board drag-and-drop, executive sprint dashboard, automated background overdue task workflows, and live Swagger/OpenAPI documentation.

> [![Live Demo](https://img.shields.io/badge/Live_Demo-Available-success?style=for-the-badge)](https://teamtrack.vercel.app)
> [![Video Walkthrough](https://img.shields.io/badge/Video_Walkthrough-Watch-red?style=for-the-badge)](https://your-video-url.com)

---

## 🌐 Production Cloud Architecture (Vercel + Render)

| Component | Host / Platform | URL Target | Description |
|---|---|---|---|
| 🖥️ **Frontend SPA** | **Vercel** | `https://teamtrack.vercel.app` | React 18 SPA on Vercel CDN |
| ⚡ **Backend REST API** | **Render** | `https://teamtrack-api.onrender.app` | Node/Express API with SQLite Disk Persistence (`/var/data`) |
| 📚 **Swagger Explorer** | **Render** | `https://teamtrack-api.onrender.app/api/docs` | Live OpenAPI REST Explorer |
| 🩺 **API Healthcheck** | **Render** | `https://teamtrack-api.onrender.app/api/health` | Live REST Engine Uptime Monitor |

---

## 🌟 Key Features & Capabilities

- 🎯 **Strict 3-Tier Domain Hierarchy**: Enforces `Project → User Story → Task` data integrity with zero orphan records.
- 📋 **Interactive Drag-and-Drop Kanban Board**: Real-time task status updates powered by `@dnd-kit` with optimistic state handling.
- 📊 **Executive Sprint Dashboard**: Real-time task completion statistics, priority distribution, pending/overdue counters, and recent activity audit logs.
- ⏰ **Automated Background Task Worker**: Periodic overdue task detection powered by `node-cron` with idempotency guards and automatic audit logging.
- 🔒 **Enterprise Security Controls**: Stateless JWT bearer authentication, bcrypt password hashing (10 rounds), Helmet security headers, CORS origin protection, and strict Zod runtime payload validation.
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
JWT_SECRET=super-secret-teamtrack-jwt-key-2026
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

Complete assessment-ready technical documentation is available inside the [`docs/`](file:///c:/Users/lenovo/Desktop/TeamTrack/docs/) folder:

| Document | Description | Link |
|---|---|---|
<<<<<<< HEAD
| 📖 **API Reference** | Detailed HTTP REST endpoint specifications, request/response formats, parameters, and status codes. | [API_REFERENCE.md](./docs/API_REFERENCE.md) |
| 🏛️ **System Architecture** | Subsystem boundaries, layer responsibilities, authentication pipelines, background workers, and folder trees. | [SYSTEM_ARCHITECTURE.md](./docs/SYSTEM_ARCHITECTURE.md) |
| 🗄️ **Database Schema** | Relational data design, ERD diagrams, Prisma models, foreign key cascades, and database indexes. | [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) |
| ⚖️ **Engineering Decisions** | Architectural trade-off analysis, technology selections, current limitations, and evolution paths. | [ENGINEERING_DECISIONS.md](./docs/ENGINEERING_DECISIONS.md) |
| 🔮 **Future Enhancements** | Scope extension roadmap including PostgreSQL, WebSockets, RBAC, cloud attachments, and Slack webhooks. | [FUTURE_ENHANCEMENTS.md](./docs/FUTURE_ENHANCEMENTS.md) |
| 🤖 **AI Usage Disclosure** | Transparent disclosure of AI-assisted pair programming, code review, debugging, and developer verification. | [AI_USAGE.md](./docs/AI_USAGE.md) |
=======
| 📖 **API Reference** | Detailed HTTP REST endpoint specifications, request/response formats, parameters, and status codes. | [docs/API_REFERENCE.md](file:///c:/Users/lenovo/Desktop/TeamTrack/docs/API_REFERENCE.md) |
| 🚀 **Deployment Guide** | Comprehensive guide for Single-Server Express, Docker Compose, Render, Railway, and SQLite data persistence. | [docs/DEPLOYMENT_GUIDE.md](file:///c:/Users/lenovo/Desktop/TeamTrack/docs/DEPLOYMENT_GUIDE.md) |
| 🏛️ **System Architecture** | Subsystem boundaries, layer responsibilities, authentication pipelines, background workers, and folder trees. | [docs/SYSTEM_ARCHITECTURE.md](file:///c:/Users/lenovo/Desktop/TeamTrack/docs/SYSTEM_ARCHITECTURE.md) |
| 🗄️ **Database Schema** | Relational data design, ERD diagrams, Prisma models, foreign key cascades, and 9 database indexes. | [docs/DATABASE_SCHEMA.md](file:///c:/Users/lenovo/Desktop/TeamTrack/docs/DATABASE_SCHEMA.md) |
| ⚖️ **Engineering Decisions** | Architectural trade-off analysis, technology selections, current limitations, and evolution paths. | [docs/ENGINEERING_DECISIONS.md](file:///c:/Users/lenovo/Desktop/TeamTrack/docs/ENGINEERING_DECISIONS.md) |
| 🔮 **Future Enhancements** | Scope extension roadmap (PostgreSQL, WebSockets, RBAC, Cloud Attachments, Slack Webhooks). | [docs/FUTURE_ENHANCEMENTS.md](file:///c:/Users/lenovo/Desktop/TeamTrack/docs/FUTURE_ENHANCEMENTS.md) |
| 🤖 **AI Usage Disclosure** | Transparent disclosure of AI tool pair-programming, code review, and developer verification. | [docs/AI_USAGE.md](file:///c:/Users/lenovo/Desktop/TeamTrack/docs/AI_USAGE.md) |
>>>>>>> 4d6ca44 (feat(deploy): configure Vercel frontend, Render backend with SQLite persistent disk, and Docker orchestration)

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

- **Password Hashing**: `bcryptjs` with 10 salt rounds. Plaintext credentials are never stored or logged.
- **Stateless Bearer Tokens**: HMAC SHA-256 signed JWTs (`7d` validity) extracted via `Authorization: Bearer <token>`.
- **Runtime Payload Defense**: Incoming body, query, and path parameters validated against strict Zod schemas.
- **HTTP Header Protection**: Helmet.js injected headers (CSP, HSTS, `nosniff`, `DENY`).
- **CORS Restriction**: Strict origin checks matching `CORS_ORIGIN` (`http://localhost:3000`).

---


