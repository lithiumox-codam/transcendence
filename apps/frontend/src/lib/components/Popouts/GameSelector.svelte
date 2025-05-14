<script lang="ts">
    import type { GameClass } from "$lib/classes/Game.svelte";
    import { client } from "$lib/trpc";
    import { TrendingUp, Eye, Users, Trophy, Swords } from "@lucide/svelte";
    import type {
        Game,
        User,
    } from "../../../../../../packages/database/src/types";
    import { getContext } from "svelte";
    import Avatar from "../Avatar.svelte";
    import type { UserClass } from "$lib/classes/User.svelte";

    type OngoingGame = {
        game: Game;
        players: User[];
    };

    const game = getContext<GameClass>("game");
    let ongoing = $state<OngoingGame[]>([]);
    const gameClass = getContext<GameClass>("game");
    const userClass = getContext<UserClass>("user");

    client.game.ongoing.subscribe(undefined, {
        onData: (games) => {
            console.log("Ongoing games", games);
            ongoing = games;
        },
    });

    function selectGame(type: string) {
        console.log(`Selected game type: ${type}`);
    }

    function spectateGame(gameId: number) {
        console.log(`Viewing ongoing game with ID: ${gameId}`);
    }

    let swordsAnimating = $state(false); // State for 1v1 icon
    let usersAnimating = $state(false); // State for 4FFA icon
    let trophyAnimating = $state(false); // State for Tournament icon

    async function handleQueue1v1() {
        swordsAnimating = true;
        await client.game.queue.query(2);
        setTimeout(() => {
            swordsAnimating = false;
        }, 400); // Match animation duration
    }

    async function handleQueue4FFA() {
        usersAnimating = true;
        await client.game.queue.query(4);
        setTimeout(() => {
            usersAnimating = false;
        }, 400); // Match animation duration
    }

    async function handleQueueTournament() {
        trophyAnimating = true;
        await client.game.queue.query(8);
        setTimeout(() => {
            trophyAnimating = false;
        }, 400); // Match animation duration
    }

    let isUserInQueue = $derived(() => {
        const currentUser = userClass.data;
        if (!currentUser) {
            return false;
        }
        return gameClass.queue.some((player) => player.id === currentUser.id);
    });
</script>

<div
    class="bg-black/10 border border-white/10 rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.05)] backdrop-blur-sm p-6 text-white"
