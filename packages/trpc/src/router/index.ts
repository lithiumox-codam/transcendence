import { db, userInputSchema, users } from "@repo/database";
import { initTRPC } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const t = initTRPC.create();
export const appRouter = t.router({
    getUserById: t.procedure.input(z.number()).query(async (opts) => {
        return await db.select().from(users).where(eq(users.id, opts.input));
    }),
    createUser: t.procedure.input(userInputSchema).mutation(async (opts) => {
        return await db.insert(users).values(opts.input);
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
