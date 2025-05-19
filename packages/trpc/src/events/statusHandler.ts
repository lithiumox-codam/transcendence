import { type User, db, friends, users } from "@repo/database";
import { aliasedTable, and, eq } from "drizzle-orm";
import { emitter } from "./index.ts";

interface UserStatus {
    connections: number;
    lastConnected: Date;
}

export const activeUsers = new Map<number, UserStatus>();

export async function fetchFriends(user: Omit<User, "avatar">) {
    const f1 = aliasedTable(friends, "f1");
    const f2 = aliasedTable(friends, "f2");

    return await db
        .selectDistinct({
            id: users.id,
            name: users.name,
            email: users.email,
            createdAt: users.createdAt,
            oAuthProvider: users.oAuthProvider,
            avatar: users.avatar,
        })
        .from(users)
        .innerJoin(f1, and(eq(f1.userId, user.id), eq(users.id, f1.friendId)))
        .innerJoin(f2, and(eq(f2.userId, users.id), eq(f2.friendId, user.id)));
}

/**
 * @brief Updates the status of a user to the friends who are already online.
 */
async function updateOnlineStatus(user: Omit<User, "avatar">) {
    const friends = await fetchFriends(user);
    for (const friend of friends) {
        if (activeUsers.has(friend.id)) {
            emitter.emit("status:online", {
                userId: friend.id,
                friendId: user.id,
            });
        }
    }
}

/**
 * @brief Updates the status of a user to the friends who are already offline.
 */
async function updateOfflineStatus(user: Omit<User, "avatar">) {
    const friends = await fetchFriends(user);
    for (const friend of friends) {
        if (activeUsers.has(friend.id)) {
            emitter.emit("status:offline", {
                userId: friend.id,
                friendId: user.id,
            });
        }
    }
}

export async function handleUserConnect(user: Omit<User, "avatar">) {
    if (!activeUsers.has(user.id)) {
        activeUsers.set(user.id, {
            connections: 1,
            lastConnected: new Date(),
        });
    } else {
        const userStatus = activeUsers.get(user.id);
        if (userStatus) {
            userStatus.connections++;
            userStatus.lastConnected = new Date();
        }
    }
    await updateOnlineStatus(user);
}

export async function handleUserDisconnect(user: Omit<User, "avatar">) {
    if (activeUsers.has(user.id)) {
        const userStatus = activeUsers.get(user.id);
        if (userStatus) {
            userStatus.connections--;
            if (userStatus.connections <= 0) {
                activeUsers.delete(user.id);
                await updateOfflineStatus(user);
            }
        }
    }
}
