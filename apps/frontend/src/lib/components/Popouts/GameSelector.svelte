<script lang="ts">
    import type { GameClass } from "$lib/classes/Game.svelte";
    import { client } from "$lib/trpc";
    import { Users, Trophy, Swords, Circle, X } from "@lucide/svelte";
    import type {
        Game,
        User,
    } from "../../../../../../packages/database/src/types";
    import { getContext } from "svelte";
    import Avatar from "../Avatar.svelte";
    import type { UserClass } from "$lib/classes/User.svelte";

    type OngoingGame = {
        game: Game;
        players: User[];
    };

    const gameClass = getContext<GameClass>("game");
    const userClass = getContext<UserClass>("user");

    function selectGame(type: string) {
        console.log(`Selected game type: ${type}`);
    }

    function spectateGame(gameId: number) {
        console.log(`Viewing ongoing game with ID: ${gameId}`);
    }

    let swordsAnimating = $state(false);
    let usersAnimating = $state(false);
    let trophyAnimating = $state(false);

    async function handleQueue1v1() {
        swordsAnimating = true;
        await client.game.queue.query(2);
        setTimeout(() => {
            swordsAnimating = false;
        }, 400);
    }

    async function handleQueue4FFA() {
        usersAnimating = true;
        await client.game.queue.query(4);
        setTimeout(() => {
            usersAnimating = false;
        }, 400);
    }

    async function handleSelectTournament() {
        trophyAnimating = true;
        await client.game.queue.query(8);
        setTimeout(() => {
            trophyAnimating = false;
        }, 400);
    }

    let isUserInQueue = $derived(() => {
        const currentUser = userClass.data;
        if (!currentUser) {
            return false;
        }
        return gameClass.queue.some((player) => player.id === currentUser.id);
    });
</script>

