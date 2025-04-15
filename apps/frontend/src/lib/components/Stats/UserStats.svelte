<script lang="ts">
	type userStats = {
		wins: number;
		losses: number;
		totalGames: number;
		totalScore: number;
		averageScore: number;
		highestScore: number;
		rank?: number;
	};

	type userData = {
		name: string;
	};

	// name should be "Your" when looking at your own stats

	let { userStats, userData }: { userStats: userStats; userData: userData } =
		$props();

	const winRatio = userStats.totalGames
		? (userStats.wins / userStats.totalGames) * 100
		: 0;
	const lossRatio = userStats.totalGames
		? (userStats.losses / userStats.totalGames) * 100
		: 0;

	let hovering = $state(false);
	let totalScore = $state(userStats.totalScore);

	function formatNumber(value: number): string {
		if (value >= 1000) {
			return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
		}
		return value.toString();
	}
</script>

<div class="w-full max-w-md mx-auto group text-white relative">
    <!-- Stats Box -->
    <div
        class="relative bg-black/10 border border-white/10 rounded-xl p-6
        shadow-[0_0_20px_rgba(0,255,255,0.05)] backdrop-blur-sm skew-[-1deg]"
    >
        <h2
            class="mb-2 text-center text-2xl font-extrabold tracking-widest text-white"
        >
            {userData.name}'s Stats
        </h2>
        {#if userStats.rank !== undefined}
            <div
                class="absolute top-3 right-4 text-sm font-semibold px-3 py-1 border border-cyan-400 bg-cyan-500/10 text-cyan-300 rounded-full shadow"
            >
                # {userStats.rank + 1}
            </div>
        {/if}

        <!-- Win/Loss Bar -->
        <div class="mb-6">
            <div class="flex justify-between text-sm font-semibold mb-1 px-1">
                <span class="text-green-400">Wins: {userStats.wins}</span>
                <span class="text-red-400">Losses: {userStats.losses}</span>
            </div>
            <div
                class="h-3 bg-gray-400/20 rounded-full overflow-hidden w-full relative"
            >
                <!-- Green bar for wins -->
                <div
                    class="h-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 transition-all duration-500 absolute"
                    style="width: {winRatio}%;"
                ></div>

                <!-- Red bar for losses -->
                <div
                    class={`h-full bg-gradient-to-r ${
                        winRatio === 0
                            ? "from-red-500 to-red-400"
                            : "from-red-900 via-red-500 to-red-500"
                    } transition-all duration-500 absolute`}
                    style="width: {lossRatio}%; left: {winRatio}%;"
                ></div>
            </div>
            <p class="text-xs text-right text-gray-400 italic mt-1">
                Win Rate: {winRatio.toFixed(1)}%
            </p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-3 text-sm">
            <div
                class="bg-white/5 border border-white/10 p-3 rounded-md hover:bg-purple-500/10 transition duration-300"
            >
                <p class="text-purple-300 font-xs mb-1">Total Games</p>
                <p class="text-white text-3xl font-bold">
                    {userStats.totalGames}
                </p>
            </div>
            <div
                class="bg-white/5 border border-white/10 p-3 rounded-md hover:bg-blue-500/10 transition duration-300"
                onmouseenter={() => (hovering = true)}
                onmouseleave={() => (hovering = false)}
                role="button"
                tabindex="0"
            >
                <p class="text-blue-300 font-xs mb-1">Total Score</p>
                <p class="text-white text-3xl font-bold">
                    {hovering ? totalScore : formatNumber(totalScore)}
                </p>
            </div>
            <div
                class="bg-white/5 border border-white/10 p-3 rounded-md hover:bg-cyan-500/10 transition duration-300"
            >
                <p class="text-cyan-300 font-xs mb-1">Avg. Score</p>
                <p class="text-white text-3xl font-bold">
                    {userStats.averageScore.toFixed(1)}
                </p>
            </div>
            <div
                class="bg-white/5 border border-white/10 p-3 rounded-md hover:bg-yellow-500/10 transition duration-300"
            >
                <p class="text-yellow-300 font-xs mb-1">High Score</p>
                <p class="text-white text-3xl font-bold">
                    {userStats.highestScore}
                </p>
            </div>
        </div>
    </div>
</div>
