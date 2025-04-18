import { type User, db, games, players, users } from "@repo/database";
import { GameEngine } from "@repo/game";
import { eq } from "drizzle-orm";
import { emitter } from "./events/index.ts";

type queuedPlayer = {
    id: number;
    gameType: 2 | 4;
};

export class Matchmaking {
    private static instance: Matchmaking;
    private queuedPlayers: queuedPlayer[] = [];
    public gamesMap = new Map<number, GameEngine>();

    public static getInstance(): Matchmaking {
        if (!Matchmaking.instance) {
            Matchmaking.instance = new Matchmaking();
        }
        return Matchmaking.instance;
    }

    private constructor() {
        this.gamesMap = new Map<number, GameEngine>();
    }

    public async createGame(
        playerIds: number[],
        maxPlayers: 2 | 4,
    ): Promise<number> {
        try {
            // Create the game
            const [game] = await db
                .insert(games)
                .values({
                    status: "waiting",
                    maxPlayers,
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
            const gameInstance = new GameEngine(maxPlayers, playerIds);
            this.gamesMap.set(game.id, gameInstance);

            for (const player of playerInserts)
                emitter.emit("queue:newMatch", player);

            await db
                .update(games)
                .set({ status: "playing" })
                .where(eq(games.id, game.id));

            gameInstance.startGame();

            return game.id;
        } catch (error) {
            console.error("Error creating game:", error);
            throw new Error("Failed to create game");
        }
    }

    public async matchmake(): Promise<void> {
        const gameTypes: (2 | 4)[] = [2, 4];
        for (const gameType of gameTypes) {
            const playersOfType = this.queuedPlayers.filter(
                (player) => player.gameType === gameType,
            );

            // If there are enough players, create a game
            if (playersOfType.length >= gameType) {
                const playerIds = playersOfType
                    .slice(0, gameType)
                    .map((player) => player.id);
                await this.createGame(playerIds, gameType);

                // Remove the matched players from the queue
                this.queuedPlayers = this.queuedPlayers.filter(
                    (player) => !playerIds.includes(player.id),
                );
                this.emitQueuedPlayers();
            }
        }
    }

    public async joinQueue(playerId: number, gameType: 2 | 4): Promise<void> {
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

            const gameInstance = new GameEngine(2, [playerId]);
            this.gamesMap.set(game.id, gameInstance);

            // Note: Unlike createGame, we don't emit 'queue:newMatch' or start the game immediately.
            // The game status remains 'waiting'.

            return game.id;
        } catch (error) {
            console.error("Error creating private game:", error);
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

            if (!game) throw new Error(`Game not found: ${gameId}`);
            if (game.status !== "waiting") {
                const existingInstance = this.gamesMap.get(gameId);
                if (existingInstance) {
                    emitter.emit("queue:newMatch", {
                        userId: playerId,
                        gameId: game.id,
                    });
                }
                return;
            }

            if (!game.private) {
                throw new Error(`Game ${gameId} is not private.`);
            }

            const existingPlayers = await db
                .select({ userId: players.userId })
                .from(players)
                .where(eq(players.gameId, gameId));

            const isAlreadyInGame = existingPlayers.some(
                (p) => p.userId === playerId,
            );

            if (!isAlreadyInGame && existingPlayers.length >= game.maxPlayers) {
                throw new Error(`Game ${gameId} is already full.`);
            }

            let playerAddedNow = false;
            if (!isAlreadyInGame) {
                const [newPlayerEntry] = await db
                    .insert(players)
                    .values({ gameId: game.id, userId: playerId })
                    .returning();
                if (!newPlayerEntry)
                    throw new Error(
                        `Failed to add player ${playerId} to game ${gameId}`,
                    );
                playerAddedNow = true;
                console.log(
                    `Player ${playerId} added to game ${gameId} in DB.`,
                );
            } else {
                console.warn(
                    `Player ${playerId} is already in game ${gameId}, ensuring game state.`,
                );
            }

            const finalPlayerIds = playerAddedNow
                ? [...existingPlayers.map((p) => p.userId), playerId]
                : existingPlayers.map((p) => p.userId);

            let gameInstance = this.gamesMap.get(gameId);

            if (!gameInstance) {
                // Instance lost or never created (e.g., server restart) - Recreate/Recover
                console.log(
                    `Game instance for ${gameId} not found in map. Recreating with players: ${finalPlayerIds.join(", ")}.`,
                );
                gameInstance = new GameEngine(
                    game.maxPlayers as 2 | 4,
                    finalPlayerIds,
                );
                if (!gameInstance)
                    throw new Error(
                        "Failed to create game instance on recovery",
                    );
                this.gamesMap.set(gameId, gameInstance);
            } else if (playerAddedNow) {
                // Instance exists, ensure the newly added player is known to the engine
                console.log(
                    `Adding player ${playerId} to existing game instance ${gameId}.`,
                );
                gameInstance.addPlayer(playerId); // Assuming GameEngine handles adding logic
            }

            // 6. Check if game is full and ready to start
            if (finalPlayerIds.length === game.maxPlayers) {
                console.log(
                    `Game ${gameId} is now full with players: ${finalPlayerIds.join(", ")}. Starting game.`,
                );
                // Update Game Status in DB
                await db
                    .update(games)
                    .set({ status: "playing" })
                    .where(eq(games.id, game.id));

                // Emit Match Event for all players
                for (const pId of finalPlayerIds) {
                    emitter.emit("queue:newMatch", {
                        userId: pId,
                        gameId: game.id,
                    });
                }

                // Start the Game Logic
                gameInstance.startGame();
            } else {
                console.log(
                    `Game ${gameId} is not full yet. Current players: ${finalPlayerIds.join(
                        ", ",
                    )}. Waiting for more players.`,
                );
            }
        } catch (error) {
            console.error(
                `Error accepting invite for game ${gameId}, player ${playerId}:`,
                error,
            );
            throw new Error(
                `Failed to accept invite for game ${gameId}: ${error}`,
            );
        }
    }
}
