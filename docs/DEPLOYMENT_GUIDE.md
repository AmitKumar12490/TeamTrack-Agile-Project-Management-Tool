# 🚀 TeamTrack Decoupled Deployment Guide (Vercel + Render)

This guide provides step-by-step instructions for deploying **TeamTrack** using a **Decoupled Architecture**:
- **Frontend SPA**: Hosted on **Vercel** (high-performance edge CDN).
- **Backend REST API**: Hosted on **Render** (Node.js/Express API with background `node-cron` worker).
- **Database Persistence**: **SQLite** stored on a **Render Persistent Disk** (`/var/data/teamtrack.db`) to ensure zero data loss across application restarts or redeployments.

---

## 📑 Table of Contents
1. [Overview](#1-overview)
2. [Step 1: Deploy Backend REST API to Render](#step-1-deploy-backend-rest-api-to-render)
3. [Step 2: Deploy Frontend SPA to Vercel](#step-2-deploy-frontend-spa-to-vercel)
4. [Step 3: Connect Frontend & Backend (CORS & Environment Settings)](#step-3-connect-frontend--backend)
5. [Database Seeding & Maintenance](#5-database-seeding--maintenance)
6. [Alternative: Containerized Docker Deployment](#6-alternative-containerized-docker-deployment)

---

## 1. Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                 Vercel Edge Network (CDN)                   │
│          React 18 SPA (https://teamtrack.vercel.app)        │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS REST API Requests
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Render Web Service (Backend)                │
│    Express REST API (https://teamtrack-api.onrender.app)    │
│      Middlewares: JWT | Helmet | Dynamic Multi-CORS           │
│      Background Worker: node-cron Overdue Scanner           │
└──────────────────────────────┬──────────────────────────────┘
                               │ Prisma Client API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              Render Persistent Disk (/var/data)             │
│            SQLite File Database (teamtrack.db)              │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1: Deploy Backend REST API to Render

Render hosts the Node.js/Express API server and attaches a **Persistent Disk** to keep your SQLite database safe across redeployments.

### Option A: Deploy via Render Blueprint (`render.yaml`)
1. Push your code to GitHub.
2. Log in to your [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** -> **Blueprint**.
4. Select your `TeamTrack` repository. Render will automatically detect `render.yaml`.
5. Render will create the web service `teamtrack-api` and attach a **1GB Persistent Disk** mounted at `/var/data`.
6. Click **Apply**.

---

### Option B: Deploy Manually on Render UI
1. Click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Name**: `teamtrack-api`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx prisma db push && node dist/server.js`
4. **Add Persistent Disk**:
   - Disk Name: `sqlite-storage`
   - Mount Path: `/var/data`
   - Size: `1 GB`
5. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `DATABASE_URL`: `file:/var/data/teamtrack.db`
   - `JWT_SECRET`: *(Enter a secure 32+ character random string)*
   - `JWT_EXPIRES_IN`: `7d`
   - `SERVE_STATIC`: `false`
   - `CORS_ORIGIN`: `https://your-frontend.vercel.app` (or `*` during initial testing)
6. Click **Create Web Service**.

Once deployed, copy your backend URL (e.g., `https://teamtrack-api.onrender.app`).

---

## Step 2: Deploy Frontend SPA to Vercel

Vercel hosts the React 18 SPA static assets and manages client-side routing.

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Import your `TeamTrack` GitHub repository.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `frontend`.
   - **Build Command**: `npm run build` (Default)
   - **Output Directory**: `dist` (Default)
5. **Environment Variables**:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://teamtrack-api.onrender.app/api` *(Replace with your live Render backend URL)*
6. Click **Deploy**.

Vercel will build the frontend and provide your live URL (e.g., `https://teamtrack.vercel.app`).

> [!NOTE]
> The included [`frontend/vercel.json`](file:///c:/Users/lenovo/Desktop/TeamTrack/frontend/vercel.json) file automatically handles SPA route fallbacks so paths like `/dashboard`, `/kanban`, and `/login` refresh seamlessly without 404 errors.

---

## Step 3: Connect Frontend & Backend

After obtaining both live URLs:

1. In **Render Dashboard** (`teamtrack-api` settings):
   - Update `CORS_ORIGIN` environment variable to match your Vercel URL:
     ```env
     CORS_ORIGIN=https://teamtrack.vercel.app
     ```
2. In **Vercel Dashboard** (`frontend` settings):
   - Ensure `VITE_API_BASE_URL` points to:
     ```env
     VITE_API_BASE_URL=https://teamtrack-api.onrender.app/api
     ```
3. Test your live application:
   - Visit `https://teamtrack.vercel.app`.
   - Log in using demo credentials:
     - **Email**: `demo@teamtrack.com`
     - **Password**: `Password123!`

---

## 5. Database Seeding & Maintenance

### Populate Seed Data on Render Database
To populate your production SQLite database on Render with demo projects, user stories, and tasks:

1. In Render Dashboard, go to your `teamtrack-api` service.
2. Click **Shell** tab (or SSH into container).
3. Run:
   ```bash
   npx ts-node-dev prisma/seed.ts
   ```

### Persistent Disk Safeguards
- The SQLite file is stored at `/var/data/teamtrack.db` on Render's persistent disk.
- Even if Render restarts your backend or deploys new backend code, `/var/data` remains intact, preserving all user data and audit logs.

---

## 6. Alternative: Containerized Docker Deployment

If you want to run the stack locally or on a single Linux server using Docker:

```bash
# Build and launch backend and frontend containers
docker-compose up -d --build

# View logs
docker-compose logs -f
```
App will be accessible locally at `http://localhost`.
