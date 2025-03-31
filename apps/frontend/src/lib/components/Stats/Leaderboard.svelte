<script lang="ts">
	import { goto } from "$app/navigation";

	type leaderboardEntry = {
		userId: number;
		userName: string;
		userEmail: string;
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

<!-- Shared Base Style -->
<div class="w-full max-w-md mx-auto h-full group space-y-2">
	<h2 class="text-2xl font-bold text-center text-white group-hover:skew-0 skew-2 transition-transform duration-300">Leaderboard</h2>

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

<!-- 🥇 FIRST PLACE -->
{#snippet FirstRank(item: leaderboardEntry)}
	<div
		class="flex items-center bg-yellow-400/20 px-4 py-3 rounded-md mb-1 border border-yellow-300 shadow-[0_0_15px_rgba(255,215,0,0.4)] text-base group-hover:skew-0 skew-2 transition-transform duration-300"
	>
		<div class="flex items-center gap-2 w-1/3 min-w-0">
			<img
				src="/favicon.png"
				alt="Avatar"
				class="w-8 h-8 rounded-full border-2 border-yellow-300 object-cover shrink-0 shadow-md"
			/>
			<button
				class="text-yellow-100 font-semibold truncate max-w-[90px] hover:underline"
				onclick={() => viewProfile(item.userId)}
			>
				{item.userName.length > 10
					? `${item.userName.slice(0, 10)}...`
					: item.userName}
			</button>
		</div>
		<div class="text-yellow-100 text-sm text-center w-1/3">
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
		class="flex items-center bg-gray-300/20 px-4 py-3 rounded-md mb-1 border border-gray-300 shadow-[0_0_12px_rgba(192,192,192,0.3)] text-base group-hover:skew-0 skew-2 transition-transform duration-300"
	>
		<div class="flex items-center gap-2 w-1/3 min-w-0">
			<img
				src="/favicon.png"
				alt="Avatar"
				class="w-8 h-8 rounded-full border-2 border-gray-300 object-cover shrink-0 shadow-sm"
			/>
			<button
				class="text-gray-200 font-semibold truncate max-w-[90px] hover:underline"
				onclick={() => viewProfile(item.userId)}
			>
				{item.userName.length > 10
					? `${item.userName.slice(0, 10)}...`
					: item.userName}
			</button>
		</div>
		<div class="text-gray-300 text-sm text-center w-1/3">
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
		class="flex items-center bg-orange-400/20 px-4 py-3 rounded-md mb-1 border border-orange-400 shadow-[0_0_10px_rgba(205,127,50,0.3)] text-base group-hover:skew-0 skew-2 transition-transform duration-300"
	>
		<div class="flex items-center gap-2 w-1/3 min-w-0">
			<img
				src="/favicon.png"
				alt="Avatar"
				class="w-8 h-8 rounded-full border-2 border-orange-400 object-cover shrink-0 shadow"
			/>
			<button
				class="text-orange-100 font-semibold truncate max-w-[90px] hover:underline"
				onclick={() => viewProfile(item.userId)}
			>
				{item.userName.length > 10
					? `${item.userName.slice(0, 10)}...`
					: item.userName}
			</button>
		</div>
		<div class="text-orange-100 text-sm text-center w-1/3">
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
		class="flex items-center bg-gradient-to-r from-white/5 via-white/10 to-white/5 px-4 py-2 rounded-md border border-white/10 text-sm skew-2 group-hover:skew-0 transition-transform duration-300 hover:bg-white/10"
	>
		<div class="w-1/3 min-w-0">
			<button
				class="text-white font-medium truncate hover:underline max-w-[90px]"
				onclick={() => viewProfile(item.userId)}
			>
				{item.userName.length > 10
					? item.userName.slice(0, 10) + "..."
					: item.userName}
			</button>
		</div>
		<div class="text-gray-300 text-xs text-center w-1/3">
			{item.gamesPlayed}
			{item.gamesPlayed === 1 ? "game" : "games"}
		</div>
		<div class="text-gray-100 font-semibold text-right w-1/3">
			{item.totalScore}
		</div>
	</div>
{/snippet}
