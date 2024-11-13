# Transcendance Turborepo

## Using this monorepo

Run the following command to start the caddy reverse proxy:

```sh
docker compose up -d
```

Then run the following commands to start the development server for the backend and frontend:

```sh
pnpm install && pnpm dev
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `backend`: a [NestJS](https://nestjs.com/) app
- `frontend`: a [SvelteKit](https://kit.svelte.dev/) app
- `ui`: a shared UI library for the frontend so that they are seperated from the frontend app
- `eslint-config-custom`: `eslint` configurations (includes `eslint-plugin-svelte` and `eslint-config-prettier`)

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Tools

- [pnpm](https://pnpm.io/): a fast, disk space efficient package manager
- [turborepo](https://turborepo.dev/): a monorepo tool that optimizes the workflow for monorepos
- [docker](https://www.docker.com/): for running the caddy reverse proxy
- [caddy](https://caddyserver.com/): a web server that can be used as a reverse proxy
- [eslint](https://eslint.org/): for linting the code
- [prettier](https://prettier.io/): for formatting the code

More will be added in the future.

Oh and just FYI there is a reason why the frontend and backend are not in a container yet. I'm still figuring out how to do that properly. The containers will only be used for the production environment.
