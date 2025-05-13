import envSchema from "env-schema";
import fastify from "./app";

const app = fastify({
    pluginTimeout: 50000,
    bodyLimit: 15485760,
});

// if (import.meta.env.PROD) {
try {
    const { BACKEND_PORT } = envSchema({
        dotenv: true,
        schema: {
            type: "object",
            required: ["BACKEND_PORT"],
            properties: {
                BACKEND_PORTPORT: {
                    type: "string",
                    default: 8080,
                },
            },
        },
    });

    app.listen({ port: 8080, host: "0.0.0.0" });
    console.log(`Server started on 0.0.0.0:${BACKEND_PORT}`);
} catch (err) {
    app.log.error(err);
    process.exit(1);
}
// }

export const viteNodeApp = app;
