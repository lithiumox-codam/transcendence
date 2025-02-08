import { browser } from "$app/environment";
import { client } from "$lib/trpc";
import type { PageLoad } from "./$types";

export const load = (async () => {
    if (!browser) return;
    const allusers = await client.user.all.query();
    return { allusers };
}) satisfies PageLoad;
