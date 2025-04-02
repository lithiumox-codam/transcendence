import { client } from "$lib/trpc";
import type { Game, User } from "@repo/database";
import { SvelteMap } from "svelte/reactivity";
import type { UserClass } from "./User.svelte";

export class GameClass {
    ongoing: SvelteMap<number, { game: Game; players: User[] }>;
    history: SvelteMap<number, { game: Game; players: User[] }>;

    constructor(userClass: UserClass) {
        this.init();
        this.ongoing = new SvelteMap();
        this.history = new SvelteMap();
        this.listenOngoing();
        $inspect(this.ongoing, "ongoing");
        $inspect(this.history, "history");
    }

    async init() {
        const history = await client.game.history.query();
        for (const data of history) {
            this.history.set(data.game.id, {
                game: data.game,
                players: data.players,
            });
        }
    }

    async listenOngoing() {
        client.game.ongoing.subscribe(undefined, {
            onData: async (games) => {
                for (const game of games) {
                    const players = await client.game.players.query(game.id);
                    this.ongoing.set(game.id, { game, players });
                }
            },
        });
    }
}
