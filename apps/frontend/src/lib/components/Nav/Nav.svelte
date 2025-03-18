<script lang="ts">
    import {
        AlignHorizontalDistributeCenter,
        Info,
        MessageCircle,
        Play,
        Swords,
        TrendingUp,
        User,
    } from "@lucide/svelte";
    import type { Component } from "svelte";

    const navItems: {
        href: string;
        icon: Component;
        label: string;
        showNotification?: boolean;
    }[] = [
        {
            href: "/leaderboard",
            icon: Info,
            label: "Info",
            showNotification: false,
        },
        {
            href: "/leaderboard",
            icon: AlignHorizontalDistributeCenter,
            label: "Stats",
            showNotification: false,
        },
        {
            href: "/chat",
            icon: MessageCircle,
            label: "Chat",
            showNotification: false,
        },
        {
            href: "/user",
            icon: User,
            label: "You",
            showNotification: false,
        },
    ];

    let showPopout = $state(false);
</script>

{#snippet navItem(item: {
    href: string;
    icon: Component;
    label: string;
    showNotification?: boolean;
})}
    <a
        href={item.href}
        class="px-6 py-2 rounded-full text-white text-lg font-semibold transition-all duration-300
        bg-gradient-to-r from-gray-700 to-gray-600 hover:from-cyan-500 hover:to-cyan-400
        hover:text-gray-900 shadow-md flex flex-col items-center justify-center gap-1 group min-w-[115px]"
    >
        <div class="relative">
            <item.icon
                class="w-5 h-5 stroke-current transition-all duration-300 group-hover:scale-110 "
            />
            {#if item.showNotification}
                <div
                    class="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-0 group-hover:opacity-100"
                ></div>
            {/if}
        </div>
        <span class="text-xs truncate">{item.label}</span>
    </a>
{/snippet}

<div
    class={`absolute bottom-30 left-1/2 transform -translate-x-1/2 transition-all duration-300 z-40 w-[90%] max-w-md ${showPopout ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
>
    <div
        class="bg-gray-800/95 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-cyan-600/30 overflow-hidden"
    >
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-white text-lg font-semibold">Game Selection</h2>
            <button
                aria-label="Close"
                class="text-gray-400 hover:text-white"
                onclick={() => (showPopout = false)}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
        </div>

        <div class="grid grid-cols-2 gap-3">
            <button
                class="bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white p-3 rounded-lg flex flex-col items-center transition-all duration-300 hover:scale-105"
            >
                <TrendingUp class="w-6 h-6 mb-2" />
                <span>Classic</span>
            </button>

            <button
                class="bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white p-3 rounded-lg flex flex-col items-center transition-all duration-300 hover:scale-105"
            >
                <TrendingUp class="w-6 h-6 mb-2" />
                <span>Special</span>
            </button>

            <button
                class="bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white p-3 rounded-lg flex flex-col items-center transition-all duration-300 hover:scale-105"
            >
                <TrendingUp class="w-6 h-6 mb-2" />
                <span>Tournament</span>
            </button>

            <button
                class="bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white p-3 rounded-lg flex flex-col items-center transition-all duration-300 hover:scale-105"
            >
                <TrendingUp class="w-6 h-6 mb-2" />
                <span>Custom</span>
            </button>
        </div>
    </div>

    <!-- Decorative triangle pointer -->
    <div
        class="w-6 h-6 bg-gray-800/95 transform rotate-45 absolute -bottom-3 left-1/2 -translate-x-1/2 border-r border-b border-cyan-600/30"
    ></div>
</div>

<div
    class="fixed bottom-0 left-0 right-0 w-full pb-[calc(env(safe-area-inset-bottom,16px)+12px)] pt-3 z-50 flex justify-center"
>
    <nav
        class="bg-gray-800/90 p-3 rounded-full shadow-lg flex items-center justify-between relative backdrop-blur-lg border border-cyan-600/30 animate-[float_6s_ease-in-out_infinite] gap-1"
    >
        {#each navItems.slice(0, 2) as item}
            {@render navItem(item)}
        {/each}

        <div
            class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
        >
            <button
                onmouseenter={() => (showPopout = true)}
                class="flex items-center justify-center w-16 h-16 rounded-full text-white
                    bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500
                    shadow-lg transition-all duration-300 border-4 border-gray-800
                    hover:scale-110 hover:rotate-3 group relative"
            >
                <svg
                    class="w-8 h-8 fill-white transition-transform duration-300 group-hover:translate-x-0.5 stroke-2 stroke-white"
                >
                    <style type="text/css">
                        .st0 {
                            fill: none;
                            /* stroke: #ffffff; */
                            /* stroke-width: 1.7; */
                            /* stroke-linecap: round; */
                            /* stroke-linejoin: round; */
                            /* stroke-miterlimit: 10; */
                        }
                    </style>
                    <path
                        class="st0"
                        d="M27,6.5v7c0,0.8-0.7,1.5-1.5,1.5h0c-0.8,0-1.5-0.7-1.5-1.5v-7C24,5.7,24.7,5,25.5,5h0C26.3,5,27,5.7,27,6.5z"
                    />
                    <path
                        class="st0"
                        d="M8,18.5v7C8,26.3,7.3,27,6.5,27h0C5.7,27,5,26.3,5,25.5v-7C5,17.7,5.7,17,6.5,17h0C7.3,17,8,17.7,8,18.5z"
                    />
                    <circle class="st0" cx="15" cy="18" r="2" />
                    <path
                        class="st0"
                        d="M26,30H6c-2.2,0-4-1.8-4-4V6c0-2.2,1.8-4,4-4h20c2.2,0,4,1.8,4,4v20C30,28.2,28.2,30,26,30z"
                    />
                    <line class="st0" x1="16" y1="16" x2="16" y2="2" />
                    <line class="st0" x1="16" y1="30" x2="16" y2="20" />
                </svg>
            </button>
        </div>

        {#each navItems.slice(2) as item}
            {@render navItem(item)}
        {/each}
    </nav>
</div>

<style>
    @keyframes float {
        0%,
        100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-5px);
        }
    }
</style>
