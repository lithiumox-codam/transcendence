import { sql } from "drizzle-orm";
import {
    blob,
    integer,
    primaryKey,
    sqliteTable,
    text,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { encryptedText } from "../encryptedText.ts";

export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name", { length: 255 }).notNull(),
    email: text("email", { length: 255 }).notNull(),
    password: text("password").notNull(),
    oAuthProvider: text("oauth_provider"),
    avatar: text("avatar"),
    secret: encryptedText("secret"),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export type UserInsert = typeof users.$inferInsert;
export type UserFull = typeof users.$inferSelect;
export type User = Omit<UserFull, "password" | "secret">;

export const userNameSchema = z
    .string()
    .min(3)
    .max(255)
    .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Name can only contain letters, numbers, and underscores",
    });
export const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[\W_]/, "Password must contain at least one special character");

export const userSelectSchema = createSelectSchema(users);

const MAX_UPLOAD_SIZE = 1024 * 1024 * 10; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg"];

export const avatarSchema = z
    .string()
    .refine(
        (data) => {
            const [header] = data.split(",");
            if (!header) return false;

            const mimeTypeMatch = header.match(/data:(.*?);base64/);
            const mimeType = mimeTypeMatch?.[1] || "";

            return ACCEPTED_IMAGE_TYPES.includes(mimeType);
        },
        {
            message: ".jpeg, .png files are accepted.",
        },
    )
    .refine(
        (data) => {
            const base64Data = data.split(",")[1];
            if (!base64Data) {
                return false;
            }

            const fileSize = ((4 * base64Data.length) / 3 + 3) & ~3;

            return fileSize <= MAX_UPLOAD_SIZE;
        },
        {
            message: "Max file size is 10MB.",
        },
    );

export const updateUserSchema = z.object({
    name: userNameSchema.optional(),
    email: z.string().email().optional(),
    avatar: avatarSchema.optional(),
});

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

export const blocks = sqliteTable(
    "blocks",
    {
        userId: integer("user_id")
            .notNull()
            .references(() => users.id),
        blockedUserId: integer("blocked_user_id")
            .notNull()
            .references(() => users.id),
        createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    },
    (table) => [
        primaryKey({
            name: "user_block_pk",
            columns: [table.userId, table.blockedUserId],
        }),
    ],
);
export type BlockInsert = typeof blocks.$inferInsert;
export type Block = typeof blocks.$inferSelect;
export const blockInsertSchema = createInsertSchema(blocks);
export const blockSelectSchema = createSelectSchema(blocks);
