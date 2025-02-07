import { db, users } from "@repo/database";
import fastify from "fastify";

const server = fastify();

server.get("/ping", async (_request, reply) => {
    try {
        const res = await db.select().from(users).all();
        console.log(res);
        reply.send("pong");
    } catch (err) {
        console.log(err);
    }
});

server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
