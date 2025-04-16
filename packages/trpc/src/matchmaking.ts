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
        privateGame = false,
    ): Promise<number> {
        try {
            // Create the game
            const [game] = await db
                .insert(games)
                .values({
                    status: "waiting",
                    maxPlayers,
                    private: privateGame ? 1 : 0,
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

    public async createPrivateGame(playerIds: number[]): Promise<number> {
        const gameId = await this.createGame(playerIds, 2, true);
        return gameId;
    }
}
