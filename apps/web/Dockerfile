# Production Dockerfile for Next.js web app
FROM node:20-alpine

WORKDIR /app

# Copy root workspace files
COPY package*.json ./
COPY tsconfig.base.json ./

# Copy web app files
COPY apps/web ./apps/web

# Install all dependencies
RUN npm install

# Build Next.js application
WORKDIR /app/apps/web
RUN npm run build

WORKDIR /app

# Use non-root user
USER node

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start Next.js
CMD ["npm", "run", "start", "--workspace=apps/web"]
