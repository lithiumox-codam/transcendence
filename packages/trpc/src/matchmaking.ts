import {
    type User,
    db,
    games,
    players,
    tournamentPlayers,
    tournaments,
    users,
} from "@repo/database";
import { GameEngine, GameStatus } from "@repo/game";
import { and, eq, sql } from "drizzle-orm";
import { emitter } from "./events/index.ts";

type queuedPlayer = {
    id: number;
    gameType: 2 | 4 | 8;
};

export class Matchmaking {
    private static instance: Matchmaking;
    private queuedPlayers: queuedPlayer[] = [];
    private queuedTournamentPlayers = new Map<
        number,
        { playerId: number; score: number }[]
    >();
    public gamesMap = new Map<number, GameEngine>();

    public static getInstance(): Matchmaking {
        if (!Matchmaking.instance) {
            Matchmaking.instance = new Matchmaking();
        }
        return Matchmaking.instance;
    }

    private constructor() {
        this.gamesMap = new Map<number, GameEngine>();

        this.updateGames();
    }

    public async createGame(
        playerIds: number[],
        maxPlayers: 2 | 4,
        tournamentId?: number,
    ): Promise<number> {
        try {
            // Create the game
            const [game] = await db
                .insert(games)
                .values({
                    status: "waiting",
                    maxPlayers,
                    tournamentId,
                })
                .returning();
            if (!game) throw new Error("Failed to create game");

            // Add all players to the game
            const playerInserts = playerIds.map((userId) => ({
                gameId: game.id,
                userId,
            }));

            const gamePlayers = await db
                .insert(players)
                .values(playerInserts)
                .returning();

            if (!gamePlayers || gamePlayers.length === 0)
                throw new Error("Failed to add players to game");

            // Initialize game engine with all players
            const gameInstance = new GameEngine(
                maxPlayers,
                playerIds,
                tournamentId,
            );
            this.gamesMap.set(game.id, gameInstance);

            for (const player of playerInserts)
                emitter.emit("queue:newMatch", player);

            await db
                .update(games)
                .set({ status: "playing" })
                .where(eq(games.id, game.id));

            gameInstance.start();

            return game.id;
        } catch (error) {
            console.error("Error creating game:", error);
            throw new Error("Failed to create game");
        }
    }

    private async removeGame(gameId: number, game: GameEngine): Promise<void> {
        try {
            await db
                .update(games)
                .set({ status: "finished" })
                .where(eq(games.id, gameId));

            for (const player of game.getState().players) {
                await db
                    .update(players)
                    .set({ score: player.score })
                    .where(
                        and(
                            eq(players.userId, player.id),
                            eq(players.gameId, gameId),
                        ),
                    );
            }

            this.gamesMap.delete(gameId);

            const tournamentId = game.getTournamentId();
            if (tournamentId) {
                const winnerId = game.getState().winner;
                if (winnerId) {
                    const [winner] = await db
                        .update(tournamentPlayers)
                        .set({
                            score: sql`${tournamentPlayers.score} + 1`,
                        })
                        .where(
                            and(
                                eq(tournamentPlayers.userId, winnerId),
                                eq(
                                    tournamentPlayers.tournamentId,
                                    tournamentId,
                                ),
                            ),
                        )
                        .returning();

                    if (!winner) {
                        console.error("Failed to update tournament player");
                        throw new Error("Failed to update tournament player");
                    }

                    if (winner.score === 3) {
                        await db
                            .update(tournaments)
                            .set({ status: "finished", winnerId })
                            .where(eq(tournaments.id, tournamentId));
                    } else {
                        this.joinTournamentQueue(
                            winnerId,
                            winner.score,
                            tournamentId,
                        );
                    }
                }
            }
        } catch (error) {
            console.error("Error removing game:", error);
        }
    }

