import { db, userInputSchema, users } from "@repo/database";
import { observable } from "@trpc/server/observable";
import { eq } from "drizzle-orm";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "../trpc.js";

export const userRouter = createTRPCRouter({
    get: protectedProcedure.query(async ({ ctx }) => {
        if (!ctx.user) {
            throw new Error("User not found");
        }
        return await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
            })
            .from(users)
            .where(eq(users.id, ctx.user.id));
    }),
    create: publicProcedure.input(userInputSchema).mutation(async (opts) => {
        return await db.insert(users).values(opts.input);
    }),
    update: protectedProcedure
        .input(
            userInputSchema
                .omit({ id: true, createdAt: true, password: true })
                .optional(),
        )
        .mutation(async ({ ctx, input }) => {
            return await db
                .update(users)
                .set({
                    ...input,
                })
                .where(eq(users.id, ctx.user.id));
        }),
    all: publicProcedure.query(async () => {
        return await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
            })
            .from(users)
            .all();
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
