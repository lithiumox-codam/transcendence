<script lang="ts">
    import { MessageCircle, Play, User } from "@lucide/svelte";
    import type { Component } from "svelte";
    import type { Popout } from "$lib/classes/Popout.svelte";
    import { getContext } from "svelte";
    import ChatPopout from "../Popouts/ChatPopout.svelte";
    import UserPopout from "../Popouts/UserPopout.svelte";
    import GameSelector from "../Popouts/GameSelector.svelte";

    const popout = getContext<Popout>("popout");

    type NavItem = {
        icon: Component;
        component: Component;
        label: string;
        colors: string[];
    };

    const navItems: NavItem[] = [
        {
            icon: MessageCircle,
            label: "Chat",
            component: ChatPopout,
            colors: [
                "bg-gradient-to-tr from-blue-500 to-cyan-400 ring-2 ring-cyan-300",
                "bg-gradient-to-tr from-gray-700 to-gray-700 to-blue-300/40",
            ],
        },
        {
            icon: User,
            label: "You",
            component: UserPopout,
            colors: [
                "bg-gradient-to-tr from-indigo-500 to-purple-400 ring-2 ring-purple-300",
                "bg-gradient-to-tr from-gray-700 to-gray-600/90 to-purple-900/40",
            ],
        },
        {
            icon: Play,
            label: "Play",
            component: GameSelector,
            colors: [
                "bg-gradient-to-tr from-emerald-500 to-green-400 ring-2 ring-green-300",
                "bg-gradient-to-tr from-gray-700 to-gray-600/90 to-green-900/40",
            ],
        },
    ];

    // Function to toggle a specific popout
    function togglePopout(component: Component) {
        if (!component) return;

        // If this popout is already open, close it
        if (popout.shown && isPopoutActive(component)) {
            popout.hide();
            return;
        }

        // Otherwise show the requested component
        popout.show(component);
    }

    // Function to check if a specific popout is active
    function isPopoutActive(component: Component): boolean {
        return popout.component === component;
    }
</script>

{#snippet navItem(item: NavItem)}
    {@const isActive = isPopoutActive(item.component)}
    {@const baseClasses =
        "px-6 py-3 rounded-full text-white text-lg font-semibold transition-all duration-300 shadow-md flex flex-col items-center justify-center gap-1 min-w-[115px]"}
    {@const activeClasses = `${item.colors[0]}`}
    {@const inactiveClasses = `${item.colors[1]} hover:scale-102 hover:shadow-lg`}

    <button
        onclick={() => togglePopout(item.component)}
        class={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
        <div class="relative">
            <item.icon
                class="w-5 h-5 stroke-current transition-all duration-300 group-hover:scale-110"
            />
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
