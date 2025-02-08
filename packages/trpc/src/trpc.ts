import { db } from "@repo/database";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

/**
 * 1. REQUEST CONTEXT
 *
 * This is where you define the context that is passed to every tRPC procedure.
 * You can add things like session data, database connections, etc.
 */
export const createTRPCContext = async (opts: {
    headers: Headers;
    session: null;
}) => {
    const authToken = opts.headers.get("Authorization") ?? null;
    return {
        session, // user, etc (im implementing this later)
        db,
        token: authToken,
    };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
    transformer: superjson,
    errorFormatter: ({ shape, error }) => ({
        ...shape,
        data: {
            ...shape.data,
            zodError:
                error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
    }),
});

/**
 * Create a server-side caller (for server-side calls and testing)
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an articifial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
    const start = Date.now();

    if (t._config.isDev) {
        // artificial delay in dev 100-500ms
        const waitMs = Math.floor(Math.random() * 400) + 100;
        await new Promise((resolve) => setTimeout(resolve, waitMs));
    }

    const result = await next();

    const end = Date.now();
    console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

    return result;
});

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
// export const protectedProcedure = t.procedure
//     .use(timingMiddleware)
//     .use(({ ctx, next }) => {
//         if (!ctx.session?.user) {
//             throw new TRPCError({ code: "UNAUTHORIZED" });
//         }
//         return next({
//             ctx: {
//                 // infers the `session` as non-nullable
//                 session: { ...ctx.session, user: ctx.session.user },
//             },
//         });
//     });
