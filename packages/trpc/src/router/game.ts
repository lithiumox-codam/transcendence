import {
    type Game,
    GameInsert,
    type Player,
    PlayerInsert,
    db,
    gameInsertSchema,
    games,
    players,
} from "@repo/database";
import type { GameState, PlayerIputs } from "@repo/game";
import { GameEngine } from "@repo/game";
import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "../trpc.ts";
import { TypedEventEmitter } from "../utils.ts";

interface GameEvents {
    "game.created": Game;
    "game.update": GameState;
}

const events = new TypedEventEmitter<GameEvents>();
const gamesMap = new Map<number, GameEngine>();

export const gameRouter = createTRPCRouter({
    create: protectedProcedure
        .input(gameInsertSchema)
        .mutation(async ({ ctx, input }) => {
            const game = await db.insert(games).values(input).returning();
            if (game.length > 0 && game[0]) {
                await db.insert(players).values({
                    gameId: game[0].id,
                    userId: ctx.user.id,
                });
                events.emit("game.created", game[0]);
                gamesMap.set(game[0].id, new GameEngine());
            }
        }),
    listen: protectedProcedure.subscription(async function* ({ ctx }) {
        for await (const game of events.stream("game")) {
            yield game;
        }
    }),
});
