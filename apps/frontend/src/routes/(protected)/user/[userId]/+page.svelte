<script lang="ts">
	import GameHistory from "$lib/components/Stats/GameHistory.svelte";
	import UserStats from "$lib/components/Stats/UserStats.svelte";
	import Avatar from "$lib/components/Avatar.svelte";
	import { Home } from "@lucide/svelte";
	import { goto } from "$app/navigation";
	import type { PageData } from "./$types";
	import { client } from "$lib/trpc";

	let { data }: { data: PageData } = $props();
	let arrowLeft = $state(-100);

	let blocked = $state(data.isBlocked); // State to track if the user is blocked

	async function handleBlock() {
		if (blocked) {
			await client.block.remove.mutate(data.user.id);
		} else {
			await client.block.add.mutate(data.user.id);
		}
		blocked = !blocked; // Toggle the blocked state
	}

	function goBack() {
		arrowLeft -= 50;

		setTimeout(() => {
			if (history.length > 1) {
				history.back();
			} else {
				goto("/stats");
			}

			setTimeout(() => {
				arrowLeft = -100;
			}, 100);
		}, 300);
	}

	function goToStats() {
		goto("/stats");
	}
</script>

<main class="relative min-h-screen bg-black overflow-hidden">
	<div class="absolute inset-0 pointer-events-none z-0">
		<div
			class="absolute inset-0 bg-[size:40px_40px] bg-[linear-gradient(to_right,#4a55681a_1px,transparent_1px),linear-gradient(to_bottom,#4a55681a_1px,transparent_1px)] opacity-50 animate-[backgroundPan_20s_linear_infinite]"
		></div>
		<div
			class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"
		></div>
	</div>

	<section class="relative z-10 px-6 py-12 max-w-5xl mx-auto">
		<div class="relative">
			<button
				class="absolute top-[32%] transform -translate-y-1/2 text-white hover:text-gray-300 active:text-gray-500 transition-all duration-300 text-5xl bg-transparent cursor-pointer"
				style={`left: ${arrowLeft}px;`}
				onclick={goBack}
				aria-label="Go Back"
			>
				←
			</button>

			<button
				class="absolute top-[calc(32%+60px)] left-[-98px] transform -translate-y-1/2 text-white hover:text-gray-300 active:text-gray-500 transition-all duration-300 text-4xl bg-transparent cursor-pointer group"
				onclick={goToStats}
				aria-label="Go to Stats"
			>
				<Home class="w-10 h-10 stroke-current" />
			</button>

			<header
				class="flex items-center p-8 bg-black/40 backdrop-blur-sm rounded-xl shadow-lg border border-white/10 mb-8"
			>
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
						class="ml-auto px-4 py-2 bg-gray-400/20 text-white font-bold rounded-lg hover:bg-red-500/50 active:bg-red-700 transition-all duration-300"
						onclick={handleBlock}
					>
						Block
					</button>
				{:else}
					<button
						class="ml-auto px-4 py-2 bg-gray-600/30 text-white font-bold rounded-lg hover:bg-green-400/50 active:bg-green-700 transition-all duration-300"
						onclick={handleBlock}
					>
						Unblock
					</button>
				{/if}
			</header>
		</div>

		<div class="flex flex-row flex-wrap gap-x-6 gap-y-6">
			<div class="flex-1 min-w-[300px] skew-[1deg]">
				<GameHistory
					GameHistory={data.gameHistory.map((game) => ({
						...game,
						createdAt: game.createdAt ?? "",
						updatedAt: game.updatedAt ?? "",
					}))}
				/>
			</div>

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
