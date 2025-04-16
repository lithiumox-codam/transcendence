import { avatarSchema, db, friends, users } from "@repo/database";
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
                oAuthProvider: users.oAuthProvider,
                avatar: users.avatar,
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
        .input(z.number())
        .mutation(async ({ ctx, input }) => {
            // Prevent adding yourself as a friend
            if (ctx.user.id === input) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Cannot add yourself as a friend",
                });
            }

            const check = await checkFriendshipExists(ctx.user.id, input);

            if (check.mutual) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Friendship already exists",
                });
            }

            if (check.exists) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Friend request already sent",
                });
            }

            try {
                const friendship = await db
                    .insert(friends)
                    .values({
                        userId: ctx.user.id,
                        friendId: input,
                    })
                    .returning();

                // Check if this completes a mutual friendship
                const isNowMutual = await db
                    .select({ count: count() })
                    .from(friends)
                    .where(
                        and(
                            eq(friends.userId, input),
                            eq(friends.friendId, ctx.user.id),
                        ),
                    );

                if (friendship[0]) {
                    if ((isNowMutual[0]?.count ?? 0) > 0) {
                        // Both users have now added each other - it's a mutual friendship
                        emitter.emit("friends:new", friendship[0]);
                    } else {
                        // This is just a one-way friend request
                        emitter.emit("friends:request", friendship[0]);
                    }
                }

                return friendship[0];
            } catch (e) {
                console.error(e);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to add friend",
                    cause: e,
                });
            }
        }),
    remove: protectedProcedure
        .input(z.number())
        .mutation(async ({ ctx, input }) => {
            const friendship = await db
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
                )
                .returning();
            if (friendship) emitter.emit("friends:removed", friendship);

            return friendship[0];
        }),
    // Update listRequests to exclude mutual friendships
    listSentRequests: protectedProcedure.query(async ({ ctx }) => {
        const mutual = aliasedTable(friends, "mutual");

        return await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                createdAt: users.createdAt,
                avatar: users.avatar,
            })
            .from(users)
            .innerJoin(
                friends,
                and(
                    eq(friends.userId, ctx.user.id), // Current user SENT the request
                    eq(users.id, friends.friendId), // to this user
                ),
            )
            .leftJoin(
                mutual,
                and(
                    eq(mutual.userId, users.id), // Other user
                    eq(mutual.friendId, ctx.user.id), // added current user back
                ),
            )
            .where(isNull(mutual.userId)); // Exclude mutual friendships
    }),
    listRequests: protectedProcedure.query(async ({ ctx }) => {
        const mutual = aliasedTable(friends, "mutual");

        return await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                createdAt: users.createdAt,
                avatar: users.avatar,
            })
            .from(users)
            .innerJoin(
                friends,
                and(
                    eq(friends.friendId, ctx.user.id), // Current user RECEIVED the request
                    eq(users.id, friends.userId), // from this user
                ),
            )
            .leftJoin(
                mutual,
                and(
                    eq(mutual.userId, ctx.user.id), // Current user
                    eq(mutual.friendId, users.id), // added other user back
                ),
            )
            .where(isNull(mutual.userId)); // Exclude mutual friendships
    }),
    listen: protectedProcedure.subscription(({ ctx }) =>
        emitter.subscribeDomain("friends", (event) => {
            switch (event.type) {
                case "update":
                    return event.data !== ctx.user.id;
                case "new":
                case "request":
                    return (
                        event.data.friendId === ctx.user.id ||
                        event.data.userId === ctx.user.id
                    );
                case "removed": {
                    console.log("Friend removed", event.data);
                    return event.data.some(
                        (item) =>
                            item.friendId === ctx.user.id ||
                            item.userId === ctx.user.id,
                    );
                }
                default:
                    return false;
            }
        }),
    ),
});
