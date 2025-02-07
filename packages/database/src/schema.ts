import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name", { length: 255 }).notNull(),
});

export const posts = sqliteTable("posts", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    authorId: integer("authorId").notNull(),
});
