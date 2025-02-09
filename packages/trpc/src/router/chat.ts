import { EventEmitter } from "node:events";
import {
    type Message,
    db,
    memberInsertSchema,
    members,
    messageInsertSchema,
    messages,
    roomInsertSchema,
    rooms,
} from "@repo/database";
import { observable } from "@trpc/server/observable";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc.js";

const ee = new EventEmitter();

const roomsRouter = createTRPCRouter({
    get: publicProcedure.input(z.number()).query(async (opts) => {
        return await db.select().from(rooms).where(eq(rooms.id, opts.input));
    }),
    create: publicProcedure.input(roomInsertSchema).mutation(async (opts) => {
        return await db.insert(rooms).values(opts.input);
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
    listen: publicProcedure.subscription(() => {
        return observable<Message>((emit) => {
            ee.on("message", emit.next);
            return () => {
                ee.off("message", emit.next);
            };
        });
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
        .input(messageInsertSchema)
        .mutation(async (opts) => {
            try {
                await db.insert(messages).values(opts.input);
                ee.emit("message", opts.input);
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
