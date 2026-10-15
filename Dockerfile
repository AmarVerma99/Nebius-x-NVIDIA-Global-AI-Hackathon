# ==============================================================================
# OpsCopilot Multi-Stage Production Dockerfile
# Autonomous AI Agent Incident Platform for SRE & DevOps
# Powered by NVIDIA Nemotron on Nebius Token Factory & Tavily AI Search
# ==============================================================================

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Production Runtime Environment
FROM node:20-alpine AS runner
WORKDIR /app

# Install native compilation dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++ sqlite

# Setup Backend dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --omit=dev

# Copy backend source
COPY backend/ ./

# Copy built frontend assets to be served statically by Express
COPY --from=frontend-builder /app/frontend/dist ../frontend/dist

# Create persistent storage directory for SQLite WAL database
RUN mkdir -p /app/data && chown -R node:node /app

USER node
EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production
ENV DATABASE_URL=/app/data/opscopilot.db

CMD ["node", "src/server.js"]
