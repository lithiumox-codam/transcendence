import { db, friends, users } from "@repo/database";
import { TRPCError } from "@trpc/server";
import { aliasedTable, and, count, eq, isNull, or } from "drizzle-orm";
import { z } from "zod";
import { emitter } from "../events/index.ts";
import { createTRPCRouter, protectedProcedure } from "../trpc.js";

export async function checkFriendship(
    userId: number,
    friendId: number,
): Promise<boolean> {
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

        // Mutual friendship exists if we find 2 records (both directions)
        return res[0]?.count === 2;
    } catch (e) {
        console.error(e);
        return false;
    }
}

export const friendsRouter = createTRPCRouter({
    list: protectedProcedure.query(async ({ ctx }) => {
        const f1 = aliasedTable(friends, "f1");
        const f2 = aliasedTable(friends, "f2");

        return await db
            .selectDistinct({
                id: users.id,
                name: users.name,
                email: users.email,
                createdAt: users.createdAt,
            })
            .from(users)
            .innerJoin(
                f1,
                and(eq(f1.userId, ctx.user.id), eq(users.id, f1.friendId)),
            )
            .innerJoin(
                f2,
                and(eq(f2.userId, users.id), eq(f2.friendId, ctx.user.id)),
            );
    }),
    add: protectedProcedure
        .input(
            z.object({
                friendId: z.number(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            if (await checkFriendship(ctx.user.id, input.friendId)) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Friendship already exists",
                });
            }
            try {
                const friendship = await db
                    .insert(friends)
                    .values({
                        userId: ctx.user.id,
                        friendId: input.friendId,
                    })
                    .returning();
                if (
                    friendship[0] &&
                    (await checkFriendship(
                        friendship[0].friendId,
                        friendship[0].userId,
                    ))
                ) {
                    emitter.emit("friends:new", friendship[0]);
                } else {
                    if (friendship[0])
                        emitter.emit("friends:request", friendship[0]);
                }

                return friendship[0];
            } catch (e) {
                console.error(e);
                throw e;
            }
        }),
    remove: protectedProcedure
        .input(z.number())
        .mutation(async ({ ctx, input }) => {
            const friendship = await db
                .delete(friends)
                .where(
                    and(
                        eq(friends.userId, ctx.user.id),
                        eq(friends.friendId, input),
                    ),
                )
                .returning();

            if (friendship[0]) {
                emitter.emit("friend:removed", friendship[0]);
            }
            return friendship[0];
        }),
    // Update listRequests to exclude mutual friendships
    listSentRequests: protectedProcedure.query(async ({ ctx }) => {
        const reciprocal = aliasedTable(friends, "reciprocal");

        return await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                createdAt: users.createdAt,
            })
            .from(users)
            .innerJoin(
                friends,
                and(
                    eq(friends.friendId, ctx.user.id),
                    eq(users.id, friends.userId),
                ),
            )
            .leftJoin(
                reciprocal,
                and(
                    eq(reciprocal.userId, ctx.user.id),
                    eq(reciprocal.friendId, users.id),
                ),
            )
            .where(isNull(reciprocal.userId));
    }),
    listRequests: protectedProcedure.query(async ({ ctx }) => {
        const reciprocal = aliasedTable(friends, "reciprocal");

        return await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                createdAt: users.createdAt,
            })
            .from(users)
            .innerJoin(
                friends,
                and(
                    eq(friends.userId, ctx.user.id),
                    eq(users.id, friends.friendId),
                ),
            )
            .leftJoin(
                reciprocal,
                and(
                    eq(reciprocal.userId, users.id),
                    eq(reciprocal.friendId, ctx.user.id),
                ),
            )
            .where(isNull(reciprocal.userId));
    }),
    listen: protectedProcedure.subscription(({ ctx }) =>
        emitter.subscribeDomain("friends", (event) => {
            if (event.type === "update" && event.data !== ctx.user.id) {
                return true;
            }
            if (event.type !== "update") {
                return (
                    event.data.userId === ctx.user.id ||
                    event.data.friendId === ctx.user.id
                );
            }
            return false;
        }),
    ),
});
