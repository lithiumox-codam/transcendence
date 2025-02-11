import { verify } from "@repo/auth";
import { db, users } from "@repo/database";
import { TRPCError, initTRPC } from "@trpc/server";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { eq } from "drizzle-orm";
import superjson from "superjson";
import { ZodError } from "zod";

/**
 * 1. REQUEST CONTEXT
 *
 * This is where you define the context that is passed to every tRPC procedure.
 * You can add things like session data, database connections, etc.
 */
export async function createTRPCContext({
    req,
    res,
}: CreateFastifyContextOptions) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return { req, res, user: null };
    }
    const token = authHeader.split(" ")[1];
    let user = null;
    if (token) {
        console.log("token", token);
        try {
            const payload = await verify(token);
            const userId: number = payload.userId as number;
            if (!userId) {
                throw new Error("No user id in token");
            }
            user = await db.select().from(users).where(eq(users.id, userId));
            console.log("user", user);
        } catch (e) {}
    }

    return { req, res, user };
}

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
    let waitMs = 0;
    if (t._config.isDev) {
        // artificial delay in dev 100-500ms
        waitMs = Math.floor(Math.random() * 400) + 100;
        await new Promise((resolve) => setTimeout(resolve, waitMs));
    }

    const result = await next();

    const end = Date.now();
    console.log(
        `[TRPC] ${path} took ${end - start}ms to execute (+${waitMs}ms)`,
    );

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
export const protectedProcedure = t.procedure
    .use(timingMiddleware)
    .use(({ ctx, next }) => {
        if (!ctx.user) {
            throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        return next({
            ctx: {
                // infers the `session` as non-nullable
                user: ctx.user,
            },
        });
    });
