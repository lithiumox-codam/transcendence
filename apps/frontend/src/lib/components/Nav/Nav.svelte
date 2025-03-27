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
    import GameSelector from "../Popouts/GameSelector.svelte";

    const popout = getContext<Popout>("popout");

    // Component mapping for each nav item
    const componentMap: Record<string, Component> = {
        Chat: ChatPopout,
        User: UserPopout,
        Play: GameSelector,
    };

    const navItems: {
        href: string;
        icon: Component;
        label: string;
        showNotification?: boolean;
        popoutId?: string;
    }[] = [
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
        {
            href: "/play",
            icon: Play,
            label: "Play",
            showNotification: false,
            popoutId: "Play",
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

<nav
    class="fixed bottom-5 right-5 bg-gray-800/90 p-3 rounded-full shadow-lg flex items-center justify-between backdrop-blur-lg border border-cyan-600/30 z-50 gap-1"
>
    {#each navItems as item}
        {@render navItem(item)}
    {/each}
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
