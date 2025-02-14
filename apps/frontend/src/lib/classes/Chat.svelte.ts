import { client } from "$lib/trpc";
import type { Message, Room } from "@repo/database";
import { SvelteMap } from "svelte/reactivity";

export class Chat {
    rooms = $state<Room[]>([]);
    messages = new SvelteMap<number, Message[]>();

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
                            await client.chat.messages.get.query(room.id),
                        );
                        console.log($state.snapshot(messages.length), "\n");
                        this.messages.set(room.id, messages);
                    } catch (e) {
                        console.error(e);
                    }
                }),
            );
            this.listenRooms();
        } catch (e) {
            console.error(e);
        }
    }

    async listenRooms(): Promise<void> {
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
}
