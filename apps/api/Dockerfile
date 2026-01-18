# Production-grade Dockerfile for API service
FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy root workspace files
COPY package*.json ./
COPY tsconfig.base.json ./

# Copy shared packages
COPY packages ./packages

# Copy API service files
COPY apps/api ./apps/api

# Install all dependencies
RUN npm install

# Generate Prisma client
WORKDIR /app/apps/api
RUN npx prisma generate --schema=./prisma/schema.prisma || true

WORKDIR /app

# Use non-root user for security
USER node

# Expose API port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application using tsx
CMD ["npx", "tsx", "apps/api/src/index.ts"]
