# Production-grade Dockerfile for Scheduler service
FROM node:20-alpine AS base

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy root workspace files
COPY package*.json ./
COPY tsconfig.base.json ./

# Copy shared packages
COPY packages ./packages

# Copy Scheduler service files
COPY apps/scheduler ./apps/scheduler

# Install all dependencies
RUN npm install

# Generate Prisma client
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
RUN cd packages/db && npx prisma generate

# Copy generated client to all locations
RUN mkdir -p /app/apps/scheduler/node_modules/.prisma && \
    cp -r /app/node_modules/.prisma/client /app/apps/scheduler/node_modules/.prisma/ && \
    mkdir -p /app/packages/db/node_modules/.prisma && \
    cp -r /app/node_modules/.prisma/client /app/packages/db/node_modules/.prisma/

# Clear dummy env
ENV DATABASE_URL=""

# Use non-root user for security
USER node

# Expose health server port
EXPOSE 4002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4002/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npx", "tsx", "apps/scheduler/src/index.ts"]
