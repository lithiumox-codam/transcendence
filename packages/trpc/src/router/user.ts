import {
    type Friend,
    db,
    friends,
    userInputSchema,
    users,
} from "@repo/database";
import { TRPCError } from "@trpc/server";
import { aliasedTable, and, count, eq, like, ne, or } from "drizzle-orm";
import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "../trpc.js";
import { TypedEventEmitter } from "../utils.ts";

interface UserEvents {
    "friend.new": Friend;
}

const events = new TypedEventEmitter<UserEvents>();

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

const friendsRouter = createTRPCRouter({
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
                // get the friend's user data

                if (friendship[0]) events.emit("friend.new", friendship[0]);
                return friendship[0];
            } catch (e) {
                console.error(e);
                throw e;
            }
        }),
    remove: protectedProcedure
        .input(z.number())
        .mutation(async ({ ctx, input }) => {
            return await db
                .delete(friends)
                .where(
                    and(
                        eq(friends.userId, ctx.user.id),
                        eq(friends.friendId, input),
                    ),
                );
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
            );
    }),
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
            );
    }),
    listen: protectedProcedure.subscription(async function* ({ ctx }) {
        const friendStream = events.stream("friend");
        try {
            for await (const data of friendStream) {
                if (
                    data.friend.friendId === ctx.user.id ||
                    data.friend.userId === ctx.user.id
                ) {
                    yield { data };
                }
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    }),
});

export const userRouter = createTRPCRouter({
    friends: friendsRouter,
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
});
