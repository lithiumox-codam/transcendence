import { client } from "$lib/trpc";
import type { PageLoad } from "./$types";

export const load = (async ({ params }) => {
    const user = await client.user.getById.query(Number(params.userId));
    return {
        user: user[0],
        friends: await client.user.friends.list.query(),
        requestsOut: await client.user.friends.listRequests.query(),
        requestsIn: await client.user.friends.listSentRequests.query(),
    };
}) satisfies PageLoad;
