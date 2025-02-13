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
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "../trpc.js";
import { TypedEventEmitter } from "../utils.js";

interface ChatEvents {
    "room.add": Room;
    "message.new": Message;
}

const ee = new TypedEventEmitter<ChatEvents>();

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
                    ee.emit("room.add", room[0]);
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
        .query(async (opts) => {
            const { limit, offset } = opts.input ?? { limit: 10, offset: 0 };
            return await db
                .select()
                .from(rooms)
                .limit(limit)
                .offset(offset)
                .all();
        }),
    listen: protectedProcedure.subscription(async function* (opts) {
        try {
            for await (const data of ee.iterate("room.add")) {
                console.log("room.add", data);
                yield { data };
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    }),
});

const messagesRouter = createTRPCRouter({
    get: publicProcedure.input(z.number()).query(async (opts) => {
        return await db
            .select()
            .from(messages)
            .where(eq(messages.id, opts.input));
    }),
    create: publicProcedure
        .input(messageInsertSchema.omit({ userId: true }))
        .mutation(async (opts) => {
            if (!opts.ctx.user) {
                throw new Error("User not found");
            }
            try {
                const message = await db
                    .insert(messages)
                    .values({
                        ...opts.input,
                        userId: opts.ctx.user.id,
                    })
                    .returning();
                if (message[0]) {
                    ee.emit("message.new", message[0]);
                }
                return opts.input;
            } catch (e) {
                console.error(e);
                throw e;
            }
        }),
    all: publicProcedure.query(async () => {
        return await db.select().from(messages).all();
    }),
});

export const chatRouter = createTRPCRouter({
    rooms: roomsRouter,
    messages: messagesRouter,
});
