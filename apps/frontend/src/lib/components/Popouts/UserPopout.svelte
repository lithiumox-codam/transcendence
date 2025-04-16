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

<main class="flex h-full w-full overflow-hidden bg-black/10 backdrop-blur-sm">
	<!-- Sidebar Navigation -->
	<aside
		class="w-1/4 min-w-40 max-w-56 bg-gradient-to-b from-blue-500/5 to-cyan-400/5 border-r border-white/10 p-4 flex flex-col overflow-y-auto"
	>
		<!-- Navigation Options -->
		<nav class="flex flex-col space-y-3 flex-grow mt-2">
			{#each [...userNav.entries()] as [key, { displayName }]}
				<button
					class="p-3 text-sm font-medium rounded-md text-left
                          transition-colors duration-300 ease-in-out bg-transparent
                          text-white cursor-pointer flex items-center hover:bg-white/10
                          {activeSection === key
						? 'bg-white/10 font-bold border-l-4 border-cyan-400/30'
						: ''}"
					onclick={() => (activeSection = key)}
				>
					{displayName}
				</button>
			{/each}
		</nav>

		<!-- Log Out Button -->
		<LogOutButton />
	</aside>

	<!-- Scrollable Content Area -->
	<section
		class="flex-1 overflow-y-auto p-6 bg-black/10 backdrop-blur-sm border-l border-gray-800"
	>
		{#if activeSection}
			{@const Component = userNav.get(activeSection)?.component}
			<Component />
		{/if}
	</section>
</main>
