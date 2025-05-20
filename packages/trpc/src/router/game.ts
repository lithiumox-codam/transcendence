import {
    type Game,
    type User,
    db,
    games,
    message,
    players,
    tournamentPlayers,
    tournaments,
    users,
} from "@repo/database";
import { and, desc, eq, not } from "drizzle-orm";
import { late, z } from "zod";
import { emitter } from "../events/index.ts";
import { Matchmaking } from "../matchmaking.ts";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "../trpc.ts";

const matchmaking = Matchmaking.getInstance();

export const gameRouter = createTRPCRouter({
    details: protectedProcedure.input(z.number()).query(async ({ input }) => {
        try {
            const [gameDetails] = await db
                .select()
                .from(games)
                .where(eq(games.id, input))
                .limit(1);
            if (!gameDetails) {
                return null;
            }

            const playersDetails = await db
                .select({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    createdAt: users.createdAt,
                    avatar: users.avatar,
                    oAuthProvider: users.oAuthProvider,
                    score: players.score,
                })
                .from(players)
                .where(eq(players.gameId, input))
                .innerJoin(users, eq(players.userId, users.id));

            return {
                game: gameDetails,
                players: playersDetails,
            };
        } catch (e) {
            console.error("Error fetching game details:", e);
            return null;
        }
    }),
    queue: protectedProcedure
        .input(z.union([z.literal(2), z.literal(4), z.literal(8)]))
        .query(async ({ ctx, input }) => {
            matchmaking.joinQueue(ctx.user.id, input);
            return true;
        }),
    leaveQueue: protectedProcedure.mutation(async ({ ctx }) => {
        matchmaking.leaveQueue(ctx.user.id);
        return true;
    }),
    sendInvite: protectedProcedure
        .input(z.number())
        .mutation(async ({ input, ctx }) => {
            const matchId = await matchmaking.createPrivateGame(ctx.user.id);

            const [msg] = await db
                .insert(message)
                .values({
                    senderId: ctx.user.id,
                    receiverId: input,
                    content: `invite://${matchId}`,
                })
                .returning();
            if (msg) emitter.emit("chat:message", msg);
        }),
    acceptInvite: protectedProcedure
        .input(z.number())
        .mutation(async ({ ctx, input }) => {
            matchmaking.acceptInvite(input, ctx.user.id);
        }),
    sendInput: protectedProcedure
        .input(
            z.object({
                gameId: z.number(),
                key: z.union([
                    z.literal("up"),
                    z.literal("down"),
                    z.literal("none"),
                ]),
            }),
        )
        .mutation(({ input, ctx }) => {
            const game = matchmaking.gamesMap.get(input.gameId);
            if (!game) {
				return ;
            }
            if (
                !game
                    .getState()
                    .players.some((player) => player.id === ctx.user.id)
            ) {
                console.log(
                    "Player not found",
                    ctx.user.id,
                    game.getState().players,
                );
                throw new Error("Player not found");
            }
            // game.testWithPlayerInput(input.key); // ONLY FOR TESTING
            game.setPlayerInput(ctx.user.id, input.key);
        }),
    state: publicProcedure.input(z.number()).query(async ({ input }) => {
        const game = matchmaking.gamesMap.get(input);
        if (!game) {
            throw new Error("Game not found");
        }
        emitter.emit("game:state", game.getState());
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
    tournamentPlayer: protectedProcedure
        .input(z.number())
        .query(async ({ input, ctx }) => {
            const [tournament] = await db
                .select({
                    id: games.tournamentId,
                })
                .from(games)
                .where(eq(games.id, input))
                .limit(1);

            if (!tournament?.id) {
                return null;
            }

            const [player] = await db
                .select({
                    score: tournamentPlayers.score,
                })
                .from(tournamentPlayers)
                .where(
                    and(
                        eq(tournamentPlayers.userId, ctx.user.id),
                        eq(tournamentPlayers.tournamentId, tournament.id),
                    ),
                )
                .limit(1);

            return player;
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
                            const [playerData] = await db
                                .select({
                                    id: users.id,
                                    name: users.name,
                                    email: users.email,
                                    createdAt: users.createdAt,
                                    avatar: users.avatar,
                                    oAuthProvider: users.oAuthProvider,
                                    score: players.score, // Add score here
                                })
                                .from(users)
                                .innerJoin(
                                    players,
                                    and(
                                        eq(users.id, players.userId),
                                        eq(players.gameId, games.id),
                                    ),
                                ) // Join players table
                                .where(eq(users.id, userId)); // Filter by userId
                            return playerData;
                        }),
                    );
                    // Filter out any potential undefined results if a user wasn't found (though unlikely with inner join)
                    const validPlayersData = playersData.filter(
                        (p) => p !== undefined,
                    );
                    return { game: games, players: validPlayersData };
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
                        avatar: users.avatar,
                        oAuthProvider: users.oAuthProvider,
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
    queueListen: protectedProcedure.subscription(({ ctx }) =>
        emitter.subscribeDomain("queue", ({ type, data }) => {
            if (type === "players") return true;
            if (type === "newMatch") return data.userId === ctx.user.id;
            return false;
        }),
    ),
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
