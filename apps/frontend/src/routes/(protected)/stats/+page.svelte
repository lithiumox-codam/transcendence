<script lang="ts">
    import { onMount } from "svelte";
    import type { PageData } from "./$types";
    import type { Player } from "@repo/database";
    import { getContext } from "svelte";
    import type { GameClass } from "$lib/classes/Game.svelte";

    let { data }: { data: PageData } = $props();

    const game = getContext<GameClass>("game");
</script>

{#each game.ongoing as ongoing}
    <div class="bg-gray-800 rounded-lg shadow-lg p-4 mb-4">
        <h2 class="text-xl font-bold text-white">Ongoing Game</h2>
        <p class="text-gray-400">Game ID: {ongoing.game.id}</p>
        <p class="text-gray-400">Players:</p>
        <ul class="list-disc pl-5">
            {#each ongoing.players as player}
                <li class="text-gray-300">{player.name}</li>
            {/each}
        </ul>
    </div>
    
{/each}

<main class="grid grid-cols-2 gap-4">
    <div>
        <h1 class="text-2xl font-bold text-white">Leaderboard</h1>
        <p class="text-gray-400">coming soon™</p>
    </div>
    <div>
        <h1 class="text-2xl font-bold text-white">Your stats</h1>
        <p class="text-gray-400">coming soon™</p>
    </div>
</main>
