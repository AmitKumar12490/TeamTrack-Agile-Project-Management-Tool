# Multi-stage Dockerfile for TeamTrack Frontend SPA Client

# ----------------------------------------------------
# Stage 1: Build React Vite SPA Application
# ----------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build Vite static assets
ENV VITE_API_BASE_URL=/api
RUN npm run build

# ----------------------------------------------------
# Stage 2: Production Nginx Web Server Runtime
# ----------------------------------------------------
FROM nginx:alpine AS runner

# Copy built SPA assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
