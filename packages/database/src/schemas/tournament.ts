import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./user.ts";

export const tournaments = sqliteTable("tournaments", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    status: text("status", {
        enum: ["waiting", "playing", "finished"],
    })
        .notNull()
        .default("waiting"),
    winnerId: integer("winner_id").references(() => users.id),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at")
        .default(sql`(CURRENT_TIMESTAMP)`)
        .$onUpdateFn(() => sql`(CURRENT_TIMESTAMP)`),
});

export const tournamentPlayers = sqliteTable("tournament_players", {
    tournamentId: integer("tournament_id")
        .notNull()
        .references(() => tournaments.id),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id),
    score: integer("score").notNull().default(0),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});
