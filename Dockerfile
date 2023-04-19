FROM node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++ git curl bash
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
RUN apk add --no-cache libc6-compat git curl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY .env .env
ENV NEXT_TELEMETRY_DISABLED 1
ENV NEXTJS_STANDALONE 1
ENV NODE_ENV production
RUN npm run build

FROM base AS runner
RUN apk add --no-cache libc6-compat git curl
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV AWS_REGION eu-west-1
ENV HOME /app
ENV PORT 3000
RUN addgroup --system --gid 501 app && adduser --system --uid 501 app
COPY --from=builder /app/public ./public
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD curl -f http://localhost:3000/api/health || exit 1
CMD ["node", "server.js"]
