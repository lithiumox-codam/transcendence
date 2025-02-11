import { db, userInputSchema, users } from "@repo/database";
import { observable } from "@trpc/server/observable";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "../trpc.js";

export const userRouter = createTRPCRouter({
    get: protectedProcedure.input(z.number()).query(async (opts) => {
        if (!opts.ctx.user) {
            throw new Error("User not found");
        }
        return await db.select().from(users).where(eq(users.id, opts.input));
    }),
    create: publicProcedure.input(userInputSchema).mutation(async (opts) => {
        return await db.insert(users).values(opts.input);
    }),
    all: publicProcedure.query(async () => {
        return await db.select().from(users).all();
    }),
    test: publicProcedure.subscription(() => {
        return observable<number>((emit) => {
            const int = setInterval(() => {
                emit.next(Math.random());
            }, 500);
            return () => {
                clearInterval(int);
            };
        });
    }),

    testString: publicProcedure.subscription(() => {
        return observable<string>((emit) => {
            const int = setInterval(() => {
                emit.next(Math.random().toString(36).substring(7));
            }, 500);
            return () => {
                clearInterval(int);
            };
        });
    }),
});
