# TeamTrack Engineering Design Decisions & Trade-offs

This document details key architectural decisions, design patterns, technology selections, trade-offs, limitations, and future migration paths for **TeamTrack**.

---

## 1. Decision 1 — Embedded Relational Storage: SQLite + Prisma ORM

### Decision
Selected **SQLite** as the persistent relational database engine, interfaced exclusively via **Prisma ORM (v5.14)**.

### Why It Was Chosen
SQLite requires zero external server setup, runs in-process as an embedded database file (`dev.db`), and eliminates operational deployment overhead. Prisma provides compile-time TypeScript type safety, declarative schema migrations, and automated query building.

### Alternatives Considered
- **PostgreSQL**: Industry standard client-server database. Deferred due to requiring external server container configuration for development.
- **MongoDB**: NoSQL document database. Rejected because TeamTrack's domain features strict relational hierarchies (`User -> Project -> UserStory -> Task -> Comment`).

### Trade-offs
- **Advantages**: Instant setup, file-based portability, compile-time safety, zero network latency between app and DB.
- **Disadvantages**: SQLite handles concurrent write transactions serially via database file locking.

### Current Limitation
SQLite is ideal for single-instance deployments and small-to-medium team workloads. High-frequency concurrent write traffic across multiple application instances will result in database lock contention (`SQLITE_BUSY`).

### Migration / Evolution Path
Prisma abstracts SQL queries. Upgrading to PostgreSQL requires changing `provider = "postgresql"` in `schema.prisma`, updating `DATABASE_URL` in `.env`, and running `prisma migrate dev`.

---

## 2. Decision 2 — API Architecture: REST over GraphQL / gRPC

### Decision
Implemented a standard **RESTful HTTP API** returning standardized JSON payloads, documented live via **Swagger / OpenAPI**.

