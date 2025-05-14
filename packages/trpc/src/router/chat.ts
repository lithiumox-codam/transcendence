import { db, message, messageInsertSchema, users } from "@repo/database";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, or } from "drizzle-orm";
import { z } from "zod";
import { emitter } from "../events/index.ts";
import { createTRPCRouter, protectedProcedure } from "../trpc.js";
import { checkFriendshipExists } from "./friends.ts";

export const chatRouter = createTRPCRouter({
    get: protectedProcedure
        .input(
            z.object({
                friendId: z.number(),
                limit: z.number().min(1).default(20),
                offset: z.number().min(0).default(0),
            }),
        )
        .query(async ({ ctx, input }) => {
            if (
                !(await checkFriendshipExists(ctx.user.id, input.friendId))
                    .mutual
            ) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Not friends with the specified user",
                });
            }

            return await db
                .select({
                    id: message.id,
                    content: message.content,
                    createdAt: message.createdAt,
                    senderId: message.senderId,
                    receiverId: message.receiverId,
                })
                .from(message)
                .where(
                    or(
                        and(
                            eq(message.senderId, ctx.user.id),
                            eq(message.receiverId, input.friendId),
                        ),
                        and(
                            eq(message.senderId, input.friendId),
                            eq(message.receiverId, ctx.user.id),
                        ),
                    ),
                )
                .orderBy(desc(message.createdAt))
                .limit(input.limit)
                .offset(input.offset);
        }),

    create: protectedProcedure
        .input(messageInsertSchema.omit({ senderId: true }))
        .mutation(async ({ ctx, input }) => {
            if (
                !(await checkFriendshipExists(ctx.user.id, input.receiverId))
                    .mutual
            ) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Not friends with the specified user",
                });
            }

            try {
                const [msg] = await db
                    .insert(message)
                    .values({
                        ...input,
                        senderId: ctx.user.id,
                        receiverId: input.receiverId,
                    })
                    .returning();

                if (msg) {
                    emitter.emit("chat:message", msg);
                    return msg;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to create message",
                });
            } catch (e) {
                console.error(e);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to send message",
                });
            }
        }),

    listen: protectedProcedure.subscription(({ ctx }) =>
        emitter.subscribeDomain("chat", (event) => {
            return (
                event.data.receiverId === ctx.user.id ||
                event.data.senderId === ctx.user.id
            );
        }),
    ),

    getAllSend: protectedProcedure.query(async ({ ctx }) => {
        const messages = await db
            .select({
                content: message.content,
                createdAt: message.createdAt,
                receiverUsername: users.name,
            })
            .from(message)
            .leftJoin(users, eq(message.receiverId, users.id))
            .where(eq(message.senderId, ctx.user.id))
            .orderBy(desc(message.createdAt));

        return messages;
    }),
});
