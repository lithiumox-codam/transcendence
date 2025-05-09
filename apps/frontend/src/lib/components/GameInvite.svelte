<script lang="ts">
    import { client } from '$lib/trpc';
    import { getContext, onDestroy } from 'svelte';
    import type { UserClass } from '$lib/classes/User.svelte';
    import Avatar from '$lib/components/Avatar.svelte';
    import type { Game, User } from '@repo/database';
    import { Send, Swords } from '@lucide/svelte';

    type GameDetails = {
        game: Game;
        players: (User & { score?: number | null })[];
    };

    const user = getContext<UserClass>('user');
    let { gameId }: { gameId: string } = $props();

    let gameDetailsState = $state<{
        loading: boolean;
        data: GameDetails | null;
        error: Error | null;
    }>({ loading: true, data: null, error: null });

    let intervalId: ReturnType<typeof setInterval> | null = null;

    function isValidGameId(id: string) {
        const numId = Number(id);
        return !Number.isNaN(numId) && Number.isInteger(numId) && numId >= 0;
    }

    async function fetchGameDetails(id: number) {
        try {
            const details = await client.game.details.query(id);
            gameDetailsState.data = details;
            gameDetailsState.error = null;
        } catch (error) {
            console.error('Failed to fetch game details:', error);
            gameDetailsState.error = error instanceof Error ? error : new Error('Unknown error');
            gameDetailsState.data = null; // Clear data on error
        } finally {
            gameDetailsState.loading = false;
        }
    }

    async function handleJoinGame(id: number) {
        try {
            await client.game.acceptInvite.mutate(id);
            // Optionally re-fetch details immediately after joining
            await fetchGameDetails(id);
        } catch (error) {
            console.error('Failed to join game:', error);
            // Handle join error feedback if needed
        }
    }

    function stopPolling() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    // Effect to fetch initial data and set up polling
    $effect(() => {
        stopPolling(); // Clear any existing interval when gameId changes

        if (!isValidGameId(gameId)) {
            gameDetailsState = {
                loading: false,
                data: null,
                error: new Error('Invalid game ID format'),
            };
            return;
        }

        const numGameId = Number(gameId);
        gameDetailsState = { loading: true, data: null, error: null }; // Reset state for new ID

        fetchGameDetails(numGameId); // Initial fetch

        // This inner effect handles the polling logic based on the fetched data
        $effect(() => {
            const status = gameDetailsState.data?.game?.status;
            const shouldPoll = status && status !== 'finished';

            stopPolling(); // Clear previous interval before setting a new one or stopping

            if (shouldPoll) {
                intervalId = setInterval(() => {
                    fetchGameDetails(numGameId);
                }, 2000);
            }

            // Cleanup function for the inner effect
            return () => {
                stopPolling();
            };
        });

        // Cleanup function for the outer effect (when component unmounts or gameId changes)
        return () => {
            stopPolling();
        };
    });

    // Ensure interval is cleared on component destruction
    onDestroy(() => {
        stopPolling();
    });
</script>

