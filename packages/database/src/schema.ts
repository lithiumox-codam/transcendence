import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name", { length: 255 }).notNull(),
});

export type UserInsert = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export const userInputSchema = createInsertSchema(users);
export const userSelectSchema = createSelectSchema(users);

export const posts = sqliteTable("posts", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    authorId: integer("authorId").notNull(),
});

export type PostInsert = typeof posts.$inferInsert;
export type Post = typeof posts.$inferSelect;
export const postInputSchema = createInsertSchema(posts);
export const postSelectSchema = createSelectSchema(posts);
