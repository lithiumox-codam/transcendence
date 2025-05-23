import {
    type User,
    type UserFull,
    avatarSchema,
    blocks,
    db,
    friendSelectSchema,
    updateUserSchema,
    userNameSchema,
    users,
} from "@repo/database";
import { TRPCError } from "@trpc/server";
import { and, eq, like, ne, or, sql } from "drizzle-orm";
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
                oAuthProvider: users.oAuthProvider,
                createdAt: users.createdAt,
                passwordSet:
                    sql`CASE WHEN ${users.password} != '' THEN 1 ELSE 0 END`.as(
                        "passwordSet",
                    ),
                avatar: users.avatar,
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
                avatar: users.avatar,
                oAuthProvider: users.oAuthProvider,
            })
            .from(users)
            .where(eq(users.id, input));
        return res[0];
    }),
    update: protectedProcedure
        .input(updateUserSchema)
        .mutation(async ({ ctx, input }) => {
            const { name, email, avatar } = input;
            if (!name && !email && !avatar) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "No input provided",
                });
            }

            if (email && ctx.user.oAuthProvider) {
                throw new TRPCError({
                    code: "BAD_REQUEST",

                    message: "Cannot change email for OAuth users",
                });
            }

            try {
                const [edit] = await db
                    .update(users)
                    .set({
                        name,
                        email,
                        avatar,
                    })
                    .where(eq(users.id, ctx.user.id))
                    .returning({
                        id: users.id,
                        name: users.name,
                        email: users.email,
                        oAuthProvider: users.oAuthProvider,
                        avatar: users.avatar,
                        createdAt: users.createdAt,
                    });
                if (edit) {
                    emitter.emit("user:update", edit);
                    emitter.emit("friends:update", edit.id);
                }

                return edit;
            } catch (e) {
                console.error(e);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to update user",
                });
            }
        }),

    deleteAvatar: protectedProcedure.mutation(async ({ ctx }) => {
        const [edit] = await db
            .update(users)
            .set({
                avatar: null,
            })
            .where(eq(users.id, ctx.user.id))
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                oAuthProvider: users.oAuthProvider,
                avatar: users.avatar,
                createdAt: users.createdAt,
            });
        if (edit) {
            emitter.emit("user:update", edit);
            emitter.emit("friends:update", edit.id);
        }
        if (!edit) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "User not found or avatar not deleted",
            });
        }
        return edit;
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
            const block_list = await db
                .select()
                .from(blocks)
                .where(
                    or(
                        eq(blocks.blockedUserId, ctx.user.id),
                        eq(blocks.userId, ctx.user.id),
                    ),
                );

            const list = await db
                .select({
                    id: users.id,
                    name: users.name,
                    email: users.email,
					isDeleted: users.isDeleted,
                })
                .from(users)
                .where(
                    and(
                        like(users.name, `%${input}%`),
                        ne(users.id, ctx.user.id),
                    ),
                );

            return list.filter((user) => {
                return !block_list.some((blocked) => {
                    return (
                        blocked.blockedUserId === user.id ||
                        blocked.userId === user.id
                    );
                });
            });
        }),
    listen: protectedProcedure.subscription(({ ctx }) =>
        emitter.subscribeDomain("user", (event) => {
            console.log(event);
            return event.data.id === ctx.user.id;
        }),
    ),
});
