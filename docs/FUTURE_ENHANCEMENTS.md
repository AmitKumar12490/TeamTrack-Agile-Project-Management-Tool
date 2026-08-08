# TeamTrack Future Enhancements & Scope Extensions

This document outlines planned feature enhancements, architectural evolutions, and infrastructure upgrades for **TeamTrack** deferred to future development iterations.

---

## 1. Enhancement 1 — High-Concurrency Database Migration (PostgreSQL)

### Current Limitation
TeamTrack currently utilizes SQLite as an embedded single-file database (`dev.db`). While SQLite is lightweight and zero-configuration, concurrent write transactions are executed serially via file locking, which limits scalability for high-concurrency multi-tenant workloads.

### Proposed Enhancement
Migrate the database engine from SQLite to **PostgreSQL**.

### Why Deferred
Outside the scope of the single-instance lightweight deployment model. SQLite fully satisfies current core requirements.

### Expected Benefit
- Support for thousands of concurrent write transactions.
- Support for distributed multi-region backend application servers.
- Native database enum types, connection pooling (PgBouncer), and Point-In-Time Recovery (PITR).

### Implementation Direction
Update Prisma configuration provider to `postgresql`, configure connection string environment variables, execute `prisma migrate dev` to generate PostgreSQL migration scripts, and deploy managed PostgreSQL (e.g. AWS RDS or Supabase).

### Priority
**High**

---

## 2. Enhancement 2 — Real-Time Collaboration & Board Synchronization (WebSockets)

### Current Limitation
When multiple users work on the same project simultaneously, Kanban card status movements (`TODO -> IN_PROGRESS -> DONE`) or newly added comments are not reflected on other users' screens until manual page refresh or manual query revalidation occurs.

### Proposed Enhancement
Implement bidirectional real-time event broadcasting using **Socket.io / WebSockets**.

### Why Deferred
Deferred to prioritize building a robust RESTful API foundation with Zod validation and clean component hierarchy.

### Expected Benefit
- Instant visual feedback on Kanban board card movements across connected team members.
- Live comment stream updates without polling.
- Visual presence indicators (showing which team member is currently viewing a task).

### Implementation Direction
Attach a Socket.io server to the Node.js Express HTTP server instance, emit WebSocket events from service mutation handlers (`TASK_STATUS_UPDATED`, `COMMENT_ADDED`), and attach client-side event listeners in React components to invalidate TanStack Query caches.

### Priority
**High**

---

## 3. Enhancement 3 — Role-Based Access Control (RBAC) & Granular Permissions

### Current Limitation
Currently, all authenticated users have equal administrative privileges across all projects, user stories, tasks, and comments. Any logged-in user can create, edit, or delete any project or task.

### Proposed Enhancement
Introduce a tiered **Role-Based Access Control (RBAC)** framework with user roles (`ADMIN`, `PROJECT_MANAGER`, `DEVELOPER`, `VIEWER`).

### Why Deferred
Deferred to maintain a simple, unencumbered user experience during early application prototyping.

### Expected Benefit
- Restrict project deletion and configuration changes to `ADMIN` and `PROJECT_MANAGER` roles.
- Allow `VIEWER` roles read-only access to Kanban boards and task lists.
- Enforce project-level team membership boundaries.

### Implementation Direction
Add a `role` enum column (`ADMIN`, `PROJECT_MANAGER`, `DEVELOPER`, `VIEWER`) to the `User` model in `schema.prisma`. Create an authorization middleware (`requireRole(['ADMIN', 'PROJECT_MANAGER'])`) to guard sensitive mutation endpoints.

### Priority
**Medium**

---

## 4. Enhancement 4 — File Attachments & Media Artifact Management

### Current Limitation
Tasks and user stories currently support plain-text specifications and comments. Team members cannot upload visual design mockups, architecture diagrams, error log files, or PDF specification attachments directly to task cards.

### Proposed Enhancement
Enable file uploads and media attachment management for tasks using cloud object storage (**AWS S3 / Cloudinary**).

### Why Deferred
Requires external cloud storage API credentials and file processing pipeline infrastructure outside the initial assignment scope.

### Expected Benefit
- Team members can attach UI screenshots, log files, and architectural PDFs to tasks.
- In-line image preview rendering within task detail views and comment streams.

### Implementation Direction
Create an `Attachment` model in `schema.prisma` (`id`, `filename`, `fileUrl`, `fileSize`, `mimeType`, `taskId`). Mount Express `multer` middleware for multipart file handling, upload binaries to AWS S3 bucket via `@aws-sdk/client-s3`, and store secure S3 object URLs in database records.

### Priority
**Medium**

---

## 5. Enhancement 5 — Automated Email Notifications & Slack Webhooks

### Current Limitation
The current background job (`overdueTasks.job.ts`) flags overdue tasks in `ActivityLog` audit records. However, users are not proactively notified via email or external communication platforms when tasks are assigned or become overdue.

### Proposed Enhancement
Integrate automated email digests via **Nodemailer / SendGrid** and instant alert notifications via **Slack Webhooks**.

### Why Deferred
Requires external SMTP server configuration and Slack application app integration setups.

### Expected Benefit
- Daily summary email notifications listing tasks due within 24 hours.
- Real-time Slack channel alerts when high-priority tasks are created or flagged as overdue.
- Direct link redirection from email/Slack notifications back to TeamTrack task views.

### Implementation Direction
Create a notification service (`notification.service.ts`). Trigger SendGrid API templates for overdue task cron jobs and post JSON payload blocks to configured Slack webhook URLs upon high-priority task creation events.

### Priority
**Low**
