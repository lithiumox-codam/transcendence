<script lang="ts">
    import { client } from "$lib/trpc";

    // The search input value.
    let searchTerm = $state("");
    // The search results.
    let results = $state<{ id: number; name: string; email: string }[]>([]);

    // Make the request immediately whenever searchTerm changes.
    $effect(() => {
        (async () => {
            if (searchTerm.trim()) {
                try {
                    const res = await client.user.search.query(
                        searchTerm.trim(),
                    );
                    console.log("Search results:", res);
                    results = res;
                } catch (error) {
                    console.error("Error searching for friends:", error);
                    results = [];
                }
            } else {
                results = [];
            }
        })();
    });

    // Handler to add a friend when a result is clicked.
    async function addFriend(friendId: number) {
        try {
            await client.user.friends.add.mutate({ friendId });
            // Optionally, clear the search input or provide feedback here.
        } catch (error) {
            console.error("Error adding friend:", error);
        }
    }
</script>

<!-- Container with relative positioning so the results float below the input -->
<div class="friend-search" style="position: relative; width: 300px;">
    <input
        type="text"
        placeholder="Search for friends..."
        bind:value={searchTerm}
        style="width: 100%; padding: 8px; box-sizing: border-box;"
    />

    {#if results.length > 0}
        <div
            class="results"
            style="position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #ccc; z-index: 10;"
        >
            {#each results as user}
                <button
                    class="result-item"
                    onclick={() => addFriend(user.id)}
                    style="padding: 8px; cursor: pointer;"
                >
                    <strong>{user.name}</strong> - {user.email}
                </button>
            {/each}
        </div>
    {/if}
</div>
