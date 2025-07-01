# Build stage for client
FROM node:18-alpine AS client-builder

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./
RUN npm ci

# Copy client source code
COPY client/ ./

# Build the React client
RUN npm run build

# Build stage for server
FROM node:18-alpine AS server-builder

WORKDIR /app/server

# Copy server package files
COPY server/package*.json ./
RUN npm ci

# Copy server source code
COPY server/ ./

# Build the TypeScript server
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install system dependencies for SQLite
RUN apk add --no-cache sqlite

# Copy server build and dependencies
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=server-builder /app/server/package*.json ./server/

# Install only production dependencies for the server
WORKDIR /app/server
RUN npm ci --only=production
WORKDIR /app

# Copy client build
COPY --from=client-builder /app/client/build ./client/build

# Copy root package.json for workspace management
COPY package*.json ./

# Create necessary directories
RUN mkdir -p /app/data /app/logs

# Create non-root user
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001 -G appuser

# Change ownership of app directory
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose ports
EXPOSE 5000 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start the application
CMD ["node", "server/dist/server.js"]
