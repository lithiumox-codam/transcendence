<script lang="ts">
    import { client } from "$lib/trpc";
    import Avatar from "$lib/components/Avatar.svelte";
    import type { Game, User } from "@repo/database";

    type GameDetails = {
        game: Game;
        players: (User & { score?: number | null })[];
    };

    let { gameId }: { gameId: string } = $props();

    function isValidGameId() {
        const numId = Number(gameId);
        return !Number.isNaN(numId) && Number.isInteger(numId) && numId >= 0;
    }

    async function getGameDetails(id: number): Promise<GameDetails | null> {
        console.log("Fetching game details for ID:", id);
        try {
            return await client.game.details.query(id);
        } catch (error) {
            console.error("Failed to fetch game details:", error);
            return null;
        }
    }

    // TODO: Implement the join game logic
    function handleJoinGame(id: number) {
        console.log("Joining game:", id);
    }
</script>

{#snippet playerInfo(player: User & { score?: number | null })}
    <li
        class="flex items-center justify-between bg-gray-700 p-2 rounded-md shadow"
    >
        <div class="flex items-center">
            <Avatar
                name={player.name}
                avatar={player.avatar}
                class="w-8 h-8 mr-3 rounded-full border-2 border-gray-600"
            />
            <span
                class="font-mono text-sm bg-gray-600 px-2 py-1 rounded text-gray-100 truncate"
            >
                {player.name}
            </span>
        </div>

        <span class="font-semibold text-lg text-indigo-300">{player.score}</span
        >
    </li>
{/snippet}

{#if !isValidGameId()}
    <!-- Invalid ID Card -->
    <div
        class="bg-red-900/60 border border-red-700 text-red-300 p-4 rounded-lg shadow-md max-w-sm mx-auto"
        role="alert"
    >
        <p>
            Invalid game ID: "<span
                class="font-mono bg-red-800/70 px-1.5 py-0.5 rounded"
                >{gameId}</span
            >". IDs must be non-negative numbers.
        </p>
    </div>
{:else}
    {@const numGameId = Number(gameId)}
    {#await getGameDetails(numGameId)}
        <!-- Loading Card -->
        <div
            class="bg-gray-700 border border-gray-600 rounded-lg shadow-lg p-6 max-w-sm mx-auto text-gray-300"
        >
            <p class="text-center">Loading game details...</p>
        </div>
    {:then gameDetails}
        {#if !gameDetails}
            <!-- Game Not Found Card -->
            <div
                class="bg-yellow-900/60 border border-yellow-700 text-yellow-300 p-4 rounded-lg shadow-md max-w-sm mx-auto"
                role="alert"
            >
                <p>
                    Game <span
                        class="font-mono bg-yellow-800/70 px-1.5 py-0.5 rounded"
                        >{numGameId}</span
                    > not found.
                </p>
            </div>
        {:else}
            {@const { game, players } = gameDetails}
            {#if game.status === "waiting"}
                <!-- Waiting Card -->
                <div
                    class="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6 max-w-sm mx-auto text-gray-200"
                >
                    {#if players.length === 0}
                        <p class="text-center text-gray-400 mb-4">
                            Waiting for players...
                        </p>
                    {:else if players.length === 1}
                        <p class="text-center mb-4">
                            <span class="font-semibold text-indigo-300"
                                >{players[0].name}</span
                            > wants to play a game with you!
                        </p>
                    {:else if players.length === 2}
                        <p class="text-center text-yellow-400 mb-4">
                            Game is full, waiting to start.
                        </p>
                        <ul class="space-y-2 mb-4">
                            {#each players as player (player.id)}
                                {@render playerInfo(player)}
                            {/each}
                        </ul>
                    {/if}

                    {#if players.length < 2}
                        <button
                            class="w-full inline-flex items-center justify-center rounded-md text-sm font-semibold ring-offset-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2 shadow-md"
                            onclick={() => handleJoinGame(game.id)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                class="w-5 h-5 mr-2"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                            Join Game
                        </button>
                    {/if}
                </div>
            {:else if game.status === "playing"}
                <!-- Playing Card -->
                <div
                    class="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6 max-w-sm mx-auto text-gray-200"
                >
                    <p class="text-center text-blue-400 mb-4">
                        Game #{game.id} is in progress.
                    </p>
                    <ul class="space-y-2">
                        {#each players as player (player.id)}
                            {@render playerInfo(player)}
                        {/each}
                    </ul>
                    <!-- Optionally add a Spectate button -->
                </div>
            {:else if game.status === "finished"}
                <!-- Finished Card -->
                <div
                    class="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6 max-w-sm mx-auto text-gray-200"
                >
                    <p class="text-center text-gray-500 mb-4">
                        Game #{game.id} has finished.
                    </p>

                    <!-- Determine and display winner -->
                    {#if players.length === 2 && players[0].score != null && players[1].score != null}
                        {@const score1 = players[0].score}
                        {@const score2 = players[1].score}
                        {@const winner =
                            score1 > score2
                                ? players[0]
                                : score2 > score1
                                  ? players[1]
                                  : null}
                        {#if winner}
                            <p
                                class="text-center mt-1 mb-4 text-lg font-semibold text-yellow-400"
                            >
                                🏆 Winner: {winner.name}! 🏆
                            </p>
                        {:else}
                            <p
                                class="text-center mt-1 mb-4 text-lg font-semibold text-gray-400"
                            >
                                🤝 It's a draw! 🤝
                            </p>
                        {/if}
                    {/if}

                    <!-- Display final scores -->
                    <span class="font-medium text-gray-400 text-sm block mb-2"
                        >Final Scores:</span
                    >
                    <ul class="space-y-2">
                        {#each players as player (player.id)}
                            {@render playerInfo(player)}
                        {/each}
                        {#if players.length === 0}
                            <li class="text-gray-500 italic text-sm p-2">
                                No player data available.
                            </li>
                        {/if}
                    </ul>
                </div>
            {/if}
        {/if}
    {:catch error}
        <!-- Error Card -->
        <div
            class="bg-red-900/60 border border-red-700 text-red-300 p-4 rounded-lg shadow-md max-w-sm mx-auto"
            role="alert"
        >
            <p>
                Failed to load game
                <span class="font-mono bg-red-800/70 px-1.5 py-0.5 rounded"
                    >{numGameId}</span
                >.
                <span class="block mt-1 text-sm italic">
                    {error instanceof Error ? error.message : "Unknown error"}
                </span>
            </p>
        </div>
    {/await}
{/if}
