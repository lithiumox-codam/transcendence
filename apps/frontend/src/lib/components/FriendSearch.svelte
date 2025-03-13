<script lang="ts">
    import { client } from "$lib/trpc";
    import { getContext } from "svelte";
    import type { UserClass } from "$lib/classes/User.svelte";

    const user = getContext<UserClass>("user");

    let searchTerm = $state("");
    let results = $state<
        { id: number; name: string; email: string; avatar?: string }[]
    >([]);
    let selectedIndex = $state(0);
    let inputElement: HTMLInputElement;

    $effect(() => {
        (async () => {
            if (searchTerm.trim()) {
                try {
                    const res = await client.user.search.query(
                        searchTerm.trim(),
                    );
                    results = res.filter((result) => {
                        return (
                            !user.isFriend(result.id) &&
                            !user.hasSentRequestTo(result.id) &&
                            !user.hasIncomingRequestFrom(result.id) &&
                            result.name !== "[deleted]" &&
                            result.id !== user.data?.id
                        );
                    });
                    selectedIndex = 0; 
                } catch (error) {
                    console.error("Error searching for friends:", error);
                    results = [];
                }
            } else {
                results = [];
            }
        })();
    });

    async function addFriend(friendId: number) {
        try {
            await user.sendFriendRequest(friendId);
            searchTerm = "";
            results = [];
        } catch (error) {
            console.error("Error adding friend:", error);
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (!results.length) return;

        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                selectedIndex = (selectedIndex + 1) % results.length;
                break;
            case "ArrowUp":
                event.preventDefault();
                selectedIndex =
                    (selectedIndex - 1 + results.length) % results.length;
                break;
            case "Enter":
                event.preventDefault();
                if (results[selectedIndex]) {
                    addFriend(results[selectedIndex].id);
                }
                break;
            case "Escape":
                event.preventDefault();
                searchTerm = "";
                results = [];
                break;
        }
    }

    function getInitials(name: string): string {
        return name
            .split(" ")
            .map((part) => part.charAt(0))
            .join("")
            .toUpperCase()
            .substring(0, 2);
    }
</script>

<div class="relative w-full max-w-md">
    <div class="relative">
        <input
            type="text"
            placeholder="Search for friends..."
            bind:value={searchTerm}
            bind:this={inputElement}
            onkeydown={handleKeydown}
            autocomplete="off"
            class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {#if searchTerm}
            <button
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xl w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-600 transition-colors"
                onclick={() => {
                    searchTerm = "";
                }}
                aria-label="Clear search"
            >
                ×
            </button>
        {/if}
    </div>

    {#if results.length > 0}
        <div
            class="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-80 overflow-y-auto"
        >
            {#each results as user, i}
                <button
                    class="flex items-center w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0 {i ===
                    selectedIndex
                        ? 'bg-gray-700'
                        : ''}"
                    onclick={() => addFriend(user.id)}
                >
                    <div class="flex-shrink-0 w-10 h-10 mr-3">
                        {#if user.avatar}
                            <img
                                src={user.avatar}
                                alt={user.name}
                                class="w-full h-full rounded-full object-cover"
                            />
                        {:else}
                            <div
                                class="w-full h-full rounded-full bg-blue-600 text-white flex items-center justify-center font-medium text-sm"
                            >
                                {getInitials(user.name)}
                            </div>
                        {/if}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium text-white truncate">
                            {user.name}
                        </div>
                        <div class="text-xs text-gray-400 truncate">
                            {user.email}
                        </div>
                    </div>
                    <div
                        class="ml-3 w-6 h-6 rounded-full bg-gray-600 hover:bg-blue-600 flex items-center justify-center text-white text-lg transition-colors"
                    >
                        +
                    </div>
                </button>
            {/each}
        </div>
    {:else if searchTerm.trim()}
        <div
            class="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-4 text-center text-gray-400"
        >
            No users found
        </div>
    {/if}
</div>
