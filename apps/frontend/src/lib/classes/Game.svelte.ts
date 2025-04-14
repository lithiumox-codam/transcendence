import { goto } from "$app/navigation";
import { client } from "$lib/trpc";
import type { Game, User } from "@repo/database/types";

export class GameClass {
    history = $state<{ game: Game; players: User[] }[]>([]);
    queue = $state<User[]>([]);

    constructor() {
        this.init();
        this.history = [];
        this.queue = [];
        $inspect(this.queue);
    }

    async init() {
        this.listenQueue();
    }

    async listenQueue() {
        console.log("Listening to queue...");
        client.game.queueListen.subscribe(undefined, {
            onData: ({ type, data }) => {
                if (type === "newMatch") {
                    goto(`/game/${data.gameId}`);
                } else if (type === "players") {
                    console.log("Queue data received:", data);
                    this.queue = data;
                }
            },
            onError: (error) => {
                console.error("Error in queue subscription:", error);
            },
        });
    }
}
