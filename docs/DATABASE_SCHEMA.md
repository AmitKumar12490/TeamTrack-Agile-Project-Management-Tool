# TeamTrack Database Schema & Relational Design

This document provides complete documentation of the persistent relational data layer for **TeamTrack**, including the Prisma data model, entity attributes, foreign key constraints, cascade rules, database indexes, entity relationship diagrams (ERD), and query access patterns.

---

## 1. Database Overview

TeamTrack uses an embedded **SQLite** relational database engine managed via **Prisma ORM (v5.14)**.

* **Database Storage**: Embedded SQLite database file (`backend/prisma/dev.db`).
* **Data Access**: Prisma Client (`@prisma/client`) providing type-safe model access.
* **Migration Strategy**: Version-controlled SQL migration scripts generated via `prisma migrate dev`.
* **Data Mapping**: All models use Prisma `@@map` directives to map PascalCase TypeScript models to snake_case / lowercase database tables (`users`, `projects`, `user_stories`, `tasks`, `comments`, `activity_logs`).

---

## 2. Entity Relationship Diagram (ERD)

```text
┌─────────────────────────────────────────────────────────────┐
│                            User                             │
│                     (Table: `users`)                        │
└──────┬─────────────────────────┬────────────────────┬───────┘
       │ 1:N (ProjectOwner)      │ 1:N                │ 1:N
       ▼                         ▼                    ▼
┌──────────────┐         ┌──────────────┐     ┌──────────────┐
│   Project    │         │   Comment    │     │ ActivityLog  │
│ (`projects`) │         │ (`comments`) │     │(`activity_...│
└──────┬───────┘         └──────▲───────┘     └──────────────┘
       │ 1:N                    │
       ▼                        │ 1:N
┌──────────────┐                │
│  UserStory   │                │
│(`user_st...`)│                │
└──────┬───────┘                │
       │ 1:N                    │
       ▼                        │
