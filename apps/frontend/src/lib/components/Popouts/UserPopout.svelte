<script lang="ts">
    import FriendSection from "$lib/components/FriendSection.svelte";
    import LogOutButton from "$lib/components/LogOutButton.svelte";
    import ProfileSection from "$lib/components/ProfileSection.svelte";
    import SettingsSection from "$lib/components/SettingsSection.svelte";
    import type { Component } from "svelte";

    const userNav = new Map<
        string,
        { component: Component; displayName: string }
    >([
        ["profile", { component: ProfileSection, displayName: "Profile" }],
        ["friends", { component: FriendSection, displayName: "Friends" }],
        ["settings", { component: SettingsSection, displayName: "Settings" }],
    ]);

    let activeSection = $state("profile");
</script>

<main class="flex h-full w-full overflow-hidden bg-gray-900 text-white">
    <!-- Sidebar Navigation -->
    <aside
        class="w-1/4 min-w-40 max-w-56 bg-gray-800 border-r border-gray-700 p-2 flex flex-col overflow-y-auto"
    >
        <!-- Navigation Options -->
        <nav class="flex flex-col space-y-2 flex-grow mt-2">
            {#each [...userNav.entries()] as [key, { displayName }]}
                <button
                    class="p-2 px-3 text-sm font-medium rounded-md text-left
                          transition-colors duration-300 ease-in-out bg-transparent
                          text-white cursor-pointer flex items-center hover:bg-white/10
                          {activeSection === key
                        ? 'bg-white/20 font-bold border-l-4 border-blue-500'
                        : ''}"
                    onclick={() => (activeSection = key)}
                >
                    {displayName}
                </button>
            {/each}
        </nav>

        <LogOutButton />
    </aside>

    <!-- Scrollable Content Area -->
    <section
        class="flex-1 overflow-y-auto p-3 scroll-smooth scrollbar-thin scrollbar-thumb-gray-400/20 scrollbar-track-gray-200/5"
    >
        {#if activeSection}
            {@const Component = userNav.get(activeSection)?.component}
            <Component />
        {/if}
    </section>
</main>
