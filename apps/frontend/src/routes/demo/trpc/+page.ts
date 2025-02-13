import { browser } from "$app/environment";
import { client } from "$lib/trpc";
import type { PageLoad } from "./$types";

export const load = (async () => {
    try {
        const user = await client.user.get.query();
        const allusers = await client.user.all.query();
        return { user, allusers };
    } catch (error) {
        console.log(error);
    }
}) satisfies PageLoad;
