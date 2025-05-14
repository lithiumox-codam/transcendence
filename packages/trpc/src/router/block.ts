import { avatarSchema, blocks, db, friends, users } from "@repo/database";
import { TRPCError } from "@trpc/server";
import { aliasedTable, and, count, desc, eq, isNull, or } from "drizzle-orm";
import { z } from "zod";
import { emitter } from "../events/index.ts";
import { createTRPCRouter, protectedProcedure } from "../trpc.js";

export async function checkFriendshipExists(
    userId: number,
    friendId: number,
): Promise<{ mutual: boolean; exists: boolean }> {
    try {
        const res = await db
            .select({ count: count() })
            .from(friends)
            .where(
                or(
                    and(
                        eq(friends.userId, userId),
                        eq(friends.friendId, friendId),
                    ),
                    and(
                        eq(friends.userId, friendId),
                        eq(friends.friendId, userId),
                    ),
                ),
            );

        // Check if the specific relationship already exists
        const specificRes = await db
            .select({ count: count() })
            .from(friends)
            .where(
                and(eq(friends.userId, userId), eq(friends.friendId, friendId)),
            );

        return {
            mutual: res[0]?.count === 2, // Added optional chaining
            exists: (specificRes[0]?.count ?? 0) > 0, // Added optional chaining with fallback
        };
    } catch (e) {
        console.error(e);
        return { mutual: false, exists: false };
    }
}

export const blockRouter = createTRPCRouter({
    add: protectedProcedure
        .input(z.number())
        .mutation(async ({ ctx, input }) => {
            const { exists } = await checkFriendshipExists(ctx.user.id, input);

            if (exists)
                await db
                    .delete(friends)
                    .where(
                        or(
                            and(
                                eq(friends.userId, ctx.user.id),
                                eq(friends.friendId, input),
                            ),
                            and(
                                eq(friends.userId, input),
                                eq(friends.friendId, ctx.user.id),
                            ),
                        ),
                    );

            await db.insert(blocks).values({
                userId: ctx.user.id,
                blockedUserId: input,
            });

            return true;
        }),
    remove: protectedProcedure
        .input(z.number())
        .mutation(async ({ ctx, input }) => {
            await db
                .delete(blocks)
                .where(
                    and(
                        eq(blocks.userId, ctx.user.id),
                        eq(blocks.blockedUserId, input),
                    ),
                );

            return true;
        }),
    isBlocked: protectedProcedure
        .input(z.number())
        .query(async ({ ctx, input }) => {
            const res = await db
                .select()
                .from(blocks)
                .where(
                    and(
                        eq(blocks.userId, ctx.user.id),
                        eq(blocks.blockedUserId, input),
                    ),
                );
            return res.length > 0;
        }),
    list: protectedProcedure.query(async ({ ctx }) => {
        const blockedUsers = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                avatar: users.avatar,
                oAuthProvider: users.oAuthProvider,
                createdAt: users.createdAt,
            })
            .from(blocks)
            .innerJoin(users, eq(users.id, blocks.blockedUserId))
            .where(eq(blocks.userId, ctx.user.id));

        return blockedUsers;
    }),
});
