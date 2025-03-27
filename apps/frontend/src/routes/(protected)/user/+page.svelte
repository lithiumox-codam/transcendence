<script lang="ts">
	import FriendSection from "$lib/components/FriendSection.svelte";
	import LogOutButton from "$lib/components/LogOutButton.svelte";
	import ProfileSection from "$lib/components/ProfileSection.svelte";
	import SettingsSection from "$lib/components/SettingsSection.svelte";

	let activeSection: "profile" | "friends" | "settings" = $state("profile");
</script>

<main class="flex min-h-screen bg-gray-900 text-white">
	<!-- Sidebar Navigation (Fixed) -->
	<aside
		class="w-64 bg-gray-800 border-r border-gray-700 p-6 flex flex-col h-screen sticky top-0"
	>
		<!-- Navigation Options -->
		<nav class="flex flex-col space-y-4 flex-grow mt-6">
			<button
				class="nav-button {activeSection === 'profile' ? 'active' : ''}"
				onclick={() => (activeSection = "profile")}
			>
				Profile
			</button>
			<button
				class="nav-button {activeSection === 'friends' ? 'active' : ''}"
				onclick={() => (activeSection = "friends")}
			>
				Friends
			</button>
			<button
				class="nav-button {activeSection === 'settings'
					? 'active'
					: ''}"
				onclick={() => (activeSection = "settings")}
			>
				Settings
			</button>
		</nav>
	</aside>

	<!-- Scrollable Content Area -->
	<section class="content-area">
		{#if activeSection === "profile"}
			<ProfileSection />
		{:else if activeSection === "friends"}
			<FriendSection />
		{:else if activeSection === "settings"}
			<SettingsSection />
		{/if}
	</section>

	<LogOutButton />
</main>

<style>
	.nav-button {
		padding: 12px 16px;
		font-size: 16px;
		font-weight: 500;
		border-radius: 6px;
		text-align: left;
		transition: background 0.3s ease;
		background-color: transparent;
		color: white;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
	}

	.nav-button:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.content-area {
		flex: 1;
		overflow-y: auto;
		height: calc(100vh - 20px);
		padding: 20px;
		padding-bottom: 60px;
		scroll-behavior: smooth;
	}

	.content-area::-webkit-scrollbar {
		width: 8px;
	}

	.content-area::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 4px;
	}

	.content-area::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05);
	}

	.nav-button.active {
		background-color: rgba(255, 255, 255, 0.2);
		color: #ffffff;
		font-weight: bold;
		border-left: 4px solid #007bff;
	}
</style>
