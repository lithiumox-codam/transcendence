import {
    type User,
    type UserFull,
    db,
    userInputSchema,
    users,
} from "@repo/database";
import { TRPCError } from "@trpc/server";
import { and, eq, like, ne } from "drizzle-orm";
import { z } from "zod";
import { emitter } from "../events/index.ts";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "../trpc.js";
import { friendsRouter } from "./friends.ts";
import { gdprRouter } from "./gdpr.ts";

export const userRouter = createTRPCRouter({
    friends: friendsRouter,
    privacy: gdprRouter,
    get: protectedProcedure.query(async ({ ctx }) => {
        return await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.id, ctx.user.id));
    }),
    getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
        const res = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.id, input));
        return res[0];
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
            try {
                const [edit] = await db
                    .update(users)
                    .set({
                        ...input,
                    })
                    .where(eq(users.id, ctx.user.id))
                    .returning({
                        id: users.id,
                        name: users.name,
                        email: users.email,
                        createdAt: users.createdAt,
                    });
                if (edit) {
                    emitter.emit("user:update", edit);
                    emitter.emit("friends:update", edit.id);
                }
            } catch (e) {
                console.error(e);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to update user",
                });
            }
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
    search: protectedProcedure
        .input(z.string())
        .query(async ({ input, ctx }) => {
            return await db
                .select({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                })
                .from(users)
                .where(
                    and(
                        like(users.name, `%${input}%`),
                        ne(users.id, ctx.user.id),
                    ),
                );
        }),
    listen: protectedProcedure.subscription(({ ctx }) =>
        emitter.subscribeDomain("user", (event) => {
            console.log(event);
            return event.data.id === ctx.user.id;
        }),
    ),
});
