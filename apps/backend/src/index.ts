import { db, users } from "@repo/database";
import {
    type FastifyTRPCPluginOptions,
    appRouter,
    createTRPCContext,
    fastifyTRPCPlugin,
} from "@repo/trpc";
import fastify from "fastify";

const server = fastify();

server.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
        router: appRouter,
        createTRPCContext,
        onError({ path, error }) {
            // report to error monitoring
            console.error(`Error in tRPC handler on path '${path}':`, error);
        },
    } satisfies FastifyTRPCPluginOptions<typeof appRouter>["trpcOptions"],
});

server.get("/ping", async (_request, reply) => {
    const res = await db.select().from(users).all();
    reply.send(res);
});

server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
