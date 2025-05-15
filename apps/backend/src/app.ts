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

    if (!import.meta.env.PROD) {
        fastify.register(cors, {
            origin: true,
            credentials: true,
        });
    }

    fastify.get("/health-check", (req, reply) => {
        reply.send({ status: "ok" });
    });

    fastify.get("/googleOauth", (req, reply) => {
        reply.send(process.env.VITE_GOOGLE_CLIENT_ID);
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
