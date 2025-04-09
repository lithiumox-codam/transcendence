import {
    type Game,
    type User,
    db,
    games,
    players,
    users,
} from "@repo/database";
import type { GameState } from "@repo/game";
import { GameEngine, Matchmaking, playerInputs } from "@repo/game";
import { observable } from "@trpc/server/observable";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { emitter } from "../events/index.ts";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "../trpc.ts";

const matchmaking = Matchmaking.getInstance();

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
                matchmaking.gamesMap.set(
                    game.id,
                    new GameEngine(input, [ctx.user.id]),
                );
                const [gamedb] = await db
                    .select()
                    .from(games)
                    .where(eq(games.id, game.id))
                    .innerJoin(players, eq(games.id, players.gameId));
                return { gameId: game.id, players: gamedb?.players };
            }
            return null;
        }),
    queue: protectedProcedure
        .input(z.union([z.literal(2), z.literal(4)]))
        .query(async ({ ctx, input }) => {
            matchmaking.joinQueue(ctx.user.id, input);
            return true;
        }),
    start: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
        const game = matchmaking.gamesMap.get(input);
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
            const game = matchmaking.gamesMap.get(input.gameId);
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
        const game = matchmaking.gamesMap.get(input);
        if (!game) {
            throw new Error("Game not found");
        }
        emitter.emit("game:state", game.getState());
    }),
    reset: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
        const game = matchmaking.gamesMap.get(input);
        if (!game) {
            throw new Error("Game not found");
        }
        game.reset();
    }),
    players: protectedProcedure.input(z.number()).query(async ({ input }) => {
        const res = await db
            .select()
            .from(players)
            .where(eq(players.gameId, input));
        const list = await Promise.all(
            res.map(async ({ userId }) => {
                const [user] = await db
                    .select({
                        id: users.id,
                        name: users.name,
                        email: users.email,
                        createdAt: users.createdAt,
                    })
                    .from(users)
                    .where(eq(users.id, userId));
                return user;
            }),
        );
        return list;
    }),
    history: protectedProcedure
        .input(z.number().optional())
        .query(async ({ input, ctx }) => {
            const id = input === undefined ? ctx.user.id : input;
            const res = await db
                .select()
                .from(games)
                .where(
                    and(
                        eq(games.status, "finished"),
                        eq(players.userId, id),
                        eq(games.id, players.gameId),
                    ),
                )
                .innerJoin(players, eq(games.id, players.gameId))
                .orderBy(desc(games.createdAt))
                .limit(10);
            const list = await Promise.all(
                res.map(async ({ games }) => {
                    const playersList = await db
                        .select()
                        .from(players)
                        .where(eq(players.gameId, games.id));
                    const playersData = await Promise.all(
                        playersList.map(async ({ userId }) => {
                            const [user] = await db
                                .select({
                                    id: users.id,
                                    name: users.name,
                                    email: users.email,
                                    createdAt: users.createdAt,
                                })
                                .from(users)
                                .where(eq(users.id, userId));
                            return user;
                        }),
                    );
                    return { game: games, players: playersData };
                }),
            );
            return list;
        }),
    ongoing: protectedProcedure.subscription(async function* () {
        while (true) {
            const ongoingWithPlayers = await db
                .select({
                    game: games,
                    players: {
                        id: users.id,
                        name: users.name,
                        email: users.email,
                        createdAt: users.createdAt,
                    },
                })
                .from(games)
                .where(eq(games.status, "playing"))
                .innerJoin(players, eq(games.id, players.gameId))
                .innerJoin(users, eq(players.userId, users.id))
                .orderBy(desc(games.updatedAt))
                .limit(3);
            const groupedGames = ongoingWithPlayers.reduce(
                (acc: { game: Game; players: User[] }[], curr) => {
                    const existingGame = acc.find(
                        (item) => item.game.id === curr.game.id,
                    );

                    if (existingGame) {
                        existingGame.players = [
                            ...existingGame.players,
                            curr.players,
                        ];
                    } else {
                        acc.push({ game: curr.game, players: [curr.players] });
                    }

                    return acc;
                },
                [],
            );

            yield groupedGames;
            await new Promise((resolve) => setTimeout(resolve, 200000));
        }
    }),
    listen: protectedProcedure.input(z.number()).subscription(async function* ({
        input,
    }) {
        const game = matchmaking.gamesMap.get(input);
        if (!game) {
            throw new Error("Game not found");
        }
        while (true) {
            yield game.getState();
            await new Promise((resolve) => setTimeout(resolve, 1000 / 120));
        }
    }),
});
