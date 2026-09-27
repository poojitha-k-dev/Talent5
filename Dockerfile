# ==========================================
# TALENT5 MULTI-STAGE PRODUCTION DOCKERFILE
# ==========================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy root manifests and workspace package manifests
COPY package.json package-lock.json ./
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY packages/utils/package.json ./packages/utils/
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set production environment flags
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build shared packages and frontend
RUN npm run build --workspace=@talent5/types && \
    npm run build --workspace=@talent5/utils && \
    npm run build --workspace=@talent5/ui && \
    npm run build --workspace=@talent5/frontend && \
    npm run build --workspace=@talent5/backend

# Stage 3: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets and standalone server
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "frontend/server.js"]
