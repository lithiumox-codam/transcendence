import { get } from "node:http";
import {
    type Message,
    type Room,
    db,
    memberInsertSchema,
    members,
    messageInsertSchema,
    messages,
    roomInsertSchema,
    rooms,
} from "@repo/database";
import { TRPCError } from "@trpc/server";
import { and, count, eq } from "drizzle-orm";
import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "../trpc.js";
import { TypedEventEmitter } from "../utils.js";

interface ChatEvents {
    "room.add": Room;
    "room.remove": Room;
    "message.new": Message;
}

const events = new TypedEventEmitter<ChatEvents>();

async function checkRoomMembership(
    userId: number,
    roomId: number,
): Promise<boolean> {
    try {
        const res = await db
            .select({ count: count(members.userId) })
            .from(members)
            .where(and(eq(members.userId, userId), eq(members.roomId, roomId)));
        if (!res[0]) {
            return false;
        }
        return res[0].count > 0;
    } catch (e) {
        console.error(e);
        return false;
    }
}

const roomsRouter = createTRPCRouter({
    get: publicProcedure.query(async ({ ctx }) => {
        if (!ctx.user) {
            throw new Error("User not found");
        }
        return await db
            .select({
                id: rooms.id,
                name: rooms.name,
                createdAt: rooms.createdAt,
            })
            .from(rooms)
            .innerJoin(members, eq(rooms.id, members.roomId))
            .where(eq(members.userId, ctx.user.id));
    }),
    create: protectedProcedure
        .input(roomInsertSchema)
        .mutation(async (opts) => {
            try {
                const room = await db
                    .insert(rooms)
                    .values(opts.input)
                    .returning();
                if (room[0]) {
                    await db.insert(members).values({
                        userId: opts.ctx.user.id,
                        roomId: room[0].id,
                    });
                    events.emit("room.add", room[0]);
                }
                return room;
            } catch (e) {
                console.error(e);
                throw e;
            }
        }),
    all: publicProcedure
        .input(
            z
                .object({
                    limit: z.number().min(1).default(10),
                    offset: z.number().min(0).default(0),
                })
                .optional(),
        )
        .query(async ({ input }) => {
            const { limit, offset } = input ?? { limit: 10, offset: 0 };
            return await db.select().from(rooms).limit(limit).offset(offset);
        }),
    listen: protectedProcedure.subscription(async function* ({ ctx }) {
        try {
            const roomStream = events.stream("room");
            for await (const data of roomStream) {
                if (await checkRoomMembership(ctx.user.id, data.room.id)) {
                    yield { data };
                }
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    }),
});

const messagesRouter = createTRPCRouter({
    get: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
        return await db
            .select({
                id: messages.id,
                message: messages.message,
                createdAt: messages.createdAt,
                userId: messages.userId,
                roomId: messages.roomId,
            })
            .from(messages)
            .where(eq(messages.roomId, input));
    }),
    create: protectedProcedure
        .input(messageInsertSchema.omit({ userId: true }))
        .mutation(async ({ ctx, input }) => {
            if (await checkRoomMembership(ctx.user.id, input.roomId)) {
                try {
                    const message = await db
                        .insert(messages)
                        .values({
                            ...input,
                            userId: ctx.user.id,
                        })
                        .returning();
                    if (message[0]) {
                        events.emit("message.new", message[0]);
                    }
                } catch (e) {
                    console.error(e);
                    throw e;
                }
            } else {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "User is not a member of the room",
                });
            }
        }),
    listen: protectedProcedure.subscription(async function* ({ ctx }) {
        try {
            const messageStream = events.stream("message");
            for await (const data of messageStream) {
                if (
                    await checkRoomMembership(ctx.user.id, data.message.roomId)
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

export const chatRouter = createTRPCRouter({
    rooms: roomsRouter,
    messages: messagesRouter,
});
