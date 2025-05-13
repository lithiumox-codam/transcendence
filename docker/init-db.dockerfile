FROM node:22-alpine AS base
RUN corepack enable

# ---- Builder Stage ----
FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/database/package.json ./packages/database/
RUN pnpm install --frozen-lockfile
COPY . .

RUN pnpm exec turbo prune @repo/database --docker

# ---- Installer Stage ----
FROM base AS installer
WORKDIR /app

COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=builder /app/out/full/ .

# ---- Runner Stage ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
COPY --from=installer /app/packages/database/package.json /app/packages/database/
COPY --from=installer /app/packages/database/src /app/packages/database/src
COPY --from=installer /app/packages/database/node_modules /app/packages/database/node_modules
COPY --from=installer /app/node_modules /app/node_modules

WORKDIR /app/packages/database

CMD ["pnpm", "exec", "drizzle-kit", "push", "--dialect=sqlite", "--schema=src/schema.ts", "--url=file:/app/data/sqlite.db"]