### Why It Was Chosen
TeamTrack’s resource hierarchy (`/api/projects`, `/api/stories`, `/api/tasks`, `/api/comments`) maps cleanly to standard REST HTTP verbs (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`). REST minimizes client bundle complexity and integrates seamlessly with browser tooling and OpenAPI generators.

### Alternatives Considered
- **GraphQL**: Allows clients to request arbitrary nested fields. Rejected due to added complexity of schema stitching, resolver overhead, and caching difficulties.
- **gRPC**: Binary protocol over HTTP/2. Rejected due to browser client incompatibility without complex proxy wrappers.

### Trade-offs
- **Advantages**: Simple routing, standard HTTP status codes, straightforward caching, easy browser testing.
- **Disadvantages**: Minor over-fetching on summary views where only subset fields are rendered.

### Current Limitation
Endpoint responses return fixed JSON schemas. Clients requesting minimal list data receive the full entity schema.

### Migration / Evolution Path
TanStack Query client-side field selectors and sparse query parameters (e.g. `?fields=id,title,status`) can be introduced if payload optimization becomes necessary.

---

## 3. Decision 3 — Background Task Architecture: In-Process `node-cron`

### Decision
Implemented an in-process background worker using **`node-cron`** (`backend/src/jobs/overdueTasks.job.ts`) for periodic overdue task auditing.

### Why It Was Chosen
TeamTrack has exactly one background job (scanning overdue tasks once daily at midnight and on server startup). `node-cron` executes within the existing Node.js event loop without requiring external infrastructure brokers.

### Alternatives Considered
- **Redis + BullMQ**: Robust background queue system. Deferred because introducing Redis for a single cron check adds unnecessary infrastructure overhead.
- **AWS Lambda / CloudWatch Events**: External serverless cron trigger. Rejected to keep the application self-contained.

### Trade-offs
- **Advantages**: Zero external dependencies, single command startup, low memory footprint.
- **Disadvantages**: If backend application servers are horizontally scaled into multiple concurrent instances, each instance will trigger the cron job unless protected by a lock mechanism.

### Current Limitation
The background task relies on the backend Node.js process remaining active. If the server is offline at midnight, overdue tasks are evaluated during startup scan.

### Migration / Evolution Path
If horizontal backend scaling is deployed in the future, job execution can be migrated to BullMQ with Redis or restricted to a dedicated worker instance.

---

## 4. Decision 4 — Drag-and-Drop Library: `@dnd-kit`

### Decision
Adopted **`@dnd-kit/core`** and **`@dnd-kit/sortable`** for interactive Kanban board status transitions (`TODO`, `IN_PROGRESS`, `DONE`).

### Why It Was Chosen
`@dnd-kit` is modern, performant, modular, fully accessible (keyboard navigation & screen reader support), and actively maintained for React 18.

### Alternatives Considered
- **`react-beautiful-dnd`**: Popular legacy library. Rejected because Atlassian deprecated active maintenance, and it lacks full React 18 Strict Mode support.
- **HTML5 Native Drag and Drop**: Browser default API. Rejected due to inconsistent cross-browser styling capabilities and poor mobile touch screen support.

### Trade-offs
- **Advantages**: Smooth animations, touch/pointer sensor customization, accessible ARIA attributes, small bundle size.
- **Disadvantages**: Requires explicit configuration of droppable containers, sortable contexts, and collision detection algorithms.

### Current Limitation
Drag operations trigger immediate optimistic UI status transitions, followed by a HTTP `PATCH /api/tasks/:id/status` network call. Network failures require state rollback.

### Migration / Evolution Path
Optimistic update rollbacks are already integrated into TanStack Query mutation context hooks.

---

## 5. Decision 5 — Client State & Theme Management: React Context + Tailwind CSS

### Decision
Managed global authentication (`AuthContext`) and light/dark theme state (`ThemeContext`) using native **React Context**, paired with **Tailwind CSS `class` strategy**.

### Why It Was Chosen
React Context provides zero-dependency global state management for app-wide settings (user token, theme mode). Tailwind CSS provides utility-first dark mode styling via HTML class toggling (`dark:bg-gray-950`).

### Alternatives Considered
- **Redux Toolkit / Zustand**: External client state managers. Rejected as over-engineering since server data is managed by TanStack Query and local form states use `react-hook-form`.

### Trade-offs
- **Advantages**: Zero extra bundle weight, clean React tree encapsulation, instant theme toggling without flicker.
- **Disadvantages**: Re-renders child components wrapped within the context provider when state mutates.

### Current Limitation
Theme preferences and JWT tokens are stored in browser `localStorage`.

### Migration / Evolution Path
Token storage can be migrated to HTTP-only SameSite cookies if enhanced XSS isolation is required.

---

## 6. Decision 6 — Authentication Architecture: JWT Bearer Tokens

### Decision
Implemented stateless **JSON Web Token (JWT)** authentication with HMAC SHA-256 signatures (`jwt.sign`/`jwt.verify`) and 7-day expiration.

### Why It Was Chosen
Stateless JWT tokens eliminate backend session store requirements. The authorization header (`Authorization: Bearer <token>`) works cleanly across web, mobile, and third-party API clients.

### Alternatives Considered
- **Server-Side Express Sessions (Redis/Connect-Session)**: Stateful session storage. Deferred due to external session database requirement.

### Trade-offs
- **Advantages**: Stateless verification, easy cross-origin resource sharing, scalar scalability.
- **Disadvantages**: Issued tokens cannot be invalidated prior to expiry without a token blacklist table.

### Current Limitation
Tokens remain valid until their 7-day expiration time unless the secret key is rotated.

### Migration / Evolution Path
Short-lived access tokens (15 minutes) paired with HTTP-only refresh tokens can be added for enterprise security compliance.

---

## 7. Decision 7 — Server-State Management: TanStack Query (v5)

### Decision
Adopted **TanStack Query (v5)** (`@tanstack/react-query`) for client-side API fetch request caching, synchronization, and invalidation.

### Why It Was Chosen
Separates server data from client UI state. Automates loading states, error handling, background revalidation, optimistic updates, and automatic cache invalidation upon entity mutations.

### Alternatives Considered
- **Manual Axios inside `useEffect`**: Imperative state management. Rejected due to boiler-plate code, race conditions, missing cache mechanisms, and manual loading state tracking.

### Trade-offs
- **Advantages**: Declarative data fetching, built-in caching, automatic invalidation on `queryClient.invalidateQueries()`.
- **Disadvantages**: Slight learning curve for query key structures (`['projects']`, `['tasks', userStoryId]`).

### Current Limitation
Queries rely on manual cache invalidation triggers after mutations.

### Migration / Evolution Path
WebSockets can be integrated to trigger client-side cache invalidation upon real-time server events.

---

## 8. Decision 8 — Authorization Model: Shared Workspace with Owner-Based Safeguards

### Decision
Implemented a **Shared Team Workspace** authorization model complemented by **Strict Resource Ownership Safeguards**:
- **Project Ownership**: Only the creator/owner of a Project (`ownerId === userId`) is authorized to update project metadata or delete the project (`403 Forbidden` returned to non-owners).
- **Comment Ownership**: Only the author of a Comment (`userId === userId`) is authorized to delete the comment (`403 Forbidden` returned to non-authors).
- **Shared Collaboration**: Authenticated team members within the workspace can collaboratively view projects, add/edit user stories, manage tasks, move tasks across Kanban columns, and submit comments.

### Why It Was Chosen
TeamTrack is designed for small agile teams (3–10 users) where members collaborate on tasks within shared project scopes, while requiring clear ownership controls to prevent unauthorized project deletions or comment tampering.

### Trade-offs
- **Advantages**: Eliminates complex multi-tenant Role-Based Access Control (RBAC) overhead while preventing unauthorized modifications.
- **Disadvantages**: Does not enforce granular read-access isolation per team member.

---

## 9. Decision 9 — Password Reset Security: Cryptographic One-Time Tokens

### Decision
Implemented password reset using **Cryptographically Secure Random Tokens** generated via `crypto.randomBytes(32)`:
- Raw reset tokens are sent/logged in a development-safe mechanism and never stored in plaintext.
- Stored tokens are hashed using **SHA-256** and associated with an explicit 1-hour expiration timestamp.
- Password resets require `token` and `newPassword`. Once verified, tokens are immediately deleted (single-use guarantee).
- `/forgot-password` returns generic success responses to prevent user enumeration attacks.

### Trade-offs
- **Advantages**: Prevents account takeover attacks, eliminates insecure email-only password overwrites, and enforces single-use token validity.
- **Disadvantages**: In production, requires integration with an SMTP provider (e.g., SendGrid/AWS SES) for email delivery.
