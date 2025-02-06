import { db, schema } from "@repo/database";
import fastify from "fastify";

const server = fastify();

await db.get(schema.User, 1);

server.get("/ping", async (request, reply) => {
    return "pong\n";
});

server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
