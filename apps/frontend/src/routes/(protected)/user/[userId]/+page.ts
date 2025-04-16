import { goto } from "$app/navigation";
import { client } from "$lib/trpc";
import type { PageLoad } from "./$types";

export const load = (async ({ params }) => {
    const [self] = await client.user.get.query();

    if (self.id === Number(params.userId)) goto("/stats");

    const userId = Number(params.userId);
    return {
        user: await client.user.getById.query(Number(userId)),
        userStats: await client.stats.userStats.query(userId),
        gameHistory: await client.stats.userGameHistory.query(userId),
        isBlocked: await client.block.isBlocked.query(userId),
    };
}) satisfies PageLoad;
