import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name", { length: 255 }).notNull(),
    email: text("email", { length: 255 }).notNull(),
});

export type UserInsert = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export const userInputSchema = createInsertSchema(users);
export const userSelectSchema = createSelectSchema(users);
