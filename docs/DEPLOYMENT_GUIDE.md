# 🚀 TeamTrack Production Deployment Guide

This guide provides step-by-step instructions for deploying the **TeamTrack** Agile Project Management application to production environments while maintaining **SQLite database persistence** across application restarts and redeployments.

---

## 📑 Table of Contents
1. [Overview & Prerequisites](#1-overview--prerequisites)
2. [Option 1: Single-Server Express Hosting (Recommended & Lowest Cost)](#2-option-1-single-server-express-hosting-recommended)
   - [Deploying to Render.com (Free / Starter Tier)](#a-deploying-to-rendercom)
   - [Deploying to Railway.app / Fly.io](#b-deploying-to-railwayapp--flyio)
   - [Deploying to a Linux VPS (Ubuntu / Nginx / PM2)](#c-deploying-to-a-linux-vps)
3. [Option 2: Containerized Deployment (Docker & Docker Compose)](#3-option-2-containerized-deployment-docker--docker-compose)
4. [Option 3: Decoupled Cloud Deployment (Vercel + Render)](#4-option-3-decoupled-cloud-deployment-vercel--render)
5. [Database Persistence & Seeding](#5-database-persistence--seeding)
6. [Production Security Checklist](#6-production-security-checklist)

---

## 1. Overview & Prerequisites

### Application Architecture
- **Frontend SPA**: React 18 + Vite + Tailwind CSS + TanStack Query.
- **Backend API**: Node.js + Express + TypeScript + JWT Auth + Helmet Security.
- **Persistence Layer**: Prisma ORM with SQLite (`dev.db` or persistent mount `/var/data/teamtrack.db`).
- **Background Scheduler**: `node-cron` running in-process for daily overdue task automation.

### Prerequisites
- Node.js v20.x installed locally.
- Git repository synced with GitHub or GitLab.
- Docker & Docker Compose (optional, for containerized setup).

---

## 2. Option 1: Single-Server Express Hosting (Recommended)

In Single-Server mode, Express serves both the REST API endpoints (`/api/*`) and the compiled Vite React frontend SPA from a single HTTP port. This eliminates CORS issues and simplifies hosting.

### A. Deploying to Render.com

Render offers free/starter hosting with support for **Persistent Disks** to protect your SQLite database file.

#### Step 1: Push Code to GitHub
Ensure all workspace files, including `render.yaml`, are pushed to your repository.

#### Step 2: Create Web Service on Render
1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Blueprints** (or **Web Service**).
3. Connect your GitHub repository containing TeamTrack.
4. Render will automatically detect `render.yaml` and configure:
   - **Build Command**: `npm install --prefix backend && npm run build --prefix backend && npm install --prefix frontend && npm run build --prefix frontend`
   - **Start Command**: `cd backend && npx prisma db push && node dist/server.js`
5. **Add Persistent Disk** (if setting up manually):
   - Name: `sqlite-storage`
   - Mount Path: `/var/data`
   - Size: `1 GB`
6. Set Environment Variables:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: `file:/var/data/teamtrack.db`
   - `JWT_SECRET`: *(Set a strong secret key)*
   - `SERVE_STATIC`: `true`
   - `CORS_ORIGIN`: `*`
7. Click **Deploy**.

Render will build the frontend and backend, attach the persistent disk at `/var/data`, apply database schema migrations, and serve your live TeamTrack application!

---

### B. Deploying to Railway.app / Fly.io

1. Create a new project on Railway or Fly.io.
2. Add a **Volume Mount** named `sqlite_data` mounted at `/app/data`.
3. Set the start script to:
   ```bash
   cd backend && npx prisma db push && node dist/server.js
   ```
4. Set Environment Variable:
   ```env
   DATABASE_URL="file:/app/data/teamtrack.db"
   SERVE_STATIC=true
   ```

---

### C. Deploying to a Linux VPS (Ubuntu / PM2 / Nginx)

If deploying to your own server (e.g., AWS EC2, DigitalOcean Droplet, Linode, Vultr):

#### Step 1: Clone & Build
```bash
git clone https://github.com/your-username/TeamTrack.git
cd TeamTrack
npm run install:all
npm run build
```

#### Step 2: Initialize Database
```bash
cd backend
npx prisma db push
npx ts-node-dev prisma/seed.ts  # Optional: Seed demo data
```

#### Step 3: Run with PM2 Process Manager
```bash
npm install -g pm2
pm2 start dist/server.js --name "teamtrack" --env production
pm2 save
pm2 startup
```

---

## 3. Option 2: Containerized Deployment (Docker & Docker Compose)

TeamTrack includes multi-stage `Dockerfile` manifests and a production `docker-compose.yml`.

### Docker Compose Architecture
- **backend**: Node 20 container running Express API on port `5000`.
- **frontend**: Nginx container serving built static SPA assets on port `80` with `/api/` reverse proxying.
- **sqlite_data volume**: Local persistent Docker volume ensuring SQLite data persists across `docker-compose down` and rebuilds.

### Running with Docker Compose locally or on VPS:

```bash
# 1. Build and launch all services in detached mode
docker-compose up -d --build

# 2. Check container health status
docker-compose ps

# 3. View real-time logs
docker-compose logs -f backend

# 4. Populate sample database seed inside backend container (optional)
docker exec -it teamtrack-backend npx ts-node-dev prisma/seed.ts

# 5. Stop services
docker-compose down
```

The application will be live at `http://localhost`.

---

## 4. Option 3: Decoupled Cloud Deployment (Vercel + Render)

For team setups preferring dedicated frontend CDN hosting:

### 1. Backend (Render / Railway)
- Deploy `backend/` folder to Render/Railway.
- Set `CORS_ORIGIN="https://teamtrack-frontend.vercel.app"`.
- Obtain backend live URL (e.g., `https://teamtrack-api.onrender.app`).

### 2. Frontend (Vercel)
- Connect `frontend/` folder to Vercel.
- Configure Environment Variable in Vercel UI:
  ```env
  VITE_API_BASE_URL=https://teamtrack-api.onrender.app/api
  ```
- Deploy to Vercel.

---

## 5. Database Persistence & Seeding

### Ensuring Data Safety
SQLite stores data in a single file specified by `DATABASE_URL`. To prevent data loss:
- **Cloud PaaS (Render / Railway / Fly.io)**: Always mount a **Persistent Volume / Disk** (e.g., `/var/data`) and set `DATABASE_URL="file:/var/data/teamtrack.db"`.
- **Docker**: The `docker-compose.yml` mounts `sqlite_data:/app/data`.
- **Backups**: Periodically copy the SQLite `.db` file using `cp` or automated cron backups.

### Seeding Demo Credentials in Production
To populate the production database with demo projects, user stories, and tasks:
```bash
cd backend
npx ts-node-dev prisma/seed.ts
```

**Seeded Demo Credentials**:
- **Email**: `demo@teamtrack.com`
- **Password**: `Password123!`

---

## 6. Production Security Checklist

- [x] **JWT Secret**: Replace default `JWT_SECRET` in `.env` with a 32+ character random string.
- [x] **HTTPS Header Guard**: Helmet.js security headers enabled.
- [x] **CORS Origins**: Restricted to authorized production domains.
- [x] **Payload Defense**: Zod runtime input validation on all REST endpoints.
- [x] **Background Idempotency**: `node-cron` overdue scanner guarded against duplicate audit logging.
- [x] **Swagger UI Documentation**: Served live at `/api/docs` for API inspection.
