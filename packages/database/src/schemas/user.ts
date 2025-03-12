import { sql } from "drizzle-orm";
import {
    integer,
    primaryKey,
    sqliteTable,
    text,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name", { length: 255 }).notNull(),
    email: text("email", { length: 255 }).notNull(),
    password: text("password").notNull(),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export type UserInsert = typeof users.$inferInsert;
export type UserFull = typeof users.$inferSelect;
export type User = Omit<UserFull, "password">;

export const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[\W_]/, "Password must contain at least one special character");

export const userInputSchema = createInsertSchema(users).extend({
    password: passwordSchema,
});
export const userSelectSchema = createSelectSchema(users);

/**
 * The shared primary key for the friends table enables us to enforce that
 * a user can only be friends with another user once. This is done by
 * creating a unique constraint on the primary key. This way, if a user
 * tries to add a friend that they are already friends with, the database
 * will throw an error.
 */
export const friends = sqliteTable(
    "friends",
    {
        userId: integer("user_id")
            .notNull()
            .references(() => users.id),
        friendId: integer("friend_id")
            .notNull()
            .references(() => users.id),
        createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    },
    (table) => [
        primaryKey({
            name: "user_friend_pk",
            columns: [table.userId, table.friendId],
        }),
    ],
);

export type FriendInsert = typeof friends.$inferInsert;
export type Friend = typeof friends.$inferSelect;
export const friendInsertSchema = createInsertSchema(friends);
export const friendSelectSchema = createSelectSchema(friends);