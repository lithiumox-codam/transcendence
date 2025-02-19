<script lang="ts">
    import { UserClass } from "$lib/classes/User.svelte";
    import { getContext } from "svelte";

    const user = getContext<UserClass>("user");
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
                    <h3 class="text-xl font-semibold text-white tracking-tighter">
                        {friend.name}
                    </h3>
                    <p class="text-gray-300">
                        {friend.email}
                    </p>
                </div>
                <button
                    onclick={() => window.location.href = `/user/${friend.id}`}
                    class="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    View
                </button>
            </li>
        {/each}
        <li
            class="flex items-center p-6 bg-gray-700 shadow-lg rounded-lg border border-gray-500 cursor-pointer transition-all hover:scale-105 hover:shadow-2xl"
        >
            <div
                class="flex items-center justify-center w-20 h-20 bg-gray-600 rounded-full mr-6 border border-gray-400 filter drop-shadow"
            >
                <svg
                    class="w-10 h-10 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                </svg>
            </div>
            <div>
                <h3 class="text-xl font-semibold text-gray-300 tracking-wide">
                    Add Friend
                </h3>
            </div>
        </li>
    </ul>
</main>
