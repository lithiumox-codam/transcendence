<script lang="ts">
    import { UserClass } from "$lib/classes/User.svelte";
    import FriendSearch from "$lib/components/FriendSearch.svelte";
    import { goto } from "$app/navigation";
    import { getContext } from "svelte";
    import Avatar from "$lib/components/Avatar.svelte";
    import { Search, SearchX, Check, X } from "@lucide/svelte"; // Import Check and X icons

    const user = getContext<UserClass>("user");

    let activeTab: "friends" | "outgoing" | "incoming" = $state("friends");
    let showSearchBar = $state(false); // State to toggle the search bar

    // Computed values for easy access
    let friendCount = $derived(user.friends?.length || 0);
    let incomingRequestCount = $derived(user.incomingRequests?.length || 0);
    let outgoingRequestCount = $derived(user.outgoingRequests?.length || 0);

    function viewProfile(userId: number) {
        if (window.location.pathname !== `/user/${userId}`)
            goto(`/user/${userId}`);
    }
</script>

<main class="py-10 px-6 mx-auto">
    {#if showSearchBar}
        <div class="relative mb-6">
            <FriendSearch />
        </div>
    {/if}

    <div class="flex justify-between items-center mb-8">
        <div class="flex">
            <button
                class="px-6 py-3 font-medium text-lg transition-all border-b-2 {activeTab ===
                'friends'
                    ? 'text-blue-400 border-blue-400'
                    : 'text-gray-300 hover:text-blue-300 border-transparent'}"
                onclick={() => (activeTab = "friends")}
            >
                Friends
                <span class="ml-2 px-2 py-0.5 bg-gray-700 text-sm rounded-full"
                    >{friendCount}</span
                >
            </button>
            <button
                class="px-6 py-3 font-medium text-lg transition-all border-b-2 {activeTab ===
                'incoming'
                    ? 'text-blue-400 border-blue-400'
                    : 'text-gray-300 hover:text-blue-300 border-transparent'}"
                onclick={() => (activeTab = "incoming")}
            >
                Incoming Requests
                <span class="ml-2 px-2 py-0.5 bg-gray-700 text-sm rounded-full"
                    >{incomingRequestCount}</span
                >
            </button>
            <button
                class="px-6 py-3 font-medium text-lg transition-all border-b-2 {activeTab ===
                'outgoing'
                    ? 'text-blue-400 border-blue-400'
                    : 'text-gray-300 hover:text-blue-300 border-transparent'}"
                onclick={() => (activeTab = "outgoing")}
            >
                Outgoing Requests
                <span class="ml-2 px-2 py-0.5 bg-gray-700 text-sm rounded-full"
                    >{outgoingRequestCount}</span
                >
            </button>
        </div>

        <button
            class="p-2 text-white/70 hover:text-blue-400 transition ml-4 cursor-pointer"
            onclick={() => (showSearchBar = !showSearchBar)}
            aria-label={showSearchBar ? "Close search" : "Open search"}
        >
            {#if showSearchBar}
                <SearchX class="w-5 h-5" />
            {:else}
                <Search class="w-5 h-5" />
            {/if}
        </button>
    </div>

    <div class="min-h-[400px]">
        {#if activeTab === "friends" && friendCount > 0}
            <ul class="space-y-4">
                {#each user.friends as friend (friend.id)}
                    <li
                        class="flex items-center p-4 bg-white/5 shadow-lg rounded-lg transition duration-300 hover:bg-white/10"
                    >
                        <button
                            class="text-lg font-semibold text-white/80 text-left cursor-pointer"
                            onclick={() => viewProfile(friend.id)}
                        >
                            <Avatar
                                name={friend.name}
                                avatar={friend.avatar}
                                class="w-16 h-16 mr-4 text-3xl cursor-pointer opacity-80"
                            />
                        </button>
                        <div class="flex-1">
                            <button
                                class="text-lg font-semibold text-white/80 text-left cursor-pointer"
                                onclick={() => viewProfile(friend.id)}
                            >
                                {friend.name}
                            </button>
                            <p class="text-sm text-gray-300/40">
                                {friend.email}
                            </p>
                        </div>
                        <div class="flex gap-2">
                            <button
                                onclick={() => user.removeFriend(friend.id)}
                                class="p-2 bg-red-600/20 border border-red-500/30 text-red-300 rounded-md hover:bg-red-600/40 hover:text-red-200 transition cursor-pointer"
                                aria-label="Remove friend"
                            >
                                <X class="w-4 h-4" />
                            </button>
                        </div>
                    </li>
                {/each}
            </ul>
        {:else if activeTab === "incoming" && incomingRequestCount > 0}
            <ul class="space-y-4">
                {#each user.incomingRequests as request (request.id)}
                    <li
                        class="flex items-center p-4 bg-white/5 shadow-lg rounded-lg transition duration-300 hover:bg-white/10"
                    >
                        <button
                            class="text-lg font-semibold text-white/80 text-left cursor-pointer"
                            onclick={() => viewProfile(request.id)}
                        >
                            <Avatar
                                name={request.name}
                                avatar={request.avatar}
                                class="w-16 h-16 mr-4 text-3xl cursor-pointer opacity-80"
                            />
                        </button>
                        <div class="flex-1">
                            <button
                                class="text-lg font-semibold text-white/80 text-left cursor-pointer"
                                onclick={() => viewProfile(request.id)}
                            >
                                {request.name}
                            </button>
                            <p class="text-sm text-gray-300/40">
                                {request.email}
                            </p>
                        </div>
                        <div class="flex gap-2">
                            <button
                                onclick={() =>
                                    user.acceptFriendRequest(request.id)}
                                class="p-2 bg-green-600/20 border border-green-500/30 text-green-300 rounded-md hover:bg-green-600/40 hover:text-green-200 transition cursor-pointer"
                                aria-label="Accept friend request"
                            >
                                <Check class="w-4 h-4" />
                            </button>
                            <button
                                onclick={() =>
                                    user.rejectFriendRequest(request.id)}
                                class="p-2 bg-red-600/20 border border-red-500/30 text-red-300 rounded-md hover:bg-red-600/40 hover:text-red-200 transition cursor-pointer"
                                aria-label="Reject friend request"
                            >
                                <X class="w-4 h-4" />
                            </button>
                        </div>
                    </li>
                {/each}
            </ul>
        {:else if activeTab === "outgoing" && outgoingRequestCount > 0}
            <ul class="space-y-4">
                {#each user.outgoingRequests as request (request.id)}
                    <li
                        class="flex items-center p-4 bg-white/5 shadow-lg rounded-lg transition duration-300 hover:bg-white/10"
                    >
                        <button
                            class="text-lg font-semibold text-white/80 text-left cursor-pointer"
                            onclick={() => viewProfile(request.id)}
                        >
                            <Avatar
                                name={request.name}
                                avatar={request.avatar}
                                class="w-16 h-16 mr-4 text-3xl cursor-pointer opacity-80"
                            />
                        </button>
                        <div class="flex-1">
                            <button
                                class="text-lg font-semibold text-white/80 text-left cursor-pointer"
                                onclick={() => viewProfile(request.id)}
                            >
                                {request.name}
                            </button>
                            <p class="text-sm text-gray-300/40">
                                {request.email}
                            </p>
                        </div>
                        <div class="flex gap-2">
                            <button
                                onclick={() =>
                                    user.cancelFriendRequest(request.id)}
                                class="p-2 bg-red-600/20 border border-red-500/30 text-red-300 rounded-md hover:bg-red-600/40 hover:text-red-200 transition cursor-pointer"
                                aria-label="Cancel friend request"
                            >
                                <X class="w-4 h-4" />
                            </button>
                        </div>
                    </li>
                {/each}
            </ul>
        {:else}
            <div
                class="flex flex-col items-center justify-center py-20 text-center"
            >
                <div class="text-6xl mb-6">
                    {#if activeTab === "friends"}
                        👋
                    {:else if activeTab === "incoming"}
                        📩
                    {:else}
                        ✉️
                    {/if}
                </div>
                <h3 class="text-2xl font-bold text-white mb-3">
                    {#if activeTab === "friends"}
                        No Friends Yet
                    {:else if activeTab === "incoming"}
                        No Incoming Requests
                    {:else}
                        No Outgoing Requests
                    {/if}
                </h3>
                <p class="text-gray-300 max-w-md">
                    {#if activeTab === "friends"}
                        Use the search bar above to find and add new friends to
                        your network.
                    {:else if activeTab === "incoming"}
                        When someone sends you a friend request, it will appear
                        here.
                    {:else}
                        When you send friend requests, they'll appear here until
                        accepted.
                    {/if}
                </p>
            </div>
        {/if}
    </div>
</main>