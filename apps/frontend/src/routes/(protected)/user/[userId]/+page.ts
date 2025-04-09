import { client } from "$lib/trpc";
import type { PageLoad } from "./$types";

export const load = (async ({ params }) => {
    const userId = Number(params.userId);
    return {
        user: await client.user.getById.query(Number(userId)),
        userStats: await client.stats.userStats.query(userId),
        gameHistory: await client.stats.userGameHistory.query(userId),
    };
}) satisfies PageLoad;
