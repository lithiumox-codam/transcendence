import { browser } from "$app/environment";
import { client } from "$lib/trpc";
import type { PageLoad } from "./$types";

export const load = (async () => {
    return {
        allusers: await client.user.all.query(),
    };
}) satisfies PageLoad;
