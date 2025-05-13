FROM node:22-alpine AS base
RUN corepack enable

# ---- Builder Stage ----
FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm exec turbo prune backend --docker

# ---- Installer Stage ----
FROM base AS installer
WORKDIR /app

COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=builder /app/out/full/ .
RUN pnpm exec turbo run build --filter=backend

# ---- Runner Stage ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
COPY --from=builder /app/out/json/ .
RUN pnpm install --prod --frozen-lockfile
COPY --from=installer /app/apps/backend/build ./apps/backend/build


EXPOSE 8000

CMD ["node", "apps/backend/build/server.cjs"]
