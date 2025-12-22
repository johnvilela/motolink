FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

ENV NODE_ENV=production
WORKDIR /app
RUN addgroup --system --gid 1001 nextjs
RUN adduser --system --uid 1001 nextjs

FROM base AS builder

COPY package.json pnpm-lock.yaml ./
RUN pnpm fetch
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpx prisma generate
RUN pnpm run build

FROM base AS runner

ENV HOST=0.0.0.0
ENV PORT=3333

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

RUN chown -R nextjs:nextjs .next

USER nextjs

EXPOSE 3333

CMD ["pnpm", "start"]