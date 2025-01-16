# Stage 1: Build the application using pnpm
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml (if exists) for dependency installation
COPY package.json pnpm-lock.yaml* ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build the application
RUN pnpm run build

# Prune dev dependencies to only keep production dependencies
RUN pnpm prune --prod

# Stage 2: Final image for production
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy the built assets and node_modules from the builder stage
COPY --from=builder /app/.svelte-kit/output/server build/
COPY --from=builder /app/node_modules node_modules/

# Copy the package.json for metadata
COPY package.json .

# Expose the app on port 3000
EXPOSE 3000

# Set the environment to production
ENV NODE_ENV=production

# Start the app
CMD ["node", "build"]
