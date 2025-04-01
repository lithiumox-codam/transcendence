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
import { GameEngine, playerInputs, joinGame, gamesMap } from "@repo/game";
import { observable } from "@trpc/server/observable";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { emitter } from "../events/index.ts";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "../trpc.ts";

export const gameRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.union([z.literal(2), z.literal(4)]))
        .mutation(async ({ ctx, input }) => {
            const [game] = await db
                .insert(games)
                .values({ maxPlayers: input })
                .returning();
            if (game) {
                await db
                    .insert(players)
                    .values({
                        gameId: game.id,
                        userId: ctx.user.id,
                    })
                    .returning();
                emitter.emit("game:created", { game, players: [] });
                gamesMap.set(game.id, new GameEngine(input, ctx.user.id));
                const [gamedb] = await db
                    .select()
                    .from(games)
                    .where(eq(games.id, game.id))
                    .innerJoin(players, eq(games.id, players.gameId));
                return { gameId: game.id, players: gamedb?.players };
            }
            return null;
        }),
    join: protectedProcedure
        .input(z.number())
        .mutation(async ({ ctx, input }) => {
            joinGame(input, ctx.user.id);
        }),
    joinRandom: protectedProcedure.mutation(async ({ ctx }) => {
        const gameEntry = Array.from(gamesMap.entries()).find(([_, game]) =>
            game.canJoin(),
        );
        if (!gameEntry) {
            throw new Error("No games available");
        }
        const gameId = gameEntry[0];
        joinGame(gameId, ctx.user.id);
    }),
    start: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
        const game = gamesMap.get(input);
        if (!game) {
            throw new Error("Game not found");
        }
        game.startGame();
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
            if (
                !game
                    .getState()
                    .players.some((player) => player.id === input.playerId)
            ) {
                console.log(
                    "Player not found",
                    input.playerId,
                    game.getState().players,
                );
                throw new Error("Player not found");
            }
            game.testWithPlayerInput(input.input); // ONLY FOR TESTING
            // game.setPlayerInput(input.playerId, input.input); // UNCOMMENT THIS
        }),
    state: publicProcedure.input(z.number()).query(async ({ input }) => {
        const game = gamesMap.get(input);
        if (!game) {
            throw new Error("Game not found");
        }
        emitter.emit("game:state", game.getState());
    }),
    reset: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
        const game = gamesMap.get(input);
        if (!game) {
            throw new Error("Game not found");
        }
        game.reset();
    }),
    listen: protectedProcedure.input(z.number()).subscription(async function* ({
        input,
    }) {
        const game = gamesMap.get(input);
        if (!game) {
            throw new Error("Game not found");
        }
        while (true) {
            yield game.getState();
            await new Promise((resolve) => setTimeout(resolve, 1000 / 120));
        }
    }),
});
