import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./user.ts";

export const message = sqliteTable("messages", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    content: text("content").notNull(),
    senderId: integer("sender")
        .notNull()
        .references(() => users.id),
    receiverId: integer("receiver")
        .notNull()
        .references(() => users.id),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export type MessageInsert = typeof message.$inferInsert;
export type Message = typeof message.$inferSelect;
export const messageInsertSchema = createInsertSchema(message);
export const messageSelectSchema = createSelectSchema(message);
