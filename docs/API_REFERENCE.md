# TeamTrack REST API Reference Documentation

This document serves as the authoritative technical reference for the **TeamTrack REST API**. It details all endpoint specifications, request/response formats, authentication rules, validation patterns, status codes, and error formats based on the verified backend implementation.

---

## 1. Overview

The TeamTrack backend is built as a RESTful HTTP service using Node.js and Express. It exposes JSON endpoints for managing agile project management domains: Authentication, Projects, User Stories, Tasks, Comments, Activity Logs, and Dashboard Metrics.

- **Base URL**: `http://localhost:5000/api`
- **Protocol**: HTTP/1.1 (JSON payloads)
- **Interactive OpenAPI Specification**: Served via Swagger UI at `http://localhost:5000/api/docs`
- **Health Check Endpoint**: `GET http://localhost:5000/api/health`

---

## 2. API Conventions & Standards

### Request Format
All POST, PUT, and PATCH endpoints expect JSON payloads with header `Content-Type: application/json`. Path parameters (such as resource identifiers) use standard UUID v4 strings.

### Response Standards
The API returns uniform JSON envelope responses across all endpoints.

#### Success Response Structure
```json
{
  "success": true,
  "message": "Human-readable confirmation message",
  "data": {}
}
```
*Note: The `message` property is present on mutations (CREATE, UPDATE, DELETE) and authentication endpoints.*

#### Standard Error Response Structure
```json
{
  "success": false,
  "message": "Detailed error description explaining the failure"
}
```

#### Validation Error Response Structure
Returned when request parameters or payload fail Zod schema validation:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

---

## 3. Authentication & Security

Stateless JSON Web Tokens (JWT) are used for API authentication.