>
    {#if gameClass.queue.length > 0}
        <div class="mb-6 flex items-center justify-center space-x-2">
            <span class="select-none text-sm text-gray-400">In Queue:</span>
            <div class="flex -space-x-2">
                {#each gameClass.queue as player}
                    <Avatar
                        name={player.name}
                        avatar={player.avatar}
                        class="w-6 h-6 rounded-full border-2 border-black/50"
                    />
                {/each}
            </div>
            {#if isUserInQueue()}
                <button
                    onclick={async () => await client.game.leaveQueue.mutate()}
                    class="ml-3 text-xs bg-red-500/20 border border-red-500/30 hover:bg-red-600/30 text-red-300 font-medium py-1 px-2 rounded-full transition-all"
                >
                    Leave Queue
                </button>
            {/if}
        </div>
    {/if}
    <h2
        class="text-3xl font-extrabold tracking-widest text-center text-white retro-glow mb-6 select-none"
    >
        Choose Your Game Mode
    </h2>

    <!-- Gamemodes -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <!-- 1vs1 -->
        <button
            onclick={handleQueue1v1}
            class="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-cyan-900/50 to-black/30 border border-cyan-500/40 rounded-lg p-4 flex flex-col justify-center items-center text-white shadow-[0_0_20px_rgba(0,255,255,0.15)] backdrop-blur-sm
			   hover:from-cyan-800/60 hover:to-black/40 hover:border-cyan-400/60 hover:shadow-[0_0_30px_rgba(0,255,255,0.25)] transition-all duration-300 group transform hover:-translate-y-1 hover:scale-105 active:scale-100 active:-translate-y-0"
        >
            <div
                class="absolute inset-0 bg-grid-cyan opacity-10 group-hover:opacity-20 transition-opacity duration-300"
            ></div>
            <Swords
                class="w-10 h-10 mb-4 text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.5)] transition-transform duration-300 group-hover:scale-110 {swordsAnimating
                    ? 'animate-fight'
                    : ''}"
            />
            <span class="text-xl font-bold tracking-wider z-10">1 VS 1</span>
            <p class="text-sm text-cyan-200 mt-2 z-10">Classic Duel</p>
        </button>

        <!-- 1vs1vs1vs1 -->
        <button
            onclick={handleQueue4FFA}
            class="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-pink-900/50 to-black/30 border border-pink-500/40 rounded-lg p-4 flex flex-col justify-center items-center text-white shadow-[0_0_20px_rgba(255,0,255,0.15)] backdrop-blur-sm
                   hover:from-pink-800/60 hover:to-black/40 hover:border-pink-400/60 hover:shadow-[0_0_30px_rgba(255,0,255,0.25)] transition-all duration-300 group transform hover:-translate-y-1 hover:scale-105 active:scale-100 active:-translate-y-0"
        >
            <div
                class="absolute inset-0 bg-grid-pink opacity-10 group-hover:opacity-20 transition-opacity duration-300"
            ></div>
            <Users
                class="w-10 h-10 mb-4 text-pink-300 drop-shadow-[0_0_8px_rgba(255,0,255,0.5)] transition-transform duration-300 group-hover:scale-110 {usersAnimating
                    ? 'animate-users'
                    : ''}"
            />
            <span class="text-xl font-bold tracking-wider z-10"
                >4-Player FFA</span
            >
            <p class="text-sm text-pink-200 mt-2 z-10">Free-For-All Chaos</p>
        </button>

        <!-- Tournament -->
        <button
            onclick={handleQueueTournament}
            class="mb-10 aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-amber-900/50 to-black/30 border border-amber-500/40 rounded-lg p-4 flex flex-col justify-center items-center text-white shadow-[0_0_20px_rgba(255,200,0,0.15)] backdrop-blur-sm
			   hover:from-amber-800/60 hover:to-black/40 hover:border-amber-400/60 hover:shadow-[0_0_30px_rgba(255,200,0,0.25)] transition-all duration-300 group transform hover:-translate-y-1 hover:scale-105 active:scale-100 active:-translate-y-0"
        >
            <div
                class="absolute inset-0 bg-grid-amber opacity-10 group-hover:opacity-20 transition-opacity duration-300"
            ></div>
            <Trophy
                class="w-10 h-10 mb-4 text-amber-300 drop-shadow-[0_0_8px_rgba(255,200,0,0.5)] transition-transform duration-300 group-hover:scale-110 {trophyAnimating
                    ? 'animate-trophy'
                    : ''}"
            />
            <span class="text-xl font-bold tracking-wider z-10">Tournament</span
            >
            <p class="text-sm text-amber-200 mt-2 z-10">Climb the Bracket</p>
        </button>
    </div>
    <h2
        class="text-2xl font-extrabold tracking-widest text-center text-white mb-6 uppercase select-none"
    >
        Ongoing Games
    </h2>

    <!-- Ongoing Games -->
    {#if ongoing.length > 0}
        <ul class="space-y-3 max-h-60 overflow-y-auto pr-2">
            {#each ongoing as game}
                {@render OngoingGame(game)}
            {/each}
        </ul>
    {:else}
        <p class="text-center text-gray-500 text-sm py-4">
            No games currently in progress.
        </p>
    {/if}
</div>

{#snippet OngoingGame(data: OngoingGame)}
	<li
		class="flex justify-between items-center bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors duration-200 ease-in-out"
	>
		<div class="flex items-center space-x-3 min-w-0">
			<div class="flex -space-x-2 flex-shrink-0">
				{#each data.players as player}
					<Avatar
						name={player.name}
						avatar={player.avatar}
						class="w-8 h-8 rounded-full border-2 border-black/50 select-none"
					/>
				{/each}
			</div>
			<div class="min-w-0 flex-1">
				<h3
					class="truncate select-none text-sm font-semibold tracking-wide text-cyan-200"
				>
					{#each data.players as player, i}
						{player.name}
						{#if i < data.players.length - 1}
							<span class="text-gray-500 mr-2 mx-1">vs</span>
						{/if}
					{/each}
				</h3>
				<p class="select-none text-xs text-gray-400">
					{#if data.game.maxPlayers === 2}
						1 vs 1
					{:else if data.game.maxPlayers === 4}
						4 Players FFA
					{:else}
						{data.game.maxPlayers} Players Max
					{/if}
				</p>
			</div>
		</div>

		<button
			class="ml-3 flex-shrink-0 bg-white/5 border-white/10 border hover:border-cyan-500/30 hover:bg-cyan-600/20 text-cyan-300 font-medium py-1.5 px-3 rounded-md text-xs transition-all flex items-center gap-1.5 cursor-pointer select-none"
			onclick={() => spectateGame(data.game.id)}
			aria-label="Spectate Game"
		>
			<Eye class="w-5 h-5 inline-block mr-2" />
			Spectate
		</button>
	</li>
{/snippet}

<style>
    /* Custom scrollbar for Webkit browsers */
    .overflow-y-auto::-webkit-scrollbar {
        width: 6px;
    }
    .overflow-y-auto::-webkit-scrollbar-track {
        background: transparent;
        margin: 2px 0;
    }
    .overflow-y-auto::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
    }
    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
        background-color: rgba(255, 255, 255, 0.4);
    }

    .bg-grid-cyan {
        background-image:
            linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px);
        background-size: 20px 20px;
    }
    .bg-grid-pink {
        background-image:
            linear-gradient(rgba(255, 0, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 0, 255, 0.05) 1px, transparent 1px);
        background-size: 20px 20px;
    }
    .bg-grid-amber {
        background-image:
            linear-gradient(rgba(255, 200, 0, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 200, 0, 0.05) 1px, transparent 1px);
        background-size: 20px 20px;
    }

    /* Ensure transitions cover border and shadow */

    @keyframes fight {
        0% {
            transform: rotate(0deg) translateX(0);
        }
        25% {
            transform: rotate(-15deg) translateX(-3px) translateY(-1px);
        }
        50% {
            transform: rotate(15deg) translateX(3px) translateY(-1px);
        }
        75% {
            transform: rotate(-10deg) translateX(-2px);
        }
        100% {
            transform: rotate(0deg) translateX(0);
        }
    }
</style>
