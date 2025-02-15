import { type Message, db, message, messageInsertSchema } from "@repo/database";
import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc.js";
import { TypedEventEmitter } from "../utils.js";
import { checkFriendship } from "./user.ts";

interface ChatEvents {
    "message.new": Message;
}

const events = new TypedEventEmitter<ChatEvents>();

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
            if (!(await checkFriendship(ctx.user.id, input.friendId))) {
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
                    userId: message,
                })
                .from(message)
                .where(eq(message.receiverId, input.friendId))
                .limit(input.limit)
                .offset(input.offset)
                .orderBy(desc(message.createdAt));
        }),
    create: protectedProcedure
        .input(messageInsertSchema.omit({ senderId: true }))
        .mutation(async ({ ctx, input }) => {
            if (!(await checkFriendship(ctx.user.id, input.receiverId))) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Not friends with the specified user",
                });
            }
            try {
                const msg = await db
                    .insert(message)
                    .values({
                        ...input,
                        senderId: ctx.user.id,
                        receiverId: input.receiverId,
                    })
                    .returning();
                if (msg[0]) events.emit("message.new", msg[0]);
                return message;
            } catch (e) {
                console.error(e);
                throw e;
            }
        }),

    listen: protectedProcedure.subscription(async function* ({ ctx }) {
        const messageStream = events.stream("message");
        try {
            for await (const data of messageStream) {
                if (
                    data.message.senderId === ctx.user.id ||
                    (await checkFriendship(
                        ctx.user.id,
                        data.message.receiverId,
                    ))
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
