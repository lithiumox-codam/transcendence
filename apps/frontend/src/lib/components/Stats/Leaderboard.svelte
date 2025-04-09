<script lang="ts">
	import { goto } from "$app/navigation";

	type leaderboardEntry = {
		userId: number;
		userName: string;
		userEmail: string;
		userAvatar: string | null;
		totalScore: number;
		gamesPlayed: number;
	};

	let {
		leaderboard,
	}: {
		leaderboard: leaderboardEntry[];
	} = $props();

	const rest = leaderboard.slice(3);

	function viewProfile(userId: number) {
		goto(`/user/${userId}`);
	}
</script>

<div class="w-full max-w-md mx-auto group text-white relative">
	<div
		class="bg-black/10 border border-white/10 rounded-xl p-6
		skew-x-3 shadow-[0_0_20px_rgba(0,255,255,0.05)] backdrop-blur-sm"
	>
		<h2
			class="mb-3 text-2xl font-bold text-center text-white tracking-widest"
		>
			Leaderboard
		</h2>

		{#if leaderboard.length === 0}
			<p class="text-gray-400 text-center text-sm">
				No leaderboard data available.
			</p>
		{:else}
			{@render FirstRank(leaderboard[0])}
			{#if leaderboard.length > 1}
				{@render SecondRank(leaderboard[1])}
			{/if}
			{#if leaderboard.length > 2}
				{@render ThirdRank(leaderboard[2])}
			{/if}
			{#each rest as item}
				{@render OtherRanks(item)}
			{/each}
		{/if}
	</div>
</div>

<!-- 🥇 FIRST PLACE -->
{#snippet FirstRank(item: leaderboardEntry)}
	<div
		class="flex mb-2 items-center justify-between p-3 rounded-md border border-yellow-300 bg-yellow-400/10 hover:bg-yellow-400/20 transition-all duration-300 shadow"
	>
		<div class="flex items-center gap-2 w-1/3 min-w-0">
			<button
				class="shrink-0 cursor-pointer"
				onclick={() => viewProfile(item.userId)}
			>
				<img
					src={item.userAvatar}
					alt="Avatar"
					class="w-8 h-8 rounded-full border-2 border-yellow-300 object-cover"
				/>
			</button>
			<button
				class="text-yellow-200 cursor-pointer font-semibold truncate max-w-[90px]"
				onclick={() => viewProfile(item.userId)}
			>
				{item.userName}
			</button>
		</div>
		<div class="text-yellow-200/50 text-xs text-center w-1/3">
			{item.gamesPlayed}
			{item.gamesPlayed === 1 ? "game" : "games"}
		</div>
		<div class="text-yellow-300 font-bold text-right w-1/3">
			{item.totalScore}
		</div>
	</div>
{/snippet}

<!-- 🥈 SECOND PLACE -->
{#snippet SecondRank(item: leaderboardEntry)}
	<div
		class="flex mb-2 items-center justify-between p-3 rounded-md border border-gray-300 bg-gray-300/10 hover:bg-gray-300/20 transition-all duration-300 shadow"
	>
		<div class="flex items-center gap-2 w-1/3 min-w-0">
			<button
				class="shrink-0 cursor-pointer"
				onclick={() => viewProfile(item.userId)}
			>
				<img
					src={item.userAvatar}
					alt="Avatar"
					class="w-8 h-8 rounded-full border-2 border-gray-300 object-cover shrink-0"
				/>
			</button>
			<button
				class="text-gray-200 cursor-pointer font-semibold truncate max-w-[90px]"
				onclick={() => viewProfile(item.userId)}
			>
				{item.userName}
			</button>
		</div>
		<div class="text-white/50 text-xs text-center w-1/3">
			{item.gamesPlayed}
			{item.gamesPlayed === 1 ? "game" : "games"}
		</div>
		<div class="text-gray-100 font-bold text-right w-1/3">
			{item.totalScore}
		</div>
	</div>
{/snippet}

<!-- 🥉 THIRD PLACE -->
{#snippet ThirdRank(item: leaderboardEntry)}
	<div
		class="flex mb-2 items-center justify-between p-3 rounded-md border border-orange-400 bg-orange-400/10 hover:bg-orange-400/20 transition-all duration-300 shadow"
	>
		<div class="flex items-center gap-2 w-1/3 min-w-0">
			<button
				class="shrink-0 cursor-pointer"
				onclick={() => viewProfile(item.userId)}
			>
				<img
					src={item.userAvatar}
					alt="Avatar"
					class="w-8 h-8 rounded-full border-2 border-orange-400 object-cover shrink-0"
				/>
			</button>
			<button
				class="text-orange-100 cursor-pointer font-semibold truncate max-w-[90px]"
				onclick={() => viewProfile(item.userId)}
			>
				{item.userName}
			</button>
		</div>
		<div class="text-orange-200/50 text-xs text-center w-1/3">
			{item.gamesPlayed}
			{item.gamesPlayed === 1 ? "game" : "games"}
		</div>
		<div class="text-orange-300 font-bold text-right w-1/3">
			{item.totalScore}
		</div>
	</div>
{/snippet}

<!-- Other Rankings -->
{#snippet OtherRanks(item: leaderboardEntry)}
	<div
		class="flex mb-2 items-center justify-between p-3 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300"
	>
		<div class="w-1/3 min-w-0">
			<button
				class="text-white cursor-pointer font-medium truncate max-w-[90px]"
				onclick={() => viewProfile(item.userId)}
			>
				{item.userName.length > 10
					? item.userName.slice(0, 10) + "..."
					: item.userName}
			</button>
		</div>
		<div class="text-gray-300/50 text-xs text-center w-1/3">
			{item.gamesPlayed}
			{item.gamesPlayed === 1 ? "game" : "games"}
		</div>
		<div class="text-white font-semibold text-right w-1/3">
			{item.totalScore}
		</div>
	</div>
{/snippet}
