<script lang="ts">
    import { getContext } from "svelte";
    import { UserClass } from "$lib/classes/User.svelte";
    import Avatar from "$lib/components/Avatar.svelte";
    import UpdateUser from "$lib/components/UpdateUser.svelte";

    const user = getContext<UserClass>("user");
</script>

{#if user.data}
    <main class="relative min-h-screen bg-black text-white">
        <section class="px-6 py-12 max-w-5xl mx-auto">
            <header
                class="flex items-center p-8 bg-gray-950 rounded-xl shadow-lg border border-gray-800 mb-8"
            >
                <Avatar
                    name={user.data.name}
                    avatar={user.data.avatar}
                    class="w-24 h-24 mr-6"
                />
                <div>
                    <h1 class="text-3xl font-extrabold text-white">
                        {user.data.name}
                    </h1>
                    <p class="text-lg text-gray-400 italic">
                        {user.data.email}
                    </p>
                </div>
            </header>
            <UpdateUser user={user.data} />
        </section>
    </main>
{/if}