┌──────────────┐                │
│     Task     ├────────────────┘
│  (`tasks`)   │
└──────────────┘
```

---

## 3. Hierarchy Constraints & Domain Rules

1. **Strict 3-Tier Hierarchy**: The core domain flows hierarchically: `User -> Project -> UserStory -> Task`.
2. **Orphan Prevention**: Foreign keys for parent entities (`ownerId`, `projectId`, `userStoryId`, `taskId`, `userId`) are defined as non-nullable.
3. **Cascade Deletions**: Deleting a parent entity automatically cascades down the relationship chain:
   - Deleting a `User` cascades to their owned `Projects`, `Comments`, and `ActivityLogs`.
   - Deleting a `Project` cascades to all child `UserStories`.
   - Deleting a `UserStory` cascades to all child `Tasks`.
   - Deleting a `Task` cascades to all child `Comments`.

---

## 4. Entity Specifications

### 4.1 User (`users`)
Stores registered application user accounts and authentication credentials.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | `@id`, `@default(uuid())` | Primary Key (UUID v4) |
| `email` | String | `@unique` | Unique login email address |
| `passwordHash` | String | Non-null | Hashed account password (bcrypt, 10 salt rounds) |
| `name` | String | Non-null | User full display name |
| `createdAt` | DateTime | `@default(now())` | Record creation timestamp |
| `updatedAt` | DateTime | `@updatedAt` | Record last update timestamp |

* **Relations**: `projects` (`Project[]`), `comments` (`Comment[]`), `activityLogs` (`ActivityLog[]`).

---

### 4.2 Project (`projects`)
Represents top-level agile project containers owned by a user.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | `@id`, `@default(uuid())` | Primary Key (UUID v4) |
| `name` | String | Non-null | Project title/name |
| `description` | String | Optional (Nullable) | Detailed description of project goals |
| `ownerId` | String | Foreign Key -> `User.id` | FK to `users.id` (`onDelete: Cascade`) |
| `createdAt` | DateTime | `@default(now())` | Creation timestamp |
| `updatedAt` | DateTime | `@updatedAt` | Last update timestamp |

* **Indexes**: `@@index([ownerId])`
* **Relations**: `owner` (`User`), `userStories` (`UserStory[]`).

---

### 4.3 UserStory (`user_stories`)
Represents functional user stories scoped strictly to a parent project.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | `@id`, `@default(uuid())` | Primary Key (UUID v4) |
| `title` | String | Non-null | User story title/specification |
| `description` | String | Optional (Nullable) | Detailed acceptance criteria |
| `projectId` | String | Foreign Key -> `Project.id` | FK to `projects.id` (`onDelete: Cascade`) |
| `createdAt` | DateTime | `@default(now())` | Creation timestamp |
| `updatedAt` | DateTime | `@updatedAt` | Last update timestamp |

* **Indexes**: `@@index([projectId])`
* **Relations**: `project` (`Project`), `tasks` (`Task[]`).

---

### 4.4 Task (`tasks`)
Represents concrete work units assigned to a parent user story.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | `@id`, `@default(uuid())` | Primary Key (UUID v4) |
| `title` | String | Non-null | Task title |
| `description` | String | Optional (Nullable) | Technical implementation details |
| `status` | String | `@default("TODO")` | Workflow status (`"TODO"`, `"IN_PROGRESS"`, `"DONE"`) |
| `priority` | String | `@default("MEDIUM")` | Urgency tier (`"LOW"`, `"MEDIUM"`, `"HIGH"`) |
| `dueDate` | DateTime | Optional (Nullable) | Task completion target deadline |
| `userStoryId` | String | Foreign Key -> `UserStory.id` | FK to `user_stories.id` (`onDelete: Cascade`) |
| `createdAt` | DateTime | `@default(now())` | Creation timestamp |
| `updatedAt` | DateTime | `@updatedAt` | Last update timestamp |

* **Indexes**: `@@index([userStoryId])`, `@@index([status])`, `@@index([priority])`
* **Relations**: `userStory` (`UserStory`), `comments` (`Comment[]`).

---

### 4.5 Comment (`comments`)
Stores discussion notes posted by users on specific tasks.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | `@id`, `@default(uuid())` | Primary Key (UUID v4) |
| `message` | String | Non-null | Comment text body |
| `taskId` | String | Foreign Key -> `Task.id` | FK to `tasks.id` (`onDelete: Cascade`) |
| `userId` | String | Foreign Key -> `User.id` | FK to `users.id` (`onDelete: Cascade`) |
| `createdAt` | DateTime | `@default(now())` | Creation timestamp |
| `updatedAt` | DateTime | `@updatedAt` | Last update timestamp |

* **Indexes**: `@@index([taskId])`, `@@index([userId])`
* **Relations**: `task` (`Task`), `user` (`User`).

---

### 4.6 ActivityLog (`activity_logs`)
Stores immutable security and domain audit log records.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | `@id`, `@default(uuid())` | Primary Key (UUID v4) |
| `action` | String | Non-null | Event code (e.g. `TASK_STATUS_CHANGED`) |
| `entityType` | String | Non-null | Targeted entity (`"PROJECT"`, `"USER_STORY"`, `"TASK"`, `"USER"`) |
| `entityId` | String | Non-null | Target entity UUID |
| `details` | String | Non-null | Human-readable action details |
| `userId` | String | Foreign Key -> `User.id` | FK to `users.id` (`onDelete: Cascade`) |
| `createdAt` | DateTime | `@default(now())` | Event timestamp |

* **Indexes**: `@@index([userId])`, `@@index([entityType, entityId])`
* **Relations**: `user` (`User`).

---

### 4.7 PasswordResetToken (`password_reset_tokens`)
Stores hashed password reset tokens with time expiration for secure single-use authentication recovery.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | `@id`, `@default(uuid())` | Primary Key (UUID v4) |
| `tokenHash` | String | `@unique` | SHA-256 hash of random reset token |
| `userId` | String | Foreign Key -> `User.id` | FK to `users.id` (`onDelete: Cascade`) |
| `expiresAt` | DateTime | Non-null | Token expiration timestamp (1-hour TTL) |
| `createdAt` | DateTime | `@default(now())` | Token generation timestamp |

* **Indexes**: `@@index([userId])`, `@@index([tokenHash])`
* **Relations**: `user` (`User`).

---

## 5. Foreign Key & Cascade Reference

```text
Parent Model     Child Model           Foreign Key Field    Cascade Action
─────────────────────────────────────────────────────────────────────────────
User             Project               ownerId              onDelete: Cascade
Project          UserStory             projectId            onDelete: Cascade
UserStory        Task                  userStoryId          onDelete: Cascade
Task             Comment               taskId               onDelete: Cascade
User             Comment               userId               onDelete: Cascade
User             ActivityLog           userId               onDelete: Cascade
User             PasswordResetToken    userId               onDelete: Cascade
```

---

## 6. Database Indexes Specification

The Prisma schema defines 9 explicit indexes to optimize performance for relational JOIN queries, filtering, and metric aggregations:

1. `projects(ownerId)`: Optimizes query lookup of projects owned by a specific user.
2. `user_stories(projectId)`: Accelerates story queries for project detail views.
3. `tasks(userStoryId)`: Accelerates task retrieval per user story hierarchy.
4. `tasks(status)`: Optimizes Kanban board column queries (`status = 'TODO' | 'IN_PROGRESS' | 'DONE'`) and overdue background checks.
5. `tasks(priority)`: Optimizes priority filtering on task lists (`LOW`, `MEDIUM`, `HIGH`).
6. `comments(taskId)`: Accelerates loading comments on task detail views.
7. `comments(userId)`: Optimizes user activity and comment authorship tracking.
8. `activity_logs(userId)`: Accelerates fetching activity logs authored by specific users.
9. `activity_logs(entityType, entityId)`: Compound index optimizing lookup of audit histories for specific domain entities.

---

## 7. Normalization & Schema Integrity

- **Third Normal Form (3NF)**: All tables adhere strictly to 3NF. Transitive dependencies are removed (e.g., tasks reference `userStoryId`, not both `projectId` and `userStoryId`).
- **Data Integrity Constraints**: Unique email constraints prevent duplicate registrations. UUID generation at the application layer (`@default(uuid())`) prevents ID collisions.

---

## 8. Common Data Access & Query Patterns

### 8.1 Dashboard Aggregate Query
```typescript
const [totalProjects, completedTasks, overdueTasks] = await Promise.all([
  prisma.project.count(),
  prisma.task.count({ where: { status: 'DONE' } }),
  prisma.task.count({ where: { status: { not: 'DONE' }, dueDate: { lt: new Date() } } }),
]);
```

### 8.2 Kanban Board Status Filter Query
```typescript
const tasks = await prisma.task.findMany({
  where: { status: 'IN_PROGRESS' },
  include: {
    userStory: { select: { id: true, title: true, project: { select: { name: true } } } },
    comments: { include: { user: { select: { name: true } } } }
  },
  orderBy: { createdAt: 'desc' }
});
```
