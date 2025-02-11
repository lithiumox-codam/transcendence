import { client } from "$lib/trpc";
import type { PageLoad } from "./$types";

export const load = (async () => {
    const userId = 1; // Replace with actual user id

    const memberships = await client.chat.rooms.get.query(userId);
    return { ...memberships };
}) satisfies PageLoad;
