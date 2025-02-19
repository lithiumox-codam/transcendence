import { goto } from "$app/navigation";
import { client } from "$lib/trpc";
import type { User } from "@repo/database";

export class UserClass {
    data = $state<User | null>(null);
    friends = $state<User[]>([]);
    isLoading = $state(true);

    constructor() {
        this.initialize();
    }

    async initialize() {
        try {
            const res = await client.user.get.query();
            if (!res) goto("/login");
            this.friends = await client.user.friends.list.query();

            this.data = res[0];
        } catch (e) {
            console.error(e);
        } finally {
            this.isLoading = false;
        }
    }
}
