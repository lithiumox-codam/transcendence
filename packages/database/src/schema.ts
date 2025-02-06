import { int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

enum Status {
    ACTIVE = "active",
    BUSY = "busy",
    AWAY = "away",
    OFFLINE = "offline",
}

const usersTable = sqliteTable("users_table", {
    id: int().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    age: int().notNull(),
    email: text().notNull().unique(),
    hashedPassword: text().notNull(),
    createdAt: text().notNull(),
    updatedAt: text().notNull(),
    status: text().notNull().default(Status.OFFLINE),
});

type UserInsert = typeof usersTable.$inferInsert;
type User = typeof usersTable.$inferSelect;

const channelsTable = sqliteTable("channels_table", {
    id: int().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    createdAt: text().notNull(),
    updatedAt: text().notNull(),
});

type ChannelInsert = typeof channelsTable.$inferInsert;
type Channel = typeof channelsTable.$inferSelect;

const messagesTable = sqliteTable("messages_table", {
    id: int().primaryKey({ autoIncrement: true }),
    channelId: int().notNull(),
    userId: int().notNull(),
    text: text().notNull(),
    createdAt: text().notNull(),
    updatedAt: text().notNull(),
});

type MessageInsert = typeof messagesTable.$inferInsert;
type Message = typeof messagesTable.$inferSelect;

// Table for direct messages between individual users.
const directMessagesTable = sqliteTable("direct_messages_table", {
    id: int().primaryKey({ autoIncrement: true }),
    senderId: int().notNull(),
    receiverId: int().notNull(),
    text: text().notNull(),
    createdAt: text().notNull(),
    updatedAt: text().notNull(),
});

type DirectMessageInsert = typeof directMessagesTable.$inferInsert;
type DirectMessage = typeof directMessagesTable.$inferSelect;

export { usersTable, channelsTable, messagesTable, directMessagesTable };
export type {
    Status,
    UserInsert,
    User,
    ChannelInsert,
    Channel,
    MessageInsert,
    Message,
    DirectMessageInsert,
    DirectMessage,
};
