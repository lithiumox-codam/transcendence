<script lang="ts">
	import { client } from "$lib/trpc";
	import type { User } from "@repo/database/types";
	import Avatar from "$lib/components/Avatar.svelte";
	import { goto } from "$app/navigation";

	let blockList = $state<User[]>([]);

	$effect(() => {
		async function fetchBlockList() {
			blockList = await client.block.list.query();
		}
		fetchBlockList();
	});

	function viewProfile(userId: number) {
		goto(`/user/${userId}`);
	}

	async function unblockUser(userId: number) {
		try {
			await client.block.remove.mutate(userId);
			blockList = blockList.filter((user) => user.id !== userId);
		} catch (error) {
			console.error("Failed to unblock user:", error);
		}
	}
</script>

<main class="py-10 px-6 max-w-5xl mx-auto">
	{#if blockList.length > 0}
		<ul class="space-y-4">
			{#each blockList as blockedUser (blockedUser.id)}
				<li
					class="flex items-center p-4 bg-white/5 shadow-lg rounded-lg transition duration-300 hover:bg-white/10"
				>
					<button
						class="flex items-center flex-1 text-left cursor-pointer group"
						onclick={() => viewProfile(blockedUser.id)}
					>
						<Avatar
							name={blockedUser.name}
							avatar={blockedUser.avatar}
							class="w-16 h-16 mr-4 text-3xl opacity-80 group-hover:opacity-100 transition-opacity"
						/>
						<div class="flex-1">
							<span
								class="text-lg font-semibold text-white/80 group-hover:text-white transition-colors"
							>
								{blockedUser.name}
							</span>
							<p class="text-sm text-gray-300/40">
								{blockedUser.email}
							</p>
						</div>
					</button>
					<div class="flex gap-2 ml-4">
						<button
							onclick={() => unblockUser(blockedUser.id)}
							class="bg-red-600/20 border border-red-500/30 text-red-300 px-4 py-2 rounded-md transition duration-300 hover:bg-red-600/40 hover:text-red-200 cursor-pointer flex-shrink-0"
							aria-label={`Unblock ${blockedUser.name}`}
						>
							Unblock
						</button>
					</div>
				</li>
			{/each}
		</ul>
	{:else}
		<div
			class="flex flex-col items-center justify-center py-20 text-center"
		>
			<div class="text-6xl mb-6">🚫</div>
			<h3 class="text-2xl font-bold text-white mb-3">No Blocked Users</h3>
			<p class="text-gray-300 max-w-md">
				You haven't blocked anyone yet. Users you block will appear
				here.
			</p>
		</div>
	{/if}
</main>