- **Header Format**: `Authorization: Bearer <token>`
- **Token Lifetime**: 7 days
- **Public Endpoints**: `/api/auth/register`, `/api/auth/login`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/health`, `/api/docs`
- **Protected Endpoints**: All `/api/projects`, `/api/stories`, `/api/tasks`, `/api/comments`, `/api/activities`, and `/api/dashboard` routes require a valid Bearer token.

---

## 4. Authentication Endpoints (`/api/auth`)

### 4.1 Register Account
* **Endpoint**: `POST /api/auth/register`
* **Auth**: Public
* **Request Body**:
  ```json
  {
    "name": "Alex Rivera",
    "email": "alex@teamtrack.com",
    "password": "Password123!"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "e3b8a1c9-7f4d-4e2b-9a1c-8f3b2d1e0a9f",
        "name": "Alex Rivera",
        "email": "alex@teamtrack.com",
        "createdAt": "2026-08-08T12:00:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1Ni..."
    }
  }
  ```

### 4.2 Authenticate / Login
* **Endpoint**: `POST /api/auth/login`
* **Auth**: Public
* **Request Body**:
  ```json
  {
    "email": "alex@teamtrack.com",
    "password": "Password123!"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User logged in successfully",
    "data": {
      "user": {
        "id": "e3b8a1c9-7f4d-4e2b-9a1c-8f3b2d1e0a9f",
        "name": "Alex Rivera",
        "email": "alex@teamtrack.com",
        "createdAt": "2026-08-08T12:00:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1Ni..."
    }
  }
  ```

### 4.3 Get Current User Profile
* **Endpoint**: `GET /api/auth/me`
* **Auth**: Protected (Bearer Token)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "e3b8a1c9-7f4d-4e2b-9a1c-8f3b2d1e0a9f",
        "name": "Alex Rivera",
        "email": "alex@teamtrack.com",
        "createdAt": "2026-08-08T12:00:00.000Z"
      }
    }
  }
  ```

### 4.4 Request Password Reset
* **Endpoint**: `POST /api/auth/forgot-password`
* **Auth**: Public
* **Request Body**:
  ```json
  {
    "email": "alex@teamtrack.com"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Password reset instructions sent. Demo reset link generated.",
    "data": {
      "message": "Password reset instructions sent. Demo reset link generated.",
      "email": "alex@teamtrack.com"
    }
  }
  ```

### 4.5 Reset Password
* **Endpoint**: `POST /api/auth/reset-password`
* **Auth**: Public
* **Request Body**:
  ```json
  {
    "email": "alex@teamtrack.com",
    "newPassword": "NewSecurePassword123!"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Password reset successful. You may now log in with your new password.",
    "data": {
      "message": "Password reset successful. You may now log in with your new password."
    }
  }
  ```

---

## 5. Projects Endpoints (`/api/projects`)

### 5.1 List All Projects
* **Endpoint**: `GET /api/projects`
* **Auth**: Protected
* **Query Parameters**: `?search=` (optional substring filter on `name` or `description`)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "c1f9d2a3-8b7c-4d6e-9f0a-1b2c3d4e5f6a",
        "name": "TeamTrack Web Portal",
        "description": "Core agile project management web platform",
        "ownerId": "e3b8a1c9-7f4d-4e2b-9a1c-8f3b2d1e0a9f",
        "createdAt": "2026-08-08T12:00:00.000Z",
        "updatedAt": "2026-08-08T12:00:00.000Z",
        "owner": {
          "id": "e3b8a1c9-7f4d-4e2b-9a1c-8f3b2d1e0a9f",
          "name": "Alex Rivera",
          "email": "alex@teamtrack.com"
        },
        "_count": { "userStories": 4 }
      }
    ]
  }
  ```

### 5.2 Create Project
* **Endpoint**: `POST /api/projects`
* **Auth**: Protected
* **Request Body**:
  ```json
  {
    "name": "TeamTrack Mobile Engine",
    "description": "Cross-platform mobile application companion"
  }
  ```
* **Success Response (201 Created)**: Returns created project object.

### 5.3 Get Project Details
* **Endpoint**: `GET /api/projects/:id`
* **Auth**: Protected
* **Path Parameters**: `id` (Project UUID)
* **Success Response (200 OK)**: Returns project detail object including user stories, tasks, and task comments.

### 5.4 Update Project
* **Endpoint**: `PUT /api/projects/:id`
* **Auth**: Protected
* **Request Body**: Fields `name` (string), `description` (optional string).
* **Success Response (200 OK)**: Returns updated project.

### 5.5 Delete Project
* **Endpoint**: `DELETE /api/projects/:id`
* **Auth**: Protected
* **Success Response (200 OK)**: `{ "success": true, "message": "Project deleted successfully" }` (cascades delete to user stories, tasks, comments).

---

## 6. User Stories Endpoints (`/api/stories`)

### 6.1 Get User Stories by Project
* **Endpoint**: `GET /api/stories`
* **Auth**: Protected
* **Query Parameters**: `projectId` (required UUID)
* **Success Response (200 OK)**: Returns array of stories matching project ID with nested tasks.

### 6.2 Create User Story
* **Endpoint**: `POST /api/stories`
* **Auth**: Protected
* **Request Body**:
  ```json
  {
    "title": "As a user, I want to filter tasks by priority",
    "description": "Enable Kanban view filtering controls",
    "projectId": "c1f9d2a3-8b7c-4d6e-9f0a-1b2c3d4e5f6a"
  }
  ```
* **Success Response (201 Created)**: Returns created user story object.

### 6.3 Get User Story Details
* **Endpoint**: `GET /api/stories/:id`
* **Auth**: Protected
* **Success Response (200 OK)**: Returns story object with parent project and child tasks.

### 6.4 Update User Story
* **Endpoint**: `PUT /api/stories/:id`
* **Auth**: Protected
* **Request Body**: `title` (optional), `description` (optional), `projectId` (optional).
* **Success Response (200 OK)**: Returns updated user story.

### 6.5 Delete User Story
* **Endpoint**: `DELETE /api/stories/:id`
* **Auth**: Protected
* **Success Response (200 OK)**: `{ "success": true, "message": "User story deleted successfully" }`

---

## 7. Tasks Endpoints (`/api/tasks`)

### 7.1 List Tasks
* **Endpoint**: `GET /api/tasks`
* **Auth**: Protected
* **Query Parameters**: `userStoryId` (optional), `status` (`TODO` | `IN_PROGRESS` | `DONE`), `priority` (`LOW` | `MEDIUM` | `HIGH`), `search` (string)
* **Success Response (200 OK)**: Returns list of tasks with story parent details and comments.

### 7.2 Create Task
* **Endpoint**: `POST /api/tasks`
* **Auth**: Protected
* **Request Body**:
  ```json
  {
    "title": "Implement Zod request validation",
    "description": "Add strict validation middleware across API routes",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2026-08-15T00:00:00.000Z",
    "userStoryId": "f47ac10b-58cc-4372-a567-0e02b2c3d4e5"
  }
  ```
* **Success Response (201 Created)**: Returns created task.

### 7.3 Get Task Details
* **Endpoint**: `GET /api/tasks/:id`
* **Auth**: Protected
* **Success Response (200 OK)**: Returns task object with user story details and comments list.

### 7.4 Update Task
* **Endpoint**: `PUT /api/tasks/:id`
* **Auth**: Protected
* **Request Body**: Partial update for `title`, `description`, `status`, `priority`, `dueDate`, `userStoryId`.
* **Success Response (200 OK)**: Returns updated task object.

### 7.5 Update Task Workflow Status (Kanban DnD)
* **Endpoint**: `PATCH /api/tasks/:id/status`
* **Auth**: Protected
* **Request Body**:
  ```json
  {
    "status": "IN_PROGRESS"
  }
  ```
* **Success Response (200 OK)**: Returns task with updated workflow status.

### 7.6 Delete Task
* **Endpoint**: `DELETE /api/tasks/:id`
* **Auth**: Protected
* **Success Response (200 OK)**: `{ "success": true, "message": "Task deleted successfully" }`

---

## 8. Comments Endpoints (`/api/comments`)

### 8.1 Add Comment
* **Endpoint**: `POST /api/comments`
* **Auth**: Protected
* **Request Body**:
  ```json
  {
    "taskId": "d9b2e8a1-3c4f-5a6b-7c8d-9e0f1a2b3c4d",
    "message": "PR #42 opened for review on GitHub."
  }
  ```
* **Success Response (201 Created)**: Returns created comment with author user profile.

### 8.2 List Comments for Task
* **Endpoint**: `GET /api/comments`
* **Auth**: Protected
* **Query Parameters**: `taskId` (required UUID)
* **Success Response (200 OK)**: Returns chronological array of task comments.

### 8.3 Delete Comment
* **Endpoint**: `DELETE /api/comments/:id`
* **Auth**: Protected
* **Success Response (200 OK)**: `{ "success": true, "message": "Comment deleted successfully" }`

---

## 9. Dashboard & Activity Log Endpoints

### 9.1 Get Dashboard Metrics
* **Endpoint**: `GET /api/dashboard`
* **Auth**: Protected
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "metrics": {
        "totalProjects": 12,
        "totalUserStories": 45,
        "totalTasks": 128,
        "completedTasks": 84,
        "pendingTasks": 44,
        "overdueTasks": 3
      },
      "recentProjects": [...],
      "recentActivities": [...]
    }
  }
  ```

### 9.2 Get Activity Audit Stream
* **Endpoint**: `GET /api/activities`
* **Auth**: Protected
* **Query Parameters**: `limit` (default: 50), `entityType` (optional), `entityId` (optional)
* **Success Response (200 OK)**: Returns activity log stream with actor user details.

---

## 10. HTTP Status Codes Summary

| Code | Status | Usage Condition in Implementation |
|---|---|---|
| `200` | OK | Successful GET, PUT, PATCH, DELETE operations and auth verification. |
| `201` | Created | Successful POST creation of users, projects, stories, tasks, and comments. |
| `400` | Bad Request | Zod validation failures, duplicate email registration (`P2002`), missing required query params. |
| `401` | Unauthorized | Missing/malformed `Authorization` header, invalid/expired JWT, incorrect login credentials. |
| `404` | Not Found | Requested entity ID does not exist in DB (`P2025`), or unmapped API route. |
| `500` | Internal Server Error | Unhandled server exceptions or unexpected database connection failures. |