    public async createTournament(playerIds: number[]): Promise<number> {
        try {
            // Create the tournament
            const [tournament] = await db
                .insert(tournaments)
                .values({ status: "waiting" })
                .returning();
            if (!tournament) throw new Error("Failed to create tournament");

            // Add all players to the tournament
            const playerInserts = playerIds.map((userId) => ({
                tournamentId: tournament.id,
                userId,
            }));

            const tournamentGamePlayers = await db
                .insert(tournamentPlayers)
                .values(playerInserts)
                .returning();

            if (!tournamentGamePlayers || tournamentGamePlayers.length === 0)
                throw new Error("Failed to add players to tournament");

            // Create a game for every pair of players
            for (let i = 0; i < playerIds.length; i += 2) {
                const gameId = await this.createGame(
                    playerIds.slice(i, i + 2),
                    2,
                    tournament.id,
                );
            }

            await db
                .update(tournaments)
                .set({ status: "playing" })
                .where(eq(tournaments.id, tournament.id));

            return tournament.id;
        } catch (error) {
            console.error("Error creating tournament:", error);
            throw new Error("Failed to create tournament");
        }
    }

    public async matchmake(): Promise<void> {
        const gameTypes: (2 | 4 | 8)[] = [2, 4, 8];
        for (const gameType of gameTypes) {
            const playersOfType = this.queuedPlayers.filter(
                (player) => player.gameType === gameType,
            );

            // If there are enough players, create a game
            if (playersOfType.length >= gameType) {
                const playerIds = playersOfType
                    .slice(0, gameType)
                    .map((player) => player.id);
                if (gameType === 8) await this.createTournament(playerIds);
                else await this.createGame(playerIds, gameType);

                // Remove the matched players from the queue
                this.queuedPlayers = this.queuedPlayers.filter(
                    (player) => !playerIds.includes(player.id),
                );
                this.emitQueuedPlayers();
            }
        }
    }

    public async joinQueue(
        playerId: number,
        gameType: 2 | 4 | 8,
    ): Promise<void> {
        // Check if the player is already in a game
        const playerInGame = Array.from(this.gamesMap.values()).some((game) =>
            game.getState().players.some((player) => player.id === playerId),
        );
        if (playerInGame) {
            for (const [id, game] of this.gamesMap.entries()) {
                if (
                    game
                        .getState()
                        .players.some((player) => player.id === playerId)
                ) {
                    if (game.getState().status === "waiting") {
                        this.gamesMap.delete(id);
                        await db
                            .delete(players)
                            .where(
                                and(
                                    eq(players.userId, playerId),
                                    eq(players.gameId, id),
                                ),
                            );
                        await db.delete(games).where(eq(games.id, id));
                        console.log("Killed their shitty game!");
                    }
                }
            }
        }

        const player = this.queuedPlayers.find((p) => p.id === playerId);
        if (player) {
            player.gameType = gameType;
            this.emitQueuedPlayers();

            console.log(
                "Player already in queue, updating game type to",
                gameType,
            );
            return;
        }

        console.log("Adding player to queue", playerId, gameType);
        this.queuedPlayers.push({ id: playerId, gameType });
        this.emitQueuedPlayers();
        await this.matchmake();
    }

    private async joinTournamentQueue(
        playerId: number,
        score: number,
        tournamentId: number,
    ): Promise<void> {
        const tournamentPlayers =
            this.queuedTournamentPlayers.get(tournamentId);
        if (!tournamentPlayers) {
            this.queuedTournamentPlayers.set(tournamentId, [
                { playerId, score },
            ]);
        } else {
            tournamentPlayers.push({ playerId, score });
        }

        for (const [
            tournamentId,
            players,
        ] of this.queuedTournamentPlayers.entries()) {
            // Get player with same score
            const dual = players.filter((player) => player.score === score);

            if (dual.length === 2) {
                await this.createGame(
                    dual.map((player) => player.playerId),
                    2,
                    tournamentId,
                );

                // remove dual players from queue
                this.queuedTournamentPlayers.set(
                    tournamentId,
                    players.filter((player) => player.score !== score),
                );
            }
        }
    }

