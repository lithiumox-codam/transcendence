import { client } from "$lib/trpc";
import type { Game, User } from "@repo/database";
import type { UserClass } from "./User.svelte";

export class GameClass {
    history = $state<{ game: Game; players: User[] }[]>([]);

    constructor(userClass: UserClass) {
        this.init();
        this.history = [];
        $inspect(this.history, "history");
    }

    async init() {}
}
