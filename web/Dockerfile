# ==========================================
# Multi-stage Dockerfile for Next.js Standalone
# Service Status Dashboard
# ==========================================

# 1. Base image with minimal dependencies
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

# 2. Dependencies installation
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# 3. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# 4. Production Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Non-root security user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

# Copy static assets and public directory
COPY --from=builder /app/public ./public

# Setup permissions for prerender cache
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone output and static assets with non-root ownership
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Docker-level health check (Kubernetes deployments can use HTTP probes instead)
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Exec-form command for proper SIGTERM signal forwarding
CMD ["node", "server.js"]
