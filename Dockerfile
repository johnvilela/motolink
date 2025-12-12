FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

ENV NODE_ENV production
WORKDIR /app
RUN addgroup --system --gid 1001 nextjs
RUN adduser --system --uid 1001 nextjs

FROM base AS builder

COPY package.json pnpm-lock.yaml ./
RUN pnpm fetch
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

FROM base AS runner

ENV HOST 0.0.0.0
ENV PORT 3000

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

RUN chown -R nextjs:nextjs .next

USER nextjs

EXPOSE 3000

CMD ["pnpm", "start"]