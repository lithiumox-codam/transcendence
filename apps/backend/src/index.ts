import ws from "@fastify/websocket";
import { db, users } from "@repo/database";
import {
    type FastifyTRPCPluginOptions,
    appRouter,
    createTRPCContext,
    fastifyTRPCPlugin,
} from "@repo/trpc";
import fastify from "fastify";

const server = fastify();

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

server.get("/panel", async (_, reply) => {
    const { renderTrpcPanel } = await import("trpc-ui");

    console.log(
        renderTrpcPanel(appRouter, {
            url: "http://localhost:8080/trpc",
            meta: {
                title: "My Backend Title",
                description:
                    "This is a description of my API, which supports [markdown](https://en.wikipedia.org/wiki/Markdown).",
            },
        }),
    );

    reply.send(
        renderTrpcPanel(appRouter, {
            url: "http://localhost:8080/trpc",
            meta: {
                title: "My Backend Title",
                description:
                    "This is a description of my API, which supports [markdown](https://en.wikipedia.org/wiki/Markdown).",
            },
        }),
    );
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
