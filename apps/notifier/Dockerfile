# Production-grade Dockerfile for Notifier service
FROM node:25-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy root workspace files
COPY package*.json ./
COPY tsconfig.base.json ./

# Copy shared packages
COPY packages ./packages

# Copy Notifier service files
COPY apps/notifier ./apps/notifier

# Install all dependencies
RUN npm install

# Set dummy DATABASE_URL for prisma generate (not used at runtime)
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"

# Generate Prisma client from packages/db schema to root node_modules
RUN cd packages/db && npx prisma generate

# Copy generated client to all locations where npm resolution might look
RUN mkdir -p /app/apps/notifier/node_modules/.prisma && \
    cp -r /app/node_modules/.prisma/client /app/apps/notifier/node_modules/.prisma/ && \
    mkdir -p /app/packages/db/node_modules/.prisma && \
    cp -r /app/node_modules/.prisma/client /app/packages/db/node_modules/.prisma/

# Remove dummy env
ENV DATABASE_URL=""

# Use non-root user for security
USER node

# Expose health server port
EXPOSE 4003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4003/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application using tsx
CMD ["npx", "tsx", "apps/notifier/src/index.ts"]
