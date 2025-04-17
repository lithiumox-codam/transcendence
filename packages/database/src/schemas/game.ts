import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./user.ts";

export const games = sqliteTable("games", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    status: text("status", {
        enum: ["waiting", "playing", "finished"],
    })
        .notNull()
        .default("waiting"),
    private: integer("private").default(0),
    maxPlayers: integer("max_players").notNull().default(2),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at")
        .default(sql`(CURRENT_TIMESTAMP)`)
        .$onUpdateFn(() => sql`(CURRENT_TIMESTAMP)`),
});

export type GameInsert = typeof games.$inferInsert;
export type Game = typeof games.$inferSelect;
export const gameInsertSchema = createInsertSchema(games);
export const gameSelectSchema = createSelectSchema(games);

export const players = sqliteTable("players", {
    gameId: integer("game_id")
        .notNull()
        .references(() => games.id),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id),
    score: integer("score").notNull().default(0),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export type PlayerInsert = typeof players.$inferInsert;
export type Player = typeof players.$inferSelect;
export const playerInsertSchema = createInsertSchema(players);
export const playerSelectSchema = createSelectSchema(players);
