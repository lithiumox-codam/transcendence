import {
    type FastifyTRPCPluginOptions,
    fastifyTRPCPlugin,
} from "@trpc/server/adapters/fastify";
import { createContext } from "./context.js";
import { type AppRouter, appRouter, t } from "./router/index.js";

export {
    type AppRouter,
    appRouter,
    t,
    createContext,
    type FastifyTRPCPluginOptions,
    fastifyTRPCPlugin,
};
