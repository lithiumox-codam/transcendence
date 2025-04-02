<script lang="ts">
    import { client } from "$lib/trpc";

    import { TrendingUp } from "@lucide/svelte";

    // Handle game selection
    function selectGame(type: string) {
        // Logic to handle game selection
        // This could involve navigating to a new page, opening a modal, etc.
        console.log(`Selected game type: ${type}`);
    }
</script>

<div class="bg-gray-800 rounded-lg shadow-lg">
    <div class="grid grid-cols-2 gap-3">
        <button
            class="bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white p-3 rounded-lg flex flex-col items-center transition-all duration-300 hover:scale-105"
            onclick={async () => await client.game.queue.query(2)}
        >
            <TrendingUp class="w-6 h-6 mb-2" />
            <span>1v1</span>
        </button>

        <button
            class="bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white p-3 rounded-lg flex flex-col items-center transition-all duration-300 hover:scale-105"
            onclick={async () => await client.game.queue.query(4)}
        >
            <TrendingUp class="w-6 h-6 mb-2" />
            <span>1v1v1v1</span>
        </button>

        <button
            class="bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white p-3 rounded-lg flex flex-col items-center transition-all duration-300 hover:scale-105"
            onclick={() => selectGame("tournament")}
        >
            <TrendingUp class="w-6 h-6 mb-2" />
            <span>Tournament</span>
        </button>

        <button
            class="bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white p-3 rounded-lg flex flex-col items-center transition-all duration-300 hover:scale-105"
            onclick={() => selectGame("custom")}
        >
            <TrendingUp class="w-6 h-6 mb-2" />
            <span>Custom</span>
        </button>
    </div>
</div>
