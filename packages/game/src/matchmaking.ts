import type { GameEngine } from "@repo/game";
import { db, players } from "@repo/database";

export const gamesMap = new Map<number, GameEngine>();

export async function joinGame(gameId: number, userId: number) {
    const game = gamesMap.get(gameId);
    if (!game) {
        throw new Error("Game not found");
    }
    const [player] = await db
        .insert(players)
        .values({
            gameId,
            userId,
        })
        .returning();
    if (!player) {
        throw new Error("Failed to join game");
    }
    game.addPlayer(player.userId);
    return player;
}
