FROM node:22-alpine

WORKDIR /app
RUN corepack enable
COPY . .

WORKDIR /app/packages/database
RUN pnpm install --frozen-lockfile

CMD ["pnpm", "exec", "drizzle-kit", "push", "--dialect=sqlite", "--schema=src/schema.ts", "--url=file:/app/data/sqlite.db"]
