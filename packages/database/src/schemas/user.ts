import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
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
export type User = typeof users.$inferSelect;

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
