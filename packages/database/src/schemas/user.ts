import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { encryptedText } from "../encrypt.ts";

export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name", { length: 255 }).notNull(),
    email: text("email", { length: 255 }).notNull(),
    password: encryptedText("password").notNull(),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export type UserInsert = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export const userInputSchema = createInsertSchema(users);
export const userSelectSchema = createSelectSchema(users);

export const friends = sqliteTable("friends", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id),
    friendId: integer("friend_id")
        .notNull()
        .references(() => users.id),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export type FriendInsert = typeof friends.$inferInsert;
export type Friend = typeof friends.$inferSelect;
export const friendInsertSchema = createInsertSchema(friends);
export const friendSelectSchema = createSelectSchema(friends);

export const refreshToken = sqliteTable("refresh_tokens", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id),
    token: text("token").notNull(),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export type RefreshTokenInsert = typeof refreshToken.$inferInsert;
export type RefreshToken = typeof refreshToken.$inferSelect;
export const refreshTokenInsertSchema = createInsertSchema(refreshToken);
export const refreshTokenSelectSchema = createSelectSchema(refreshToken);
