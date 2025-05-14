import { client } from "$lib/trpc";
import type { PageLoad } from "./$types";

export const load = (async () => {
    return {
        leaderboard: await client.stats.leaderboard.query(),
        userStats: await client.stats.userStats.query(),
        gameHistory: await client.stats.userGameHistory.query(),
        user: await client.user.get.query(),
    };
}) satisfies PageLoad;
