<script lang="ts">
	import { getContext, onMount } from "svelte";
	import { UserClass } from "$lib/classes/User.svelte";
	import Avatar from "$lib/components/Avatar.svelte";
	import { client } from "$lib/trpc";
	import UpdateUser from "$lib/components/UpdateUser.svelte";
	import { Trash2 } from "@lucide/svelte";
	import UserStats from "$lib/components/Stats/UserStats.svelte";
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
			<section class="px-6 py-12 max-w-5xl mx-auto">
				<header
					class="flex items-center justify-between p-8 bg-gray-950 rounded-xl shadow-lg border border-gray-800 mb-8"
				>
					<UpdateUser
						user={user.data}
						on:updateComplete={() => (editMode = false)}
					/>
				</header>
			</section>
		{:else}
			<section class="px-6 py-12 max-w-5xl mx-auto">
				<header
					class="flex items-center justify-between p-8 bg-gray-950 rounded-xl shadow-lg border border-gray-800 mb-8 relative"
				>
					<div class="flex items-center relative">
						<div class="relative group">
							<Avatar
								name={user.data.name}
								avatar={user.data.avatar}
								class="w-24 h-24 mr-6 text-3xl"
							/>
							{#if user.data.avatar}
								<button
									class="absolute top-16 right-4 bg-gray-400/50 text-white p-2 rounded-full hover:bg-red-700/90 transition duration-300"
									onclick={deleteAvatar}
									aria-label="Delete Avatar"
								>
									<Trash2 class="w-4 h-4" />
								</button>
							{/if}
						</div>
						<div>
							<h1
								class="text-3xl font-extrabold text-white truncate"
							>
								{user.data.name}
							</h1>
							<p class="text-lg text-gray-400 italic truncate">
								{user.data.email}
							</p>
						</div>
					</div>
					<button
						class="bg-blue-500 text-white px-4 py-2 rounded-md transition duration-300 hover:bg-blue-700"
						onclick={() => (editMode = true)}
					>
						Edit Profile
					</button>
				</header>
			</section>
		{/if}
		<div class="flex flex-row flex-wrap gap-x-6 gap-y-6">
			<div
				class="flex-1 min-w-[300px] skew-[1deg] overflow-scroll max-h-[400px]"
			>
				{#each history as { game, players }}
					<div
						class="flex items-center p-4 bg-white/5 shadow-lg rounded-lg transition duration-300 hover:bg-white/10"
					>
						<div class="flex-1">
							<p class="text-sm text-gray-300/40">
								{game.createdAt}
							</p>
							<p class="text-sm text-gray-300/40">
								{players
									.map((player) => `${player.name}${player.score !== null && player.score !== undefined ? ` (${player.score})` : ''}`)
									.join(", ")}
							</p>
						</div>
					</div>
				{/each}
			</div>

			<div class="flex-1 min-w-[300px] skew-[1deg]">
				{#if stats}
					<UserStats
						userStats={stats}
						userData={{ name: user.data.name }}
					/>
				{:else}
					<p class="text-center text-gray-400">Loading...</p>
				{/if}
			</div>
		</div>
	</main>
{:else}
	<p class="text-center text-gray-400">No user data available.</p>
{/if}
