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

    let { userStats }: { userStats: userStats } = $props();

    const winRatio = userStats.totalGames
        ? (userStats.wins / userStats.totalGames) * 100
        : 0;
</script>

<div class="w-full max-w-md mx-auto group text-white relative">
    <!-- Title -->
    <h2
        class="absolute top-[-2.5rem] left-1/2 transform -translate-x-1/2 text-2xl font-extrabold tracking-widest text-white
        skew-[-2deg]"
    >
        Your Stats
    </h2>

    <!-- Stats Box -->
    <div
        class="relative bg-black/50 border border-white/10 rounded-xl p-6 backdrop-blur-sm
        skew-[-2deg] shadow-[0_0_20px_rgba(0,255,255,0.05)]"
    >
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
            <div class="h-3 bg-white/10 rounded-full overflow-hidden w-full">
                <div
                    class="h-full bg-gradient-to-r from-green-400 to-teal-500 transition-all duration-500"
                    style="width: {winRatio}%;"
                ></div>
            </div>
            <p class="text-xs text-right text-gray-400 italic mt-1">
                Win Rate: {winRatio.toFixed(1)}%
            </p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="bg-white/5 border border-white/10 p-3 rounded-md hover:bg-purple-500/10 transition duration-300">
                <p class="text-purple-300 font-medium mb-1">Total Games</p>
                <p class="text-white text-lg font-bold">{userStats.totalGames}</p>
            </div>
            <div class="bg-white/5 border border-white/10 p-3 rounded-md hover:bg-blue-500/10 transition duration-300">
                <p class="text-blue-300 font-medium mb-1">Total Score</p>
                <p class="text-white text-lg font-bold">{userStats.totalScore}</p>
            </div>
            <div class="bg-white/5 border border-white/10 p-3 rounded-md hover:bg-cyan-500/10 transition duration-300">
                <p class="text-cyan-300 font-medium mb-1">Avg. Score</p>
                <p class="text-white text-lg font-bold">
                    {userStats.averageScore.toFixed(1)}
                </p>
            </div>
            <div class="bg-white/5 border border-white/10 p-3 rounded-md hover:bg-yellow-500/10 transition duration-300">
                <p class="text-yellow-300 font-medium mb-1">High Score</p>
                <p class="text-white text-lg font-bold">{userStats.highestScore}</p>
            </div>
        </div>
    </div>
</div>