import fastify from "./app";

const app = fastify({
	pluginTimeout: 50000,
	bodyLimit: 15485760,
});

try {
	app.listen({ port: import.meta.env.PROD ? 8000 : 8080, host: "0.0.0.0" });
	console.log("Server listening on port", import.meta.env.PROD ? 8000 : 8080);
} catch (err) {
	app.log.error(err);
	process.exit(1);
}

export const backend = app;
