<script lang="ts">
	import { getContext, onMount } from "svelte";
	import { UserClass } from "$lib/classes/User.svelte";
	import Avatar from "$lib/components/Avatar.svelte";
	import { client } from "$lib/trpc";
	import UpdateUser from "$lib/components/UpdateUser.svelte";
	import { Trash2 } from "@lucide/svelte";
	import UserStats from "$lib/components/Stats/UserStats.svelte";
	import MatchHistory from "$lib/components/Stats/MatchHistory.svelte";
	import type { Game, User } from "@repo/database/types";

	const user = getContext<UserClass>("user");

	let editMode = $state(false);
	let errorMessage = $state("");

	let stats = $state<{
		wins: number;
		losses: number;
		winLossRatio: number;
		totalGames: number;
		totalScore: number;
		averageScore: number;
		highestScore: number | null;
	} | null>(null);

	let history = $state<
		{ game: Game; players: (User & { score?: number | null })[] }[]
	>([]);

	onMount(async () => {
		try {
			stats = await client.stats.userStats.query();
			history = await client.game.history.query();
		} catch (error) {
			console.error("Failed to fetch user stats", error);
		}
	});

	async function deleteAvatar() {
		try {
			await client.user.deleteAvatar.mutate();
			if (user.data) {
				user.data.avatar = null;
			}
		} catch (error) {
			errorMessage = "Failed to delete avatar. Please try again.";
			console.error(error);
		}
	}
</script>

{#if user.data}
	<main class="relative text-white">
		{#if editMode}
		<section class="px-6 py-8 max-w-5xl mx-auto">
			<!-- <header
				class="relative bg-black/10 border border-white/10 rounded-xl p-6 shadow-[0_0_20px_rgba(0,255,255,0.05)] backdrop-blur-sm flex flex-col gap-6"
			>
				<h2 class="text-2xl font-extrabold text-center text-white">
					Edit Profile
				</h2> -->
				<UpdateUser
					user={user.data}
					on:updateComplete={() => (editMode = false)}
				/>
			<!-- </header> -->
		</section>
		{:else}
			<section class="px-6 py-8 max-w-5xl mx-auto">
				<header
					class="relative bg-black/10 border border-white/10 rounded-xl p-6 shadow-[0_0_20px_rgba(0,255,255,0.05)] backdrop-blur-sm flex items-center justify-between"
				>
					<div class="flex items-center min-w-0">
						<div class="relative group flex-shrink-0">
							<Avatar
								name={user.data.name}
								avatar={user.data.avatar}
								class="w-24 h-24 mr-6 text-3xl"
							/>
							{#if user.data.avatar}
								<button
									class="absolute top-16 right-4 bg-white/15 border border-white/10 p-2 rounded-full hover:bg-red-600/20 hover:border hover:border-red-500/30 hover:text-red-300 transition duration-100 cursor-pointer"
									onclick={deleteAvatar}
									aria-label="Delete Avatar"
								>
									<Trash2 class="w-4 h-4" />
								</button>
							{/if}
						</div>
						<div class="min-w-0">
							<h1
								class="text-3xl font-extrabold text-white truncate"
								title={user.data.name}
							>
								{user.data.name}
							</h1>
							<p
								class="text-lg text-gray-400 italic truncate"
								title={user.data.email}
							>
								{user.data.email}
							</p>
						</div>
					</div>
					<button
						class="bg-white/5 border border-white/10 p-2.5 rounded-md hover:bg-blue-600/10 cursor-pointer"
						onclick={() => (editMode = true)}
					>
						Edit Profile
					</button>
				</header>
			</section>
			<div class="flex flex-row flex-wrap justify-center gap-x-6 gap-y-6 px-6 max-w-5xl mx-auto">
				<!-- Match History -->
				<div class="flex-1 min-w-[300px] max-w-[500px] w-full sm:w-auto">
					<MatchHistory
						matches={history.map(({ game, players }) => ({
							game,
							players,
							userId: user.data.id,
						}))}
						maxHeight="max-h-64"
					/>
				</div>
			
				<!-- User Stats -->
				<div class="flex-1 min-w-[300px] max-w-[500px] w-full sm:w-auto">
					{#if stats}
						<UserStats
							userStats={stats}
							userData={{ name: user.data.name }}
						/>
					{:else}
						<p class="text-center text-gray-400">No stats available</p>
					{/if}
				</div>
			</div>
		{/if}
	</main>
{:else}
	<p class="text-center text-gray-400">No user data available.</p>
{/if}
