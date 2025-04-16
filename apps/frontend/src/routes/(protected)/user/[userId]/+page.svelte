<script lang="ts">
	import GameHistory from "$lib/components/Stats/GameHistory.svelte";
	import UserStats from "$lib/components/Stats/UserStats.svelte";
	import Avatar from "$lib/components/Avatar.svelte";
	import { Home } from "@lucide/svelte";
	import { goto } from "$app/navigation";
	import type { PageData } from "./$types";
	import { client } from "$lib/trpc";

	let { data }: { data: PageData } = $props();

	let blocked = $state(data.isBlocked); // State to track if the user is blocked

	async function handleBlock() {
		if (blocked) {
			await client.block.remove.mutate(data.user.id);
		} else {
			await client.block.add.mutate(data.user.id);
		}
		blocked = !blocked; // Toggle the blocked state
	}

	let arrowLeft = $state(-100); // Initial position of the arrow

	function goBack() {
		// Slide the arrow further to the left
		arrowLeft -= 50;

		// Wait for 1 second before redirecting
		setTimeout(() => {
			if (history.length > 1) {
				history.back();
			} else {
				goto("/stats");
			}
		}, 300); // 1 second delay
	}

	function goToStats() {
		goto("/stats"); // Redirect to the /stats page
	}
</script>

<main class="relative min-h-screen bg-black overflow-hidden">
	<!-- Background Grid Animation -->
	<div class="absolute inset-0 pointer-events-none z-0">
		<div
			class="absolute inset-0 bg-[size:40px_40px] bg-[linear-gradient(to_right,#4a55681a_1px,transparent_1px),linear-gradient(to_bottom,#4a55681a_1px,transparent_1px)] opacity-50 animate-[backgroundPan_20s_linear_infinite]"
		></div>
		<div
			class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"
		></div>
	</div>

	<!-- Main Content -->
	<section class="relative z-10 px-6 py-12 max-w-5xl mx-auto">
		<div class="relative">
			<!-- Back Arrow -->
			<button
				class="absolute top-[32%] transform -translate-y-1/2 text-white hover:text-gray-300 active:text-gray-500 transition-all duration-300 text-5xl bg-transparent cursor-pointer"
				style={`left: ${arrowLeft}px;`}
				onclick={goBack}
				aria-label="Go Back"
			>
				←
			</button>

			<!-- House Button -->
			<button
				class="absolute top-[calc(32%+60px)] left-[-98px] transform -translate-y-1/2 text-white hover:text-gray-300 active:text-gray-500 transition-all duration-300 text-4xl bg-transparent cursor-pointer group"
				onclick={goToStats}
				aria-label="Go to Stats"
			>
				<Home class="w-10 h-10 stroke-current" />
			</button>

			<!-- Profile Box -->
			<header
				class="flex items-center p-8 bg-black/40 backdrop-blur-sm rounded-xl shadow-lg border border-white/10 mb-8"
			>
				<!-- Avatar and User Info -->
				<Avatar
					name={data.user.name}
					avatar={data.user.avatar}
					class="w-24 h-24 mr-6 text-3xl"
				></Avatar>
				<div>
					<h1 class="text-3xl font-extrabold text-white retro-glow">
						{data.user.name}
					</h1>
				</div>
				{#if !blocked}
					<button
						class="ml-auto px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 active:bg-red-700 transition-all duration-300"
						onclick={handleBlock}
					>
						Block
					</button>
				{:else}
					<button
						class="ml-auto px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 active:bg-green-700 transition-all duration-300"
						onclick={handleBlock}
					>
						Unblock
					</button>
				{/if}
			</header>
		</div>

		<!-- User Stats and Game History -->
		<div class="flex flex-row flex-wrap gap-x-6 gap-y-6">
			<!-- Game History -->
			<div class="flex-1 min-w-[300px] skew-[1deg]">
				<GameHistory
					GameHistory={data.gameHistory.map((game) => ({
						...game,
						createdAt: game.createdAt ?? "",
						updatedAt: game.updatedAt ?? "",
					}))}
				/>
			</div>

			<!-- User Stats -->
			<div class="flex-1 min-w-[300px] skew-[1deg]">
				<UserStats
					userStats={{
						...data.userStats,
						highestScore: data.userStats.highestScore ?? 0,
					}}
					userData={{ ...data.user }}
				/>
			</div>
		</div>
	</section>
</main>
