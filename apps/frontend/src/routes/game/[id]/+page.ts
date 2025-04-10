import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load = (async ({ params }) => {
    // if the game id is not a valid integer, redirect to 404
    const gameId = Number.parseInt(params.id);
    if (Number.isNaN(gameId)) throw error(404, "Game not found");

    return {
        id: gameId,
    };
}) satisfies PageLoad;
