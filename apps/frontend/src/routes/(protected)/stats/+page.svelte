<script lang="ts">
    import { onMount } from "svelte";
    import type { PageData } from "./$types";
    import { client } from "$lib/trpc";
    import type { Player } from "@repo/database";
    import { SvelteMap } from "svelte/reactivity";

    let { data }: { data: PageData } = $props();

    let ongoing: {
        id: number;
        status: "waiting" | "playing" | "finished";
        maxPlayers: number;
        createdAt: string | null;
        updatedAt: string | null;
    }[] = $state([]);
    let players = new SvelteMap<
        number,
        {
            gameId: number;
            userId: number;
            createdAt: string | null;
        }[]
    >();

    onMount(async () => {
        client.game.ongoing.subscribe(undefined, {
            onData: async (data) => {
                ongoing = data;
                for (const game of data) {
                    let res = await client.game.players.query(game.id);
                    if (res) {
                        players.set(game.id, res);
                    }
                }
            },
        });
    });
</script>

<div class="text-white text-4xl">
    {#each ongoing as on}
        <div class="flex flex-row gap-4">
            <p>{on.id}</p>
            <p>{on.status}</p>
            <p>{on.maxPlayers}</p>
            <div>
                <!-- show a list of players per game -->
                {#if players.has(on.id)}
                    <ul>
                        {#each players.get(on.id) as player}
                            <li>
                                {player.userId} - {player.createdAt}
                            </li>
                        {/each}
                    </ul>
                {:else}
                    <p>No players yet</p>
                {/if}
            </div>
        </div>
    {/each}
</div>

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
