<script lang="ts">
    import type { GameClass } from "$lib/classes/Game.svelte";
    import { client } from "$lib/trpc";
    import { TrendingUp, Eye, History } from "@lucide/svelte";
    import type { Game, User } from "@repo/database";
    import { getContext, onMount } from "svelte";

    type OngoingGame = {
        game: Game;
        players: User[];
    };

    const game = getContext<GameClass>("game");
    let ongoing = $state<OngoingGame[]>([]);

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
</script>

<div class="bg-gray-800 rounded-lg shadow-lg p-4">
    <h2
        class="text-3xl font-extrabold tracking-widest text-center text-white retro-glow mb-6"
    >
        Choose Your Game Mode
    </h2>

    <!-- Gamemodes -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <!-- 1vs1 -->
        <button
            onclick={() => selectGame("1vs1")}
            class="aspect-[3/4] bg-gradient-to-br from-cyan-600 to-blue-800 hover:from-cyan-400 hover:to-blue-600
            rounded-xl p-4 flex flex-col justify-center items-center text-white shadow-[0_0_20px_rgba(0,255,255,0.1)] border border-cyan-400/20
            transition-transform duration-300 hover:scale-105"
        >
            <TrendingUp class="w-8 h-8 mb-3 text-cyan-300" />
            <span class="text-lg font-bold tracking-wide">1vs1</span>
            <p class="text-xs text-cyan-200 mt-1">Duel your rival</p>
        </button>

        <!-- 1vs1vs1vs1 -->
        <button
            onclick={() => selectGame("1vs1vs1vs1")}
            class="aspect-[3/4] bg-gradient-to-br from-pink-600 to-purple-700 hover:from-pink-500 hover:to-purple-600
            rounded-xl p-4 flex flex-col justify-center items-center text-white shadow-[0_0_20px_rgba(255,0,255,0.1)] border border-pink-500/20
            transition-transform duration-300 hover:scale-105"
        >
            <TrendingUp class="w-8 h-8 mb-3 text-pink-300" />
            <span class="text-lg font-bold tracking-wide">1vs1vs1vs1</span>
            <p class="text-xs text-pink-200 mt-1">Free-for-all chaos</p>
        </button>

        <!-- Tournament -->
        <button
            onclick={() => selectGame("tournament")}
            class="aspect-[3/4] bg-gradient-to-br from-amber-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500
            rounded-xl p-4 flex flex-col justify-center items-center text-white shadow-[0_0_20px_rgba(255,200,0,0.1)] border border-amber-400/20
            transition-transform duration-300 hover:scale-105"
        >
            <TrendingUp class="w-8 h-8 mb-3 text-amber-200" />
            <span class="text-lg font-bold tracking-wide">Tournament</span>
            <p class="text-xs text-amber-100 mt-1">Climb the bracket</p>
        </button>
    </div>
</div>

<div>
    <h2
        class="text-3xl font-extrabold tracking-widest text-center text-white retro-glow mt-6 mb-4"
    >
        Ongoing Games
    </h2>

    <!-- Ongoing Games -->
    <ul class="space-y-4">
        {#each ongoing as game}
            {@render OngoingGame(game)}
        {/each}
    </ul>
</div>

{#snippet OngoingGame(data: OngoingGame)}
    <li
        class="flex justify-between items-center bg-gray-700 rounded-lg shadow-md p-4 hover:bg-gray-600 transition-colors duration-300 ease-in-out"
    >
        <div class="flex items-center space-x-4">
            <div class="flex -space-x-2">
                {#each data.players as player}
                    <img
                        src="https://i.pravatar.cc/300"
                        alt="{player.name}"
                        class="w-8 h-8 rounded-full border-2 border-gray-900 hover:border-white transition-border duration-300 ease-in-out"
                    />
                {/each}
            </div>
            <div>
                <h3 class="text-lg font-semibold text-white">
                    {#each data.players as player, i}
                        {player.name}{i < data.players.length - 1 ? " vs " : ""}
                    {/each}
                </h3>
                <p class="text-sm text-gray-400">
                    {data.game.maxPlayers} Players Max
                </p>
            </div>
        </div>

        <button
            class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-300 ease-in-out"
            onclick={() => spectateGame(data.game.id)}
            aria-label="Spectate Game"
        >
            <Eye class="w-5 h-5 inline-block mr-2" />
            Spectate
        </button>
    </li>
{/snippet}

<!-- {#snippet MatchHistorySnippet(match: Game)}
	<li
		class="flex justify-between items-center bg-white/5 border border-white/10 p-3 rounded-md hover:bg-white/10 transition"
	>
		<div class="flex flex-col">
			<span>
				<span class="font-semibold text-white"
					>You vs {match.opponent}</span
				>
				<span class="text-sm text-gray-400 italic"
					>({match.gameType})</span
				>
			</span>
			<span
				class={`text-sm font-bold ${
					match.result === "Win" ? "text-green-400" : "text-red-400"
				}`}
			>
				{match.result}
			</span>
		</div>
	</li>
{/snippet} -->
