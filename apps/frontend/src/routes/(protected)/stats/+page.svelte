<script lang="ts">
	import type { PageData } from "./$types";
	import Leaderboard from "$lib/components/Stats/Leaderboard.svelte";
	import UserStats from "$lib/components/Stats/UserStats.svelte";

	let { data }: { data: PageData } = $props();
</script>

<main
	class="relative min-h-screen w-full px-6 py-12 flex justify-around items-start gap-12 bg-black overflow-hidden"
>
	<!-- Background Effects -->
	<div class="absolute inset-0 pointer-events-none z-0">
		<div
			class="absolute inset-0 bg-[size:40px_40px] bg-[linear-gradient(to_right,#4a55681a_1px,transparent_1px),linear-gradient(to_bottom,#4a55681a_1px,transparent_1px)] opacity-50 animate-[backgroundPan_20s_linear_infinite]"
		></div>
		<div
			class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"
		></div>
	</div>

	<!-- Content -->

	<Leaderboard leaderboard={data.leaderboard} />

	<UserStats
		userStats={{
			...data.userStats,
			highestScore: data.userStats.highestScore ?? 0,
		}}
		userData={{
			...data.user[0],
		}}
	/>
</main>
