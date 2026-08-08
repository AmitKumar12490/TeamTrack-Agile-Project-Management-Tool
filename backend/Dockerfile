# Multi-stage Dockerfile for TeamTrack Backend API Server

# ----------------------------------------------------
# Stage 1: Build & Transpile TypeScript
# ----------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies including devDependencies for build
RUN npm ci

# Copy backend source code
COPY . .

# Generate Prisma Client & compile TypeScript
RUN npx prisma generate
RUN npm run build

# ----------------------------------------------------
# Stage 2: Production Container Runtime
# ----------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV DATABASE_URL="file:./data/dev.db"

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled TypeScript dist and Prisma schema from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Create directory for persistent SQLite database storage
RUN mkdir -p /app/data && chown -R node:node /app

USER node

EXPOSE 5000

# Run Prisma schema push on startup to ensure database tables exist, then launch API server
CMD ["sh", "-c", "npx prisma db push && node dist/server.js"]
