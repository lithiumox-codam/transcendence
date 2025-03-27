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
    import type { Popout } from "$lib/classes/Popout.svelte";
    import { getContext } from "svelte";
    import ChatPopout from "../Popouts/ChatPopout.svelte";
    import UserPopout from "../Popouts/UserPopout.svelte";

    let popout = getContext<Popout>("popout");

    // Component mapping for each nav item
    const componentMap: Record<string, Component> = {
        Chat: ChatPopout,
        User: UserPopout,
    };

    const navItems: {
        href: string;
        icon: Component;
        label: string;
        showNotification?: boolean;
        popoutId?: string;
    }[] = [
        {
            href: "/leaderboard",
            icon: Info,
            label: "Friends",
            showNotification: false,
            popoutId: "friends",
        },
        {
            href: "/leaderboard",
            icon: AlignHorizontalDistributeCenter,
            label: "Stats",
            showNotification: false,
            popoutId: "stats",
        },
        {
            href: "/chat",
            icon: MessageCircle,
            label: "Chat",
            showNotification: false,
            popoutId: "Chat",
        },
        {
            href: "/user",
            icon: User,
            label: "You",
            showNotification: false,
            popoutId: "User",
        },
    ];

    let showPopout = $state(false);

    // Function to toggle a specific popout
    function togglePopout(popoutId: string | undefined) {
        if (!popoutId || !componentMap[popoutId]) return;

        // If this popout is already open, close it
        if (popout.shown && popout.componentId === popoutId) {
            popout.hide();
            return;
        }

        // Otherwise show the requested component
        popout.show(componentMap[popoutId], popoutId);
    }

    // Function to check if a specific popout is active
    function isPopoutActive(popoutId: string | undefined): boolean {
        return popout.shown && popout.componentId === popoutId;
    }
</script>

{#snippet navItem(item: {
    href: string;
    icon: Component;
    label: string;
    showNotification?: boolean;
    popoutId?: string;
})}
    <button
        onclick={() => togglePopout(item.popoutId)}
        class={`px-6 py-3 rounded-full text-white text-lg font-semibold transition-all duration-300
        ${
            isPopoutActive(item.popoutId)
                ? "bg-gradient-to-r from-cyan-600 to-cyan-500 text-gray-900"
                : "bg-gradient-to-r from-gray-700 to-gray-600 hover:from-cyan-500 hover:to-cyan-400 hover:text-gray-900"
        } 
        shadow-md flex flex-col items-center justify-center gap-1 group min-w-[115px]
        ${isPopoutActive(item.popoutId) ? "ring-2 ring-cyan-300" : ""}`}
    >
        <div class="relative">
            <item.icon
                class="w-5 h-5 stroke-current transition-all duration-300 group-hover:scale-110"
            />
            {#if item.showNotification}
                <div
                    class="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-0 group-hover:opacity-100"
                ></div>
            {/if}
        </div>
        <span class="text-xs truncate">{item.label}</span>
    </button>
{/snippet}

<div
    class={`absolute bottom-36 right-6 transform transition-all duration-300 z-40 w-[90%] max-w-md ${showPopout ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
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
        class="w-6 h-6 bg-gray-800/95 transform rotate-45 absolute -bottom-3 right-8 border-r border-b border-cyan-600/30"
    ></div>
</div>

<nav
    class="fixed bottom-5 right-5 bg-gray-800/90 p-3 rounded-full shadow-lg flex items-center justify-between backdrop-blur-lg border border-cyan-600/30 z-50 gap-1"
>
    {#each navItems as item}
        {@render navItem(item)}
    {/each}

    <button
        onclick={() => (showPopout = !showPopout)}
        class={`px-6 py-3 rounded-full text-white text-lg font-semibold transition-all duration-300
        bg-gradient-to-tr from-green-500 to-green-900 hover:from-green-400 hover:to-green-600
        hover:text-gray-900 shadow-md flex flex-col items-center justify-center gap-1 group min-w-[115px]
        ${showPopout ? "ring-2 ring-green-300" : ""}`}
    >
        <div class="relative">
            <Play
                class="w-5 h-5 stroke-current transition-all duration-300 group-hover:scale-110"
            />
        </div>
        <span class="text-xs truncate">Play</span>
    </button>
</nav>

<style>
    @keyframes pulse {
        0%,
        100% {
            box-shadow: 0 0 10px 0 rgba(6, 182, 212, 0.3);
        }
        50% {
            box-shadow: 0 0 15px 2px rgba(6, 182, 212, 0.5);
        }
    }
</style>
