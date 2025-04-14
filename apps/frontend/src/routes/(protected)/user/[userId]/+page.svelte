<script lang="ts">
	import GameHistory from "$lib/components/Stats/GameHistory.svelte";
	import UserStats from "$lib/components/Stats/UserStats.svelte";
	import Avatar from "$lib/components/Avatar.svelte";
	import { goto } from "$app/navigation"; // Import goto for navigation
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();

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
				class="absolute top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 active:text-gray-500 transition-all duration-300 text-5xl bg-transparent cursor-pointer"
				style={`left: ${arrowLeft}px;`}
				onclick={goBack}
				aria-label="Go Back"
			>
				←
			</button>

			<!-- Profile Box -->
			<header
				class="flex items-center p-8 bg-black/40 backdrop-blur-sm rounded-xl shadow-lg border border-white/10 mb-8"
			>
				<!-- Avatar and User Info -->
				<Avatar
					name={data.user.name}
					avatar={data.user.avatar}
					class="w-24 h-24 mr-6"
				></Avatar>
				<div>
					<h1 class="text-3xl font-extrabold text-white retro-glow">
						{data.user.name}
					</h1>
					<!-- <p class="text-lg text-gray-300 italic">{data.user.email}</p> -->
				</div>
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
