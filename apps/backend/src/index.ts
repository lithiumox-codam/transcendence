import cors from "@fastify/cors";
import ws from "@fastify/websocket";
import {
    type FastifyTRPCPluginOptions,
    appRouter,
    createTRPCContext,
    fastifyTRPCPlugin,
} from "@repo/trpc";
import fastify from "fastify";

const server = fastify();

await server.register(cors, {
    origin: "*",
});

server.register(ws);

server.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    useWSS: true,
    trpcOptions: {
        router: appRouter,
        createContext: createTRPCContext,
        onError({ path, error }) {
            // report to error monitoring
            console.error(`Error in tRPC handler on path '${path}':`, error);
        },
    } satisfies FastifyTRPCPluginOptions<typeof appRouter>["trpcOptions"],
});

server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