{#snippet statusBadge(status: string)}
    {#if status === 'waiting'}
        <span
            class="inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full bg-blue-400/20 text-blue-300"
        >
            <span class="relative flex h-2 w-2 mr-1">
                <span
                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"
                ></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Waiting
        </span>
    {:else if status === 'playing'}
        <span
            class="inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full bg-green-400/20 text-green-300"
        >
            <span class="relative flex h-2 w-2 mr-1">
                <span
                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
                ></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Playing
        </span>
    {:else}
        <span
            class="inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full bg-gray-400/20 text-gray-300"
        >
            Finished
        </span>
    {/if}
{/snippet}

{#snippet playerInfo(player: User & { score?: number | null }, withScore = false)}
    <div class="flex items-center justify-between">
        <div class="flex items-center">
            <Avatar
                name={player.name}
                avatar={player.avatar}
                class="w-6 h-6 mr-2 rounded-full"
            />
            <span class="text-sm truncate">{player.name}</span>
        </div>
        {#if withScore}
            <span class="text-sm font-medium text-indigo-300">{player.score ?? 0}</span>
        {/if}
    </div>
{/snippet}

{#if gameDetailsState.loading && !gameDetailsState.data}
    <div class="text-gray-300 text-sm">Loading game details...</div>
{:else if gameDetailsState.error}
    <div class="text-red-300 text-sm">
        Error loading game: {gameDetailsState.error.message}
    </div>
{:else if !gameDetailsState.data}
    <div class="text-yellow-300 text-sm">Game #{gameId} not found</div>
{:else}
    {@const { game, players } = gameDetailsState.data}
    {@const isCurrentUserInviter = players.length === 1 && user.data?.id === players[0].id}
    {@const isGameFull = players.length >= 2}

    <div class="text-sm">
        {#if game.status === 'waiting'}
            <div class="flex items-center justify-between gap-3">
                {#if isCurrentUserInviter}
                    <p class="text-xs text-gray-400 italic flex items-center flex-grow">
                        <Send class="w-3 h-3 mr-1.5 text-gray-500 shrink-0" stroke-width="2" />
                        <span class="truncate">Waiting for opponent to join...</span>
                    </p>
                {:else}
                    <p class="text-sm text-gray-300 flex-grow">
                        <span class="font-medium text-indigo-300">{players[0].name}</span>
                        challenged you to a game!
                    </p>
                    {#if !isGameFull}
                        <button
                            class="bg-cyan-500/20 border border-cyan-500/30 hover:bg-cyan-600/30 text-cyan-300 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:opacity-50 select-none
inline-flex items-center ransition duration-300 rounded-md px-3 py-1 cursor-pointer transition-colors shrink-0"
                            onclick={() => handleJoinGame(game.id)}
                        >
                            <Swords class="w-4 h-4 mr-1.5" stroke-width="2" />
                            Accept
                        </button>
                    {/if}
                {/if}
            </div>
        {:else if game.status === 'playing'}
            {@const player1 = players[0]}
            {@const player2 = players[1]}
            {@const score1 = player1.score ?? 0}
            {@const score2 = player2.score ?? 0}
            {@const isPlayer1Leading = score1 > score2}
            {@const isPlayer2Leading = score2 > score1}
            {@const isDraw = score1 === score2}

            <div class="flex items-center justify-around gap-2 my-1">
                <!-- Player 1 -->
                <div class="flex flex-col items-center text-center relative">
                    {#if isPlayer1Leading}
                        <span class="absolute -top-1.5 text-xs text-yellow-400" title="Leading">👑</span>
                    {/if}
                    <Avatar
                        name={player1.name}
                        avatar={player1.avatar}
                        class="w-8 h-8 mb-1 rounded-full {isPlayer1Leading
                            ? 'ring-2 ring-offset-1 ring-offset-gray-800 ring-yellow-400'
                            : ''}"
                    />
                    <span
                        class="text-xs font-medium truncate max-w-[60px] {isPlayer1Leading
                            ? 'text-yellow-300'
                            : 'text-gray-300'}"
                    >
                        {player1.name}
                    </span>
                    <span
                        class="text-lg font-bold {isPlayer1Leading ? 'text-yellow-300' : 'text-gray-100'}"
                    >
                        {score1}
                    </span>
                </div>

                <!-- VS -->
                <span class="text-xl font-bold text-red-400 animate-pulse self-center pt-2">VS</span>

                <!-- Player 2 -->
                <div class="flex flex-col items-center text-center relative">
                    {#if isPlayer2Leading}
                        <span class="absolute -top-1.5 text-xs text-yellow-400" title="Leading">👑</span>
                    {/if}
                    <Avatar
                        name={player2.name}
                        avatar={player2.avatar}
                        class="w-8 h-8 mb-1 rounded-full {isPlayer2Leading
                            ? 'ring-2 ring-offset-1 ring-offset-gray-800 ring-yellow-400'
                            : ''}"
                    />
                    <span
                        class="text-xs font-medium truncate max-w-[60px] {isPlayer2Leading
                            ? 'text-yellow-300'
                            : 'text-gray-300'}"
                    >
                        {player2.name}
                    </span>
                    <span
                        class="text-lg font-bold {isPlayer2Leading ? 'text-yellow-300' : 'text-gray-100'}"
                    >
                        {score2}
                    </span>
                </div>
            </div>
            {#if isDraw}
                <p class="text-center text-xs text-gray-400 mt-1">Currently tied!</p>
            {/if}
        {:else if game.status === 'finished'}
            <!-- Determine and display winner -->
            {#if players.length === 2 && players[0].score != null && players[1].score != null}
                {@const score1 = players[0].score ?? 0}
                {@const score2 = players[1].score ?? 0}
                {@const winner = score1 > score2 ? players[0] : score2 > score1 ? players[1] : null}

                {#if winner}
                    <p class="text-yellow-300 font-medium mb-1.5">🏆 Winner: {winner.name}</p>
                {:else}
                    <p class="text-gray-400 font-medium mb-1.5">🤝 It's a draw!</p>
                {/if}
            {/if}

            <p class="text-xs text-gray-400 mb-1">Final Scores:</p>
            <div class="space-y-1.5">
                {#each players as player}
                    {@render playerInfo(player, true)}
                {/each}
            </div>
        {/if}
    </div>
{/if}
