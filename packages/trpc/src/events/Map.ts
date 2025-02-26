import type { Friend, Message } from "@repo/database";

/**
 * Defines the structure of events for the application, mapping event domains to event names and payload types.
 * This interface ensures type safety when working with events.
 */
export interface EventMap {
  chat: {
    messageCreated: Message;
    messageDeleted: Message;
  };
  user: {
    friendAdded: Friend;
    friendDeleted: Friend;
  };
  [key: string]: Record<string, unknown>; // Added to tell TypeScript that the key is a string
}