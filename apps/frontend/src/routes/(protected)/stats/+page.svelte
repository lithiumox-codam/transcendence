<script lang="ts">
	import type { PageData } from "./$types";
	import { getContext, onMount } from "svelte";
	import { client } from "$lib/trpc";

	import Leaderboard from "$lib/components/Stats/Leaderboard.svelte";
	import UserStats from "$lib/components/Stats/UserStats.svelte";
	import type { Game, User } from "@repo/database/types";
	import { UserClass } from "$lib/classes/User.svelte";

	// import GameHistory from "$lib/components/Stats/GameHistory.svelte";
	import MatchHistory from "$lib/components/Stats/MatchHistory.svelte";

	const user = getContext<UserClass>("user");

	let history = $state<
		{ game: Game; players: (User & { score?: number | null })[] }[]
	>([]);

	onMount(async () => {
		try {
			// stats = await client.stats.userStats.query();
			history = await client.game.history.query();
		} catch (error) {
			console.error("Failed to fetch user stats", error);
		}
	});

	let { data }: { data: PageData } = $props();
</script>

<main
	class="relative min-h-screen w-full px-6 py-12 flex justify-around items-stretch gap-12 bg-black overflow-hidden"
>
	<!-- Background Effects -->
	<div class="absolute inset-0 pointer-events-none z-0">
		<div
			class="absolute inset-0 bg-[size:40px_40px] bg-[linear-gradient(to_right,#4a55681a_1px,transparent_1px),linear-gradient(to_bottom,#4a55681a_1px,transparent_1px)] opacity-50"
		></div>
		<div
			class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl"
		></div>
	</div>

	<!-- Content -->
	<div class="flex justify-around items-stretch gap-12 w-full">
		<Leaderboard leaderboard={data.leaderboard} />

		<!-- <Leaderboard leaderboard={data.leaderboard} /> -->

		<!-- <GameHistory
		GameHistory={data.gameHistory.map((game) => ({
			...game,
			createdAt: game.createdAt ?? "",
			updatedAt: game.updatedAt ?? "",
		}))}
	/> -->
		<!-- <GameHistory
			GameHistory={data.gameHistory.map((game) => ({
				...game,
				createdAt: game.createdAt ?? "",
				updatedAt: game.updatedAt ?? "",
			}))}
			maxHeight="max-h-150"
		/> -->
		<MatchHistory
			matches={history.map(({ game, players }) => ({
				game,
				players,
				userId: user.data.id,
			}))}
			maxHeight="max-h-150"
		/>

		<UserStats
			userStats={{
				...data.userStats,
				highestScore: data.userStats.highestScore ?? 0,
			}}
			userData={{
				...data.user[0],
			}}
		/>
	</div>
</main>
