FROM node:22-alpine AS base
RUN corepack enable

# ---- Builder Stage ----
FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm exec turbo prune frontend --docker

# ---- Installer Stage ----
FROM base AS installer
# Set the max old space size to 4GB needed for some reason on my laptop (will need to investigate)
ENV NODE_OPTIONS="--max-old-space-size=4096"
WORKDIR /app

COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=builder /app/out/full/ .
RUN pnpm exec turbo run build --filter=frontend

# ---- Runner Stage ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
COPY --from=builder /app/out/json/ .
RUN pnpm install --prod --frozen-lockfile
COPY --from=installer /app/apps/frontend/build ./apps/frontend/build

EXPOSE 3000

CMD ["node", "apps/frontend/build/index.js"]
