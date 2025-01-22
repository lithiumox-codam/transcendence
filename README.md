# Transcendance

## Using this monorepo

Run the following command to start the caddy reverse proxy:

```sh
docker compose up -d (--build)
```

Then run the following commands to start the development server for the backend and frontend:

```sh
pnpm install && pnpm dev
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `backend`: a [Django](https://www.djangoproject.com/) app
- `frontend`: a [SvelteKit](https://kit.svelte.dev/) app

### Tools

- [pnpm](https://pnpm.io/): a fast, disk space efficient package manager
- [docker](https://www.docker.com/): for running the caddy reverse proxy
- [caddy](https://caddyserver.com/): a web server that can be used as a reverse proxy
- [eslint](https://eslint.org/): for linting the code
- [prettier](https://prettier.io/): for formatting the code

More will be added in the future.
