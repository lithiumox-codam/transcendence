import fastify from "./app";
import { env } from "./env";

const app = fastify({
    pluginTimeout: 50000,
    bodyLimit: 15485760,
});

console.log(env);

if (import.meta.env.PROD) {
    try {
        app.listen({ port: env.BACKEND_PORT, host: env.BACKEND_HOST });
        console.log(
            `Server started on ${env.BACKEND_HOST}:${env.BACKEND_PORT}`,
        );
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

export const backend = app;
