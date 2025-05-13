import cors from "@fastify/cors";
import ws from "@fastify/websocket";
import {
    type FastifyTRPCPluginOptions,
    appRouter,
    createTRPCContext,
    fastifyTRPCPlugin,
} from "@repo/trpc";
import { fastify as Fastify, type FastifyServerOptions } from "fastify";

export default (opts?: FastifyServerOptions) => {
    const fastify = Fastify(opts);

    fastify.register(ws);
    fastify.register(cors, {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        exposedHeaders: ["Content-Type"],
        credentials: true,
    });

    fastify.get("/", (req, reply) => {
        reply.send({ hello: "world" });
    });

    fastify.register(fastifyTRPCPlugin, {
        prefix: "/trpc",
        useWSS: true,
        trpcOptions: {
            router: appRouter,
            createContext: createTRPCContext,
            onError({ path, error }) {
                console.error(
                    `Error in tRPC handler on path '${path}':`,
                    error,
                );
            },
        } satisfies FastifyTRPCPluginOptions<typeof appRouter>["trpcOptions"],
    });

    return fastify;
};