    private async emitQueuedPlayers(): Promise<void> {
        const playerList: User[] = [];
        Promise.all(
            this.queuedPlayers.map(async (player) => {
                const [user] = await db
                    .select({
                        id: users.id,
                        name: users.name,
                        email: users.email,
                        createdAt: users.createdAt,
                        oAuthProvider: users.oAuthProvider,
                        avatar: users.avatar,
                    })
                    .from(users)
                    .where(eq(users.id, player.id));
                if (user) {
                    playerList.push(user);
                }
            }),
        ).then(() => {
            emitter.emit("queue:players", playerList);
        });
    }

    public async leaveQueue(playerId: number): Promise<void> {
        this.queuedPlayers = this.queuedPlayers.filter(
            (player) => player.id !== playerId,
        );
        this.emitQueuedPlayers();
    }

    public async createPrivateGame(playerId: number): Promise<number> {
        try {
            // Check if the player is already in a game on their own if so delete it
            const playerInGame = Array.from(this.gamesMap.values()).some(
                (game) =>
                    game
                        .getState()
                        .players.some((player) => player.id === playerId),
            );
            if (playerInGame) {
                for (const [id, game] of this.gamesMap.entries()) {
                    if (
                        game
                            .getState()
                            .players.some((player) => player.id === playerId)
                    ) {
                        if (game.getState().status === "waiting") {
                            this.gamesMap.delete(id);
                            await db
                                .delete(players)
                                .where(
                                    and(
                                        eq(players.userId, playerId),
                                        eq(players.gameId, id),
                                    ),
                                );
                            await db.delete(games).where(eq(games.id, id));
                            console.log("Killed their shitty game!");
                        }
                    }
                }
            }

            // Create the game
            const [game] = await db
                .insert(games)
                .values({
                    status: "waiting",
                    maxPlayers: 2,
                    private: 1,
                })
                .returning();
            if (!game) throw new Error("Failed to create private game");

            await db.insert(players).values({
                gameId: game.id,
                userId: playerId,
            });

            // Initialize game engine with all players
            const gameInstance = new GameEngine(2, [playerId]);
            this.gamesMap.set(game.id, gameInstance);

            // Note: Unlike createGame, we don't emit 'queue:newMatch' or start the game immediately.
            // The game status remains 'waiting'.

            return game.id;
        } catch (error) {
            console.error("Error creating private game:", error);
            // Clean up potentially created game entry if players failed to insert? (Consider transaction)
            throw new Error("Failed to create private game");
        }
    }

    public async acceptInvite(gameId: number, playerId: number): Promise<void> {
        try {
            const [game] = await db
                .select()
                .from(games)
                .where(eq(games.id, gameId))
                .limit(1);
            if (!game) throw new Error("Game not found");

            const [player] = await db
                .insert(players)
                .values({
                    gameId: game.id,
                    userId: playerId,
                })
                .returning();

            if (!player) throw new Error("Failed to add player to game");

            const gameInstance = this.gamesMap.get(game.id);
            if (!gameInstance) {
                throw new Error("Game instance not found");
            }

            // Add the player to the game instance
            gameInstance.addPlayer(playerId);
            // Emit event for both the players
            for (const player of gameInstance.getState().players) {
                emitter.emit("queue:newMatch", {
                    userId: player.id,
                    gameId: game.id,
                });
                console.log("Emitting new match event for player", player.id);
            }

            // Start the game immediately after accepting the invite
            gameInstance.start();
        } catch (error) {
            console.error("Error accepting invite:", error);
        }
    }

    /* Update game 60 times per second */
    private async updateGames() {
        const tickRate = 1000 / 240;
        const delay = (ms: number) =>
            new Promise((resolve) => setTimeout(resolve, ms));

        while (true) {
            for (const [gameId, game] of this.gamesMap.entries()) {
                game.update(1 / 240);

                // Remove game from map if finished
                if (game.getState().status === "finished") {
                    await this.removeGame(gameId, game);
                }
            }
            await delay(tickRate);
        }
    }
}
