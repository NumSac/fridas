# Stage 1: Build the application
FROM node:20-slim as builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

# Install build dependencies and build the application
RUN apt-get update && \
    apt-get install -y openssl python3 build-essential && \
    npm ci --include=dev && \
    npm run build

# Stage 2: Production image
FROM node:20-slim

# Install libcap2-bin and set capabilities for non-root port binding
RUN apt-get update && \
    apt-get install -y libcap2-bin && \
    setcap cap_net_bind_service=+ep /usr/local/bin/node && \
    apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create non-root user with explicit UID/GID
RUN groupmod -g 65533 node && \
    usermod -u 65533 -g 65533 node && \
    chown -R node:node /app

# Copy necessary files from builder
COPY --from=builder --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=node:node /usr/src/app/package*.json ./
COPY --from=builder --chown=node:node /usr/src/app/dist ./dist

# Switch to non-root user
USER node

# Health check and port configuration
HEALTHCHECK --interval=30s --timeout=5s \
    CMD curl -f http://localhost:3000/api/health || exit 1

EXPOSE 3000

# Start command with proper signal handling
CMD ["node", "dist/main.js"]