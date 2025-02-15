import { client } from "$lib/trpc";
import type { PageLoad } from "./$types";

export const load = (async () => {
    return {
        user: await client.user.get.query(),
        friends: await client.user.friends.list.query(),
        
    };
}) satisfies PageLoad;
