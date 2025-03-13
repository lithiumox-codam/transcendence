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
import type { GameState } from "@repo/game";
import { GameEngine, playerInputs } from "@repo/game";
import { observable } from "@trpc/server/observable";
import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "../trpc.ts";
import { TypedEventEmitter } from "../utils.ts";

interface GameEvents {
    "game.created": Game;
    "game.state": GameState;
}

const events = new TypedEventEmitter<GameEvents>();
const gamesMap = new Map<number, GameEngine>();

export const gameRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.union([z.literal(2), z.literal(4)]))
        .mutation(async ({ ctx, input }) => {
            const [game] = await db
                .insert(games)
                .values({ maxPlayers: input })
                .returning();
            if (game) {
                await db.insert(players).values({
                    gameId: game.id,
                    userId: ctx.user.id,
                });
                events.emit("game.created", game);
                gamesMap.set(game.id, new GameEngine(input));
                return game.id;
            }
            return null;
        }),
    listen: protectedProcedure.subscription(async function* ({ ctx }) {
        for await (const game of events.stream("game")) {
            yield game;
        }
    }),
    join: protectedProcedure
        .input(z.number())
        .mutation(async ({ ctx, input }) => {
            const game = gamesMap.get(input);
            if (!game) {
                throw new Error("Game not found");
            }
            const [player] = await db
                .insert(players)
                .values({
                    gameId: input,
                    userId: ctx.user.id,
                })
                .returning();
            if (!player) {
                throw new Error("Failed to join game");
            }
            game.addPlayer(player.userId);
        }),
    sendInput: protectedProcedure
        .input(
            z.object({
                gameId: z.number(),
                playerId: z.number(),
                input: z.number(),
            }),
        )
        .mutation(({ input }) => {
            const game = gamesMap.get(input.gameId);
            if (!game) {
                throw new Error("Game not found");
            }
            game.setPlayerInput(input.playerId, input.input);
        }),
    state: publicProcedure.input(z.number()).query(async ({ input }) => {
        const game = gamesMap.get(input);
        if (!game) {
            throw new Error("Game not found");
        }
        events.emit("game.state", game.getState());
    }),
    reset: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
        const game = gamesMap.get(input);
        if (!game) {
            throw new Error("Game not found");
        }
        game.reset();
    }),
});
