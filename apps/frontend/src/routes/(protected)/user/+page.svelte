<script lang="ts">
    import { UserClass } from "$lib/classes/User.svelte";
    import FriendSearch from "$lib/components/FriendSearch.svelte";
    import { client } from "$lib/trpc";
    import { getContext } from "svelte";

    const user = getContext<UserClass>("user");

    // Check if there are any incoming friend requests
    const hasIncomingRequests = $derived(
        user.incomingRequests && user.incomingRequests.length > 0,
    );
</script>

<header
    class="flex items-center p-8 bg-gray-800 shadow-2xl border-b border-gray-600"
>
    <img
        class="w-24 h-24 rounded-full mr-8 border-4 border-double border-gray-400 filter drop-shadow"
        src="/favicon.png"
        alt="User Avatar"
    />
    <div>
        <h1 class="text-3xl font-extrabold text-white drop-shadow">
            {user.data?.name}
        </h1>
        <p class="text-lg text-gray-300 italic">
            {user.data?.email}
        </p>
    </div>
</header>

<main class="py-10 px-6 max-w-5xl mx-auto">
    <h2
        class="text-2xl sm:text-3xl font-bold text-white mb-8 tracking-wide border-b pb-2 border-gray-600"
    >
        Friends
    </h2>
    <ul class="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {#each user.friends as friend (friend.id)}
            <li
                class="flex items-center p-6 bg-gray-700 shadow-lg rounded-lg border border-gray-500 transition-all hover:scale-105 hover:shadow-2xl"
            >
                <img
                    class="w-20 h-20 rounded-full mr-6 object-cover border-4 border-double border-gray-400 filter drop-shadow"
                    src="/favicon.png"
                    alt="Friend Avatar"
                />
                <div class="flex-1">
                    <h3
                        class="text-xl font-semibold text-white tracking-tighter"
                    >
                        {friend.name}
                    </h3>
                    <p class="text-gray-300">
                        {friend.email}
                    </p>
                </div>
                <button
                    onclick={() =>
                        (window.location.href = `/user/${friend.id}`)}
                    class="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    View
                </button>

                <button
                    onclick={() => {
                        user.removeFriend(friend.id);
                    }}
                    class="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                    Remove
                </button>
            </li>
        {/each}
        <li
            class="flex items-center p-6 bg-gray-700 shadow-lg rounded-lg border border-gray-500 cursor-pointer transition-all hover:scale-105 hover:shadow-2xl"
        >
            <div>
                <h3 class="text-xl font-semibold text-gray-300 tracking-wide">
                    Add Friend
                </h3>
                <FriendSearch />
            </div>
        </li>
    </ul>

    {#if hasIncomingRequests}
        <div class="mt-12">
            <h2
                class="text-2xl sm:text-3xl font-bold text-white mb-8 tracking-wide border-b pb-2 border-gray-600"
            >
                Friend Requests
            </h2>
            <ul class="grid grid-cols-1 gap-4">
                {#each user.incomingRequests as request (request.id)}
                    <li
                        class="flex items-center p-4 bg-gray-700 shadow-lg rounded-lg border border-gray-500"
                    >
                        <img
                            class="w-12 h-12 rounded-full mr-4 object-cover border-2 border-double border-gray-400"
                            src="/favicon.png"
                            alt="Requestor Avatar"
                        />
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-white">
                                {request.name}
                            </h3>
                            <p class="text-sm text-gray-300">
                                {request.email}
                            </p>
                        </div>
                        <div class="flex space-x-2">
                            <button
                                onclick={() =>
                                    client.user.friends.add.mutate({
                                        friendId: request.id,
                                    })}
                                class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                            >
                                Accept
                            </button>
                            <button
                                class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                                Block
                            </button>
                        </div>
                    </li>
                {/each}
            </ul>
        </div>
    {/if}
</main>
