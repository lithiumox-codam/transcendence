import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./user.ts";

export const games = sqliteTable("games", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name", { length: 255 }).notNull(),
    player1: integer("player1")
        .notNull()
        .references(() => users.id),
    player2: integer("player2")
        .notNull()
        .references(() => users.id),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export type GameInsert = typeof games.$inferInsert;
export type Game = typeof games.$inferSelect;
export const gameInsertSchema = createInsertSchema(games);
export const gameSelectSchema = createSelectSchema(games);
