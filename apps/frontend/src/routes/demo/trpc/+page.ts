import { browser } from "$app/environment";
import { client } from "$lib/trpc";
import type { PageLoad } from "./$types";

export const load = (async () => {
    if (!browser) return;
    const random = Math.random();
    const user = await client.createUser.mutate({ name: random.toString() });
    const createdUser = await client.getUserById.query(user.lastInsertRowid);
    return { user, createdUser };
}) satisfies PageLoad;
