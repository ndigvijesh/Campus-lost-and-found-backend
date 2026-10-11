# ==========================================
# Stage 1: Build & Dependencies
# ==========================================
FROM node:20-alpine AS dependencies

WORKDIR /app

# Install native dependencies required for native modules (e.g., bcrypt)
RUN apk add --no-cache python3 make g++

# Copy package specifications
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# ==========================================
# Stage 2: Production Runner
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy installed production node_modules
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./

# Copy source code
COPY . .

# Ensure uploads directory exists and configure file permissions
RUN mkdir -p uploads && chown -R node:node /app

# Run as non-root user for security
USER node

# Expose port
EXPOSE 3001

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:${PORT}/health || exit 1

# Start the application
CMD ["node", "server.js"]
