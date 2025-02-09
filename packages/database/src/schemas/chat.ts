import { sql } from "drizzle-orm";
import {
    integer,
    primaryKey,
    sqliteTable,
    text,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./user.ts";

export const rooms = sqliteTable("rooms", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name", { length: 255 }).notNull(),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export type RoomInsert = typeof rooms.$inferInsert;
export type Room = typeof rooms.$inferSelect;
export const roomInsertSchema = createInsertSchema(rooms);
export const roomSelectSchema = createSelectSchema(rooms);

export const messages = sqliteTable("messages", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    message: text("message", { length: 255 }).notNull(),
    roomId: integer("room_id")
        .notNull()
        .references(() => rooms.id),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export type MessageInsert = typeof messages.$inferInsert;
export type Message = typeof messages.$inferSelect;
export const messageInsertSchema = createInsertSchema(messages);
export const messageSelectSchema = createSelectSchema(messages);

export const members = sqliteTable(
    "members",
    {
        userId: integer("user_id")
            .notNull()
            .references(() => users.id),
        roomId: integer("room_id")
            .notNull()
            .references(() => rooms.id),
        joinedAt: text("joined_at").default(sql`(CURRENT_TIMESTAMP)`),
    },
    (table) => [primaryKey({ columns: [table.userId, table.roomId] })],
);

export type MemberInsert = typeof members.$inferInsert;
export type Member = typeof members.$inferSelect;
export const memberInsertSchema = createInsertSchema(members);
export const memberSelectSchema = createSelectSchema(members);
