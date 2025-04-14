<script lang="ts">
    import { getContext } from "svelte";
    import { UserClass } from "$lib/classes/User.svelte";

    const user = getContext<UserClass>("user");
</script>

<main class="relative min-h-screen bg-black text-white">
    <section class="px-6 py-12 max-w-5xl mx-auto">
        <header
            class="flex items-center p-8 bg-gray-950 rounded-xl shadow-lg border border-gray-800 mb-8"
        >
            <img
                class="w-24 h-24 rounded-full mr-8 border-4 border-gray-800 shadow-lg"
			          src={user.data?.avatar}
                alt="User Avatar"
            />
            <div>
                <h1 class="text-3xl font-extrabold text-white">{user.data?.name}</h1>
                <p class="text-lg text-gray-400 italic">{user.data?.email}</p>
            </div>
        </header>
    </section>
</main>