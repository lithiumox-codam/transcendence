<script lang="ts">
    import {
        AlignHorizontalDistributeCenter,
        Info,
        MessageCircle,
        Play,
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
            href: "/leaderboard",
            icon: MessageCircle,
            label: "Chat",
            showNotification: false,
        },
        {
            href: "/profile",
            icon: User,
            label: "You",
            showNotification: false,
        },
    ];
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
                class="w-5 h-5 stroke-current transition-all duration-300 group-hover:scale-110 fill-blue-500"
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
            <a
                href="/play"
                class="flex items-center justify-center w-16 h-16 rounded-full text-white
                    bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500
                    shadow-lg transition-all duration-300 border-4 border-gray-800
                    hover:scale-110 hover:rotate-3 group relative"
            >
                <Play
                    class="w-8 h-8 fill-white transition-transform duration-300 group-hover:translate-x-0.5"
                />
            </a>
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
