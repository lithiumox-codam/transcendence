<script lang="ts">
    import { getContext } from "svelte";
    import { UserClass } from "$lib/classes/User.svelte";
    import Avatar from "$lib/components/Avatar.svelte";
    import UpdateUser from "$lib/components/UpdateUser.svelte";

    const user = getContext<UserClass>("user");

    let editMode = $state(false); // Toggle edit mode
</script>

{#if user.data}
    <main class="relative min-h-screen bg-black text-white">
        {#if editMode}
            <!-- Render UpdateUser component in edit mode -->
            <section class="px-6 py-12 max-w-5xl mx-auto">
                <header
                    class="flex items-center justify-between p-8 bg-gray-950 rounded-xl shadow-lg border border-gray-800 mb-8"
                >
                    <UpdateUser
                        user={user.data}
                        on:updateComplete={() => (editMode = false)}
                    />
                </header>
            </section>
        {:else}
            <section class="px-6 py-12 max-w-5xl mx-auto">
                <header
                    class="flex items-center justify-between p-8 bg-gray-950 rounded-xl shadow-lg border border-gray-800 mb-8"
                >
                    <div class="flex items-center">
                        <Avatar
                            name={user.data.name}
                            avatar={user.data.avatar}
                            class="w-24 h-24 mr-6 text-3xl"
                        />
                        <div>
                            <h1 class="text-3xl font-extrabold text-white">
                                {user.data.name}
                            </h1>
                            <p class="text-lg text-gray-400 italic">
                                {user.data.email}
                            </p>
                        </div>
                    </div>
                    <!-- Edit Profile Button -->
                    <button
                        class="bg-blue-500 text-white px-4 py-2 rounded-md transition duration-300 hover:bg-blue-700"
                        onclick={() => (editMode = true)}
                    >
                        Edit Profile
                    </button>
                </header>
            </section>
        {/if}
    </main>
{:else}
    <p class="text-center text-gray-400">No user data available.</p>
{/if}
