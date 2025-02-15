import type { Message } from "@repo/database";
import { SvelteMap } from "svelte/reactivity";

export class Chat {
    // Map of messages from other users indexed by their user ID
    messages = new SvelteMap<number, Message[]>();

    // Add a new message from a specific sender
    addMessage(senderId: number, message: Message): void {
        const msgs = this.messages.get(senderId) || [];
        msgs.push(message);
        this.messages.set(senderId, msgs);
    }
}
