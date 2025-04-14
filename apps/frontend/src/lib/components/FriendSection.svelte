<script lang="ts">
    import { UserClass } from "$lib/classes/User.svelte";
    import FriendSearch from "$lib/components/FriendSearch.svelte";
    import { goto } from "$app/navigation";
    import { getContext } from "svelte";

    const user = getContext<UserClass>("user");

    let activeTab: "friends" | "outgoing" | "incoming" = $state("friends");

    // Computed values for easy access
    let friendCount = $derived(user.friends?.length || 0);
    let incomingRequestCount = $derived(user.incomingRequests?.length || 0);
    let outgoingRequestCount = $derived(user.outgoingRequests?.length || 0);

    function viewProfile(userId: number) {
        goto(`/user/${userId}`);
    }

    // Helper function to get user initials for avatar fallback
    function getInitials(name: string): string {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    }
</script>

<main class="py-10 px-6 max-w-5xl mx-auto">
    <!-- Tabs navigation with fixed height to prevent layout shifts -->
    <div class="flex justify-between mb-8">
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
        <div class="flex items-center">
            <FriendSearch />
        </div>
    </div>

    <!-- Content container with fixed height to prevent layout shifts -->
    <div class="min-h-[400px]">
        {#if activeTab === "friends" && friendCount > 0}
            <!-- Friends list with avatars -->
            <ul class="space-y-4">
                {#each user.friends as friend (friend.id)}
                    <li
                        class="flex items-center p-4 bg-gray-700 shadow-lg rounded-lg border border-gray-500 transition-all hover:bg-gray-650"
                    >
                        {#if friend.avatar}
                            <img
                                src={friend.avatar}
                                alt="{friend.name}'s avatar"
                                class="w-16 h-16 rounded-full mr-4 object-cover border-2 border-double border-gray-400"
                            />
                        {:else}
                            <div
                                class="w-16 h-16 rounded-full mr-4 bg-blue-600 text-white flex items-center justify-center font-bold text-xl border-2 border-double border-gray-400"
                            >
                                {getInitials(friend.name)}
                            </div>
                        {/if}
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-white">
                                {friend.name}
                            </h3>
                            <p class="text-sm text-gray-300">
                                {friend.email}
                            </p>
                        </div>
                        <div class="flex gap-2">
                            <button
                                onclick={() => viewProfile(friend.id)}
                                class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                                View Profile
                            </button>
                            <button
                                onclick={() => user.removeFriend(friend.id)}
                                class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                                Remove Friend
                            </button>
                        </div>
                    </li>
                {/each}
            </ul>
        {:else if activeTab === "incoming" && incomingRequestCount > 0}
            <!-- Incoming friend requests with avatars -->
            <ul class="space-y-4">
                {#each user.incomingRequests as request (request.id)}
                    <li
                        class="flex items-center p-4 bg-gray-700 shadow-lg rounded-lg border border-gray-500 transition-all hover:bg-gray-650"
                    >
                        {#if request.avatar}
                            <img
                                src={request.avatar}
                                alt="{request.name}'s avatar"
                                class="w-16 h-16 rounded-full mr-4 object-cover border-2 border-double border-gray-400"
                            />
                        {:else}
                            <div
                                class="w-16 h-16 rounded-full mr-4 bg-green-600 text-white flex items-center justify-center font-bold text-xl border-2 border-double border-gray-400"
                            >
                                {getInitials(request.name)}
                            </div>
                        {/if}
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-white">
                                {request.name}
                            </h3>
                            <p class="text-sm text-gray-300">
                                {request.email}
                            </p>
                        </div>
                        <div class="flex gap-2">
                            <button
                                onclick={() =>
                                    user.acceptFriendRequest(request.id)}
                                class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                            >
                                Accept
                            </button>
                            <button
                                onclick={() =>
                                    user.rejectFriendRequest(request.id)}
                                class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                                Reject
                            </button>
                            <button
                                onclick={() => viewProfile(request.id)}
                                class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                                View
                            </button>
                        </div>
                    </li>
                {/each}
            </ul>
        {:else if activeTab === "outgoing" && outgoingRequestCount > 0}
            <!-- Outgoing friend requests with avatars -->
            <ul class="space-y-4">
                {#each user.outgoingRequests as request (request.id)}
                    <li
                        class="flex items-center p-4 bg-gray-700 shadow-lg rounded-lg border border-gray-500 transition-all hover:bg-gray-650"
                    >
                        {#if request.avatar}
                            <img
                                src={request.avatar}
                                alt="{request.name}'s avatar"
                                class="w-16 h-16 rounded-full mr-4 object-cover border-2 border-double border-gray-400"
                            />
                        {:else}
                            <div
                                class="w-16 h-16 rounded-full mr-4 bg-purple-600 text-white flex items-center justify-center font-bold text-xl border-2 border-double border-gray-400"
                            >
                                {getInitials(request.name)}
                            </div>
                        {/if}
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-white">
                                {request.name}
                            </h3>
                            <p class="text-sm text-gray-300">
                                {request.email}
                            </p>
                        </div>
                        <div class="flex gap-2">
                            <button
                                onclick={() =>
                                    user.cancelFriendRequest(request.id)}
                                class="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onclick={() => viewProfile(request.id)}
                                class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                                View
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
