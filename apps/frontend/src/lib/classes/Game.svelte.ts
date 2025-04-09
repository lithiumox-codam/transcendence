import { client } from "$lib/trpc";
import type { Game, User } from "@repo/database";
import type { UserClass } from "./User.svelte";

export class GameClass {
    history: { game: Game; players: User[] }[];

    constructor(userClass: UserClass) {
        this.init();
        this.history = $state([]);
        this.listenOngoing();
        $inspect(this.ongoing, "ongoing");
        $inspect(this.history, "history");
    }

    async init() {}

    async listenOngoing() {
        client.game.ongoing.subscribe(undefined, {
            onData: async (games) => {
                console.log("Ongoing games", games);
                this.ongoing = games;
            },
        });
    }
}
