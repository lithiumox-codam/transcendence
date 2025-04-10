import type {
    Friend,
    Game,
    Message,
    Player,
    User,
} from "@repo/database/schema";

/**
 * Defines the structure of events for the application, mapping event domains to event names and payload types.
 * This interface ensures type safety when working with events.
 */
export interface EventMap {
    chat: {
        message: Message;
        removal: Message;
    };
    user: {
        update: User;
    };
    friends: {
        new: Friend;
        removed: Friend[];
        update: number;
        request: Friend;
    };
    queue: {
        newMatch: { userId: number; gameId: number };
        players: User[];
    };
    [key: string]: Record<string, unknown>; // Added to tell TypeScript that the key is a string
}
