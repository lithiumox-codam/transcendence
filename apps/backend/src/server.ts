import fastify from "./app";

const app = fastify({
    pluginTimeout: 50000,
    bodyLimit: 15485760,
});

if (import.meta.env.PROD) {
    try {
        app.listen({ port: 8000, host: "0.0.0.0" });
        console.log("Server is running on port 8000");
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

export const backend = app;
