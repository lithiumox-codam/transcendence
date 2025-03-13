import { client } from "$lib/trpc";
import type { PageLoad } from "./$types";

export const load = (async ({ params }) => {
    return {
        user: await client.user.getById.query(Number(params.userId)),
    };
}) satisfies PageLoad;
