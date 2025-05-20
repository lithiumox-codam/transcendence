<script lang="ts">
    import { client } from "$lib/trpc";
    import { getContext } from "svelte";
    import type { UserClass } from "$lib/classes/User.svelte";
    import Avatar from "$lib/components/Avatar.svelte";
    import type { Game, User } from "@repo/database";
    import { Loader, Send, XCircle } from "@lucide/svelte";

    type Player = User & {
        score?: number | null;
    };

    type GameDetails = {
        game: Game;
        players: (User & { score?: number | null })[];
    };

    const user = getContext<UserClass>("user");
    let { gameId }: { gameId: string } = $props();
    let updateTimer: NodeJS.Timeout | null = $state(null);

    function isValidGameId() {
        const numId = Number(gameId);
        return !Number.isNaN(numId) && Number.isInteger(numId) && numId >= 0;
    }

    let gameDetails = $state<GameDetails | null>(null);
    let isLoading = $state(true);
    let errorLoading = $state<string | null>(null);
    let updateInterval: NodeJS.Timeout | null = null;

    // Effect to fetch and periodically update game details
    $effect(() => {
        const cleanup = () => {
            if (updateInterval) {
                clearInterval(updateInterval);
                updateInterval = null;
            }
        };

        isLoading = true;
        errorLoading = null;
        gameDetails = null;
        cleanup();

        if (!isValidGameId()) {
            errorLoading = "Invalid game ID format";
            isLoading = false;
            return cleanup;
        }

        const numGameId = Number(gameId);

        // Async function to fetch details and schedule next update
        const fetchAndUpdateDetails = async () => {
            try {
                const details = await getGameDetails(numGameId);

                if (!details) {
                    errorLoading = "Game not found";
                    gameDetails = null;
                    cleanup();
                } else {
                    gameDetails = details;
                    if (errorLoading !== "Invalid game ID format") {
                        errorLoading = null;
                    }

                    // Determine next update interval based on status
                    let intervalMs: number | null = null;
                    if (details.game.status === "waiting") {
                        intervalMs = 2000; // 20 seconds
                    } else if (details.game.status === "playing") {
                        intervalMs = 2000; // 2 seconds
                    } else {
                        intervalMs = null; // No updates needed
                    }

                    cleanup();

                    if (intervalMs !== null) {
                        updateInterval = setInterval(
                            fetchAndUpdateDetails,
                            intervalMs,
                        );
                    }
                }
            } catch (err) {
                errorLoading = "Error updating game details";
                cleanup();
            } finally {
                if (isLoading) {
                    isLoading = false;
                }
            }
        };

        fetchAndUpdateDetails();

        return cleanup;
    });

    async function getGameDetails(id: number): Promise<GameDetails | null> {
        try {
            return await client.game.details.query(id);
        } catch (error) {
            console.error("Failed to fetch game details:", error);
            return null;
        }
    }

    async function handleJoinGame(id: number) {
        try {
            await client.game.acceptInvite.mutate(id);
        } catch (error) {
            console.error("Failed to join game:", error);
        }
    }
</script>

{#snippet playerAvatar(player: Player, isWinner = false)}
    <div class="flex flex-col items-center relative">
        {#if isWinner}
            <div class="absolute -top-4 text-yellow-300 text-lg">👑</div>
        {/if}
        <Avatar
            name={player.name}
            avatar={player.avatar}
            class="w-10 h-10 rounded-full"
        />
        <span class="text-xs mt-1 truncate max-w-[80px]">{player.name}</span>
        {#if player.score !== undefined}
            <span class="text-sm font-bold text-indigo-300">{player.score}</span
            >
        {/if}
    </div>
{/snippet}

{#snippet vsIcon(animate = false)}
    <div class="relative mx-4 flex items-center justify-center">
        <div
            class="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-full blur-sm opacity-70"
        ></div>
        <span
            class="relative z-10 text-white font-extrabold text-xl tracking-wider {animate
                ? 'animate-pulse'
                : ''}"
        >
            VS
        </span>
    </div>
{/snippet}

{#if !isValidGameId()}
    <div class="text-red-300 text-sm">Invalid game ID format</div>
{:else}
    {@const numGameId = Number(gameId)}
    {#await getGameDetails(numGameId)}
        <div class="flex justify-center py-2">
            <Loader
                class="text-white fill-current animate-spin"
                size={32}
                stroke-width={2}
            />
        </div>
    {:then gameDetails}
        {#if !gameDetails}
            <div class="flex flex-col items-center justify-center py-2 gap-2">
                <XCircle class="text-red-500 " size={32} stroke-width={2} />
                <span class="text-sm text-red-300 font-thin"
                    >Game invite expired!</span
                >
            </div>
        {:else}
            {@const { game, players } = gameDetails}
            {@const isCurrentUserInviter =
                players.length === 1 && user.data?.id === players[0].id}
            {@const isGameFull = players.length >= 2}

            <div>
                <!-- Waiting for opponent -->
                {#if game.status === "waiting"}
                    {#if isCurrentUserInviter}
                        <div
                            class="flex flex-col items-center justify-center py-2 gap-2"
                        >
                            <Send
                                class="text-white fill-current"
                                size={32}
                                stroke-width={2}
                            />
                            <span class="text-sm text-white font-thin"
                                >Invitation sent!</span
                            >
                        </div>
                    {:else}
                        <div class="flex flex-col items-center py-2 gap-2">
                            <div class="flex items-center">
                                <Avatar
                                    name={players[0].name}
                                    avatar={players[0].avatar}
                                    class="w-8 h-8 rounded-full"
                                />
                                <span class="ml-2 text-sm"
                                    >{players[0].name} invited you!</span
                                >
                            </div>
                            {#if !isGameFull}
                                <button
                                    class="mt-2 w-full flex items-center justify-center text-sm font-medium bg-green-600 text-white hover:bg-green-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 ring-offset-gray-900 transition-colors"
                                    onclick={() => handleJoinGame(game.id)}
                                >
                                    Play Now
                                </button>
                            {/if}
                        </div>
                    {/if}

                    <!-- Game in progress -->
                {:else if game.status === "playing" && players.length >= 2}
                    <div class="flex justify-center items-center py-2">
                        {@render playerAvatar(players[0])}
                        {@render vsIcon(true)}
                        {@render playerAvatar(players[1])}
                    </div>

                    <!-- Game finished -->
                {:else if game.status === "finished" && players.length >= 2}
                    {@const p1Score = players[0].score ?? 0}
                    {@const p2Score = players[1].score ?? 0}
                    {@const p1Wins = p1Score > p2Score}
                    {@const p2Wins = p2Score > p1Score}
                    <div
                        class="flex justify-center items-center py-2 space-x-8"
                    >
                        {@render playerAvatar(players[0], p1Wins)}
                        {@render playerAvatar(players[1], p2Wins)}
                    </div>
                {/if}
            </div>
        {/if}
    {:catch error}
        <div class="text-red-300 text-sm">Error loading game</div>
    {/await}
{/if}
