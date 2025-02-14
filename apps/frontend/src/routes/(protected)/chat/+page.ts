import { client } from "$lib/trpc";
import type { PageLoad } from "./$types";

export const load = (async () => {
    const userId = 1; // Replace with actual user id

    const rooms = await client.chat.rooms.get.query();
    console.log(rooms);
    return { rooms };
}) satisfies PageLoad;