<div class="p-6 text-white my-auto">
    <div class="mb-3 flex items-center justify-center min-h-10">
        {#if gameClass.queue.length > 0}
            <div class="flex items-center justify-center space-x-2">
                <div class="flex -space-x-2">
                    {#each gameClass.queue as player}
                        <Avatar
                            name={player.name}
                            avatar={player.avatar}
                            class="w-7 h-7 rounded-full border-2 border-black/50 select-none"
                        />
                    {/each}
                </div>
                {#if isUserInQueue()}
                    <div class="flex justify-center items-center">
                        <button
                            onclick={async () =>
                                await client.game.leaveQueue.mutate()}
                            class="ml-3 text-xs bg-white/5 border border-white/10 text-white font-medium p-2 rounded-full hover:bg-red-600/20 hover:text-red-300 transition select-none cursor-pointer flex justify-center items-center"
                            style="width: 26px; height: 26px;"
                        >
                            <X class="w-4 h-4 text-center" />
                        </button>
                    </div>
                {/if}
            </div>
        {:else}
            <p class="text-gray-500 text-sm flex items-center select-none">
                <Circle class="w-2 h-2 inline-block mr-3 animate-ping" />
                Waiting for players to join the queue...
            </p>
        {/if}
    </div>

    <h2
        class="text-3xl font-extrabold tracking-widest text-center text-white retro-glow mb-6 select-none"
    >
        Choose Your Game Mode
    </h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <button
            onclick={handleQueue1v1}
            class="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-cyan-900/50 to-black/30 border border-cyan-500/40 rounded-lg p-3 flex flex-col justify-center items-center text-white shadow-[0_0_20px_rgba(0,255,255,0.15)] backdrop-blur-sm
			   hover:from-cyan-800/60 hover:to-black/40 hover:border-cyan-400/60 hover:shadow-[0_0_30px_rgba(0,255,255,0.25)] transition-all duration-300 group transform hover:-translate-y-1 hover:scale-105 active:scale-100 active:-translate-y-0 cursor-pointer"
        >
            <div
                class="absolute inset-0 bg-grid-cyan opacity-10 group-hover:opacity-20 transition-opacity duration-300"
            ></div>
            <Swords
                class="w-8 h-8 mb-3 text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.5)] transition-transform duration-300 group-hover:scale-110 {swordsAnimating
                    ? 'animate-fight'
                    : ''}"
            />
            <span class="text-lg font-bold tracking-wider z-10 select-none"
                >1 VS 1</span
            >
            <p class="text-xs text-cyan-200 mt-1 z-10 select-none">
                Classic Duel
            </p>
        </button>

        <button
            onclick={handleQueue4FFA}
            class="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-pink-900/50 to-black/30 border border-pink-500/40 rounded-lg p-3 flex flex-col justify-center items-center text-white shadow-[0_0_20px_rgba(255,0,255,0.15)] backdrop-blur-sm
				   hover:from-pink-800/60 hover:to-black/40 hover:border-pink-400/60 hover:shadow-[0_0_30px_rgba(255,0,255,0.25)] transition-all duration-300 group transform hover:-translate-y-1 hover:scale-105 active:scale-100 active:-translate-y-0 cursor-pointer"
        >
            <div
                class="absolute inset-0 bg-grid-pink opacity-10 group-hover:opacity-20 transition-opacity duration-300"
            ></div>
            <Users
                class="w-7 h-8 mb-3 text-pink-300 drop-shadow-[0_0_8px_rgba(255,0,255,0.5)] transition-transform duration-300 group-hover:scale-110 {usersAnimating
                    ? 'animate-users'
                    : ''}"
            />
            <span class="text-lg font-bold tracking-wider z-10 select-none"
                >4-Player FFA</span
            >
            <p class="text-xs text-pink-200 mt-1 z-10 select-none">
                Free-For-All Chaos
            </p>
        </button>

        <button
            onclick={handleSelectTournament}
            class="mb-10 aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-amber-900/50 to-black/30 border border-amber-500/40 rounded-lg p-3 flex flex-col justify-center items-center text-white shadow-[0_0_20px_rgba(255,200,0,0.15)] backdrop-blur-sm
			   hover:from-amber-800/60 hover:to-black/40 hover:border-amber-400/60 hover:shadow-[0_0_30px_rgba(255,200,0,0.25)] transition-all duration-300 group transform hover:-translate-y-1 hover:scale-105 active:scale-100 active:-translate-y-0 cursor-pointer"
        >
            <div
                class="absolute inset-0 bg-grid-amber opacity-10 group-hover:opacity-20 transition-opacity duration-300"
            ></div>
            <Trophy
                class="w-8 h-8 mb-3 text-amber-300 drop-shadow-[0_0_8px_rgba(255,200,0,0.5)] transition-transform duration-300 group-hover:scale-110 {trophyAnimating
                    ? 'animate-trophy'
                    : ''}"
            />
            <span class="text-lg font-bold tracking-wider z-10 select-none"
                >Tournament</span
            >
            <p class="select-none text-xs text-amber-200 mt-1 z-10">
                Climb the Bracket
            </p>
        </button>
    </div>
</div>

<style>
    .bg-grid-cyan {
        background-image:
            linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px);
        background-size: 20px 20px;
    }
    .bg-grid-pink {
        background-image:
            linear-gradient(rgba(255, 0, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 0, 255, 0.05) 1px, transparent 1px);
        background-size: 20px 20px;
    }
    .bg-grid-amber {
        background-image:
            linear-gradient(rgba(255, 200, 0, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 200, 0, 0.05) 1px, transparent 1px);
        background-size: 20px 20px;
    }

    @keyframes fight {
        0% {
            transform: rotate(0deg) translateX(0);
        }
        25% {
            transform: rotate(-15deg) translateX(-3px) translateY(-1px);
        }
        50% {
            transform: rotate(15deg) translateX(3px) translateY(-1px);
        }
        75% {
            transform: rotate(-10deg) translateX(-2px);
        }
        100% {
            transform: rotate(0deg) translateX(0);
        }
    }
</style>
