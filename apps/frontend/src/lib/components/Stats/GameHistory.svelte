<script lang="ts">
	type GameHistory = {
		gameId: number;
		playerScore: number;
		gameStatus: string;
		createdAt: string;
		updatedAt: string;
	};

	// Props
	let { GameHistory }: { GameHistory: GameHistory[] } = $props();

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString() + " " + date.toLocaleTimeString();
	}
</script>

<div class="w-full max-w-4xl mx-auto group text-white relative">
	<!-- Match History Box -->
	<div
		class="relative bg-black/10 border border-white/10 rounded-xl p-6
     shadow-[0_0_20px_rgba(0,255,255,0.05)] backdrop-blur-sm"
	>
		<h2
			class="mb-4 text-center text-2xl font-extrabold tracking-widest text-white"
		>
			Match History
		</h2>

		{#if GameHistory.length === 0}
			<p class="text-center text-gray-400">No match history available.</p>
		{:else}
			<div class="space-y-4">
				{#each GameHistory as match}
					<div
						class="bg-white/5 border border-white/10 p-4 rounded-md hover:bg-blue-500/10 transition duration-300"
					>
						<div class="flex justify-between items-center">
							<p class="text-sm text-gray-300">
								<strong>Game ID:</strong>
								{match.gameId}
							</p>
							<p
								class={`text-sm font-semibold ${
									match.gameStatus === "finished"
										? "text-green-400"
										: "text-yellow-400"
								}`}
							>
								{match.gameStatus}
							</p>
						</div>
						<div class="flex justify-between items-center mt-2">
							<p class="text-sm text-gray-300">
								<strong>Score:</strong>
								{match.playerScore}
							</p>
							<p class="text-sm text-gray-300">
								{formatDate(match.updatedAt)}
							</p>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
