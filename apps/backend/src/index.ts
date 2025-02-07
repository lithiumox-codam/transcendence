import { db, users } from "@repo/database";
import {
    type AppRouter,
    type FastifyTRPCPluginOptions,
    appRouter,
    createContext,
    fastifyTRPCPlugin,
} from "@repo/trpc";
import fastify from "fastify";

const server = fastify();

server.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
        router: appRouter,
        createContext,
        onError({ path, error }) {
            console.error(`Error in tRPC handler on path '${path}':`, error);
        },
    } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
});

server.get("/ping", async (_request, reply) => {
    try {
        const res = await db.select().from(users).all();
        reply.send(res);
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
