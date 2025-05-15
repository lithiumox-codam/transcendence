<script lang="ts">
	import Avatar from "../Avatar.svelte";

	type Player = {
		id: number;
		name: string;
		avatar: string | null;
		score: number | null;
	};

	type Game = {
		id: number;
		createdAt: string;
	};

	type Match = {
		game: Game;
		players: Player[];
		userId: number;
	};

	let {
		matches,
		maxHeight = "max-h-96",
	}: { matches: Match[]; maxHeight?: string } = $props();

	function getResult(
		userScore: number | null,
		opponentScore: number | null,
	): string {
		if (userScore === null || opponentScore === null) return "Unknown";
		return userScore > opponentScore
			? "Win"
			: userScore < opponentScore
				? "Loss"
				: "Draw";
	}
</script>

<div class="w-full max-w-4xl mx-auto group text-white relative">
	<div
		class="relative bg-black/10 border border-white/10 rounded-xl p-6
		shadow-[0_0_20px_rgba(0,255,255,0.05)] backdrop-blur-sm"
	>
		<h2
			class="mb-4 text-center text-2xl font-extrabold tracking-widest text-white select-none"
		>
			Match History
		</h2>

		{#if matches.length === 0}
			<p class="text-center text-gray-400 select-none">
				No match history available.
			</p>
		{:else}
			<div class={`space-y-2 overflow-y-auto ${maxHeight}`}>
				{#each matches as { players, userId }}
					{@const userScore =
						players.find((p) => p.id === userId)?.score ?? null}
					{@const sortedPlayers = [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))}
					{@const opponentPlayer = 
						sortedPlayers[0]?.id !== userId
							? sortedPlayers[0]
							: sortedPlayers[1]
					}
					<div
						class="flex items-center justify-between p-4 border border-white/10 bg-white/5 shadow-lg rounded-lg transition duration-300 hover:bg-white/10"
					>
						<div class="flex items-center space-x-2 w-1/3 min-w-0">
							<div class="min-w-0 flex items-center">
								<Avatar
									name={players.find((p) => p.id === userId)
										?.name || "Unknown"}
									avatar={players.find((p) => p.id === userId)
										?.avatar || null}
									class="w-8 h-8 mr-2 min-w-8 min-h-8"
								/>
								<p
									class="text-sm font-semibold text-white truncate select-none"
								>
									{players.find((p) => p.id === userId)
										?.name || "Unknown"}
								</p>
							</div>
						</div>

						<div class="text-center w-1/3 flex-shrink-0">
							<p
								class={`text-xs select-none font-bold ${
									getResult(userScore, opponentPlayer.score) ===
									"Win"
										? "text-green-400"
										: getResult(
													userScore,
													opponentPlayer.score,
											  ) === "Loss"
											? "text-red-400"
											: "text-gray-400"
								}`}
							>
								{getResult(userScore, opponentPlayer.score)}
							</p>
							<p
								class="text-xs text-gray-400 truncate select-none"
							>
								{userScore ?? 0}-{opponentPlayer.score ?? 0}
							</p>
						</div>
						
						<div
							class="flex items-center space-x-2 w-1/3 min-w-0 justify-end"
						>
							<div class="text-right min-w-0 flex items-center">
								<p
									class="text-xs font-semibold text-white select-none truncate"
								>
									{opponentPlayer.name || "Unknown"}
								</p>
								<Avatar
									name={opponentPlayer.name || "Unknown"}
									avatar={opponentPlayer.avatar || null}
									class="w-8 h-8 ml-2 min-w-8 min-h-8"
								/>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
