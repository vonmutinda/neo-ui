# neo-ui (Next.js 16) — Dockerfile for Railway / production.
# Builds one app that serves both customer UI (/, /dashboard, …) and admin UI (/admin) on one port.
# Uses standalone output; build context must be repo root so src/ is included.

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --ignore-scripts

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
# Railway sets PORT at runtime; Next.js standalone respects it.
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
