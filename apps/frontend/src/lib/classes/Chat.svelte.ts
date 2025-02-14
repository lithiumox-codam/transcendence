import { client } from "$lib/trpc";
import type { Message, Room } from "@repo/database";
import { SvelteMap } from "svelte/reactivity";

export class Chat {
    rooms = $state<Room[]>([]);
    messages = new SvelteMap<number, Message[]>();
    messagesContainer: HTMLElement | null = $state(null);
    selectedRoom: number | null = $state(null);

    constructor() {
        this.initialize();
    }

    private async initialize() {
        try {
            this.rooms = await client.chat.rooms.get.query();
            await Promise.all(
                this.rooms.map(async (room) => {
                    try {
                        const messages = $state(
                            await client.chat.messages.get.query({
                                roomId: room.id,
                            }),
                        );
                        this.messages.set(room.id, messages);
                    } catch (e) {
                        console.error(e);
                    }
                }),
            );
            this.listenRooms();
            this.listenMessages();
        } catch (e) {
            console.error(e);
        }
    }

    private async listenRooms(): Promise<void> {
        client.chat.rooms.listen.subscribe(undefined, {
            onData: ({ data }) => {
                switch (data.type) {
                    case "add":
                        this.rooms.unshift(data.room);
                        break;
                    case "remove":
                        this.rooms = this.rooms.filter(
                            (r) => r.id !== data.room.id,
                        );
                        break;
                }
            },
        });
    }

    private async listenMessages(): Promise<void> {
        client.chat.messages.listen.subscribe(undefined, {
            onData: ({ data }) => {
                const messages = this.messages.get(data.message.roomId) ?? [];
                switch (data.type) {
                    case "new":
                        {
                            messages.push(data.message);
                            if (this.selectedRoom === data.message.roomId)
                                this.scrollDown();
                        }
                        break;
                }
            },
        });
    }

    private async scrollDown() {
        if (this.messagesContainer) {
            this.messagesContainer.scroll({
                top: this.messagesContainer.scrollHeight,
                behavior: "smooth",
            });
        }
    }
}
