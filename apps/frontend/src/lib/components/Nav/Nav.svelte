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
				"bg-gradient-to-tr from-blue-500 to-cyan-400 border border-cyan-300/50",
				"bg-white/5 hover:bg-blue-500/10 border border-white/10",
			],
		},
		{
			icon: User,
			label: "You",
			component: UserPopout,
			colors: [
				"bg-gradient-to-tr from-indigo-500 to-purple-400 border border-purple-300/50",
				"bg-white/5 hover:bg-purple-500/10 border border-white/10",
			],
		},
		{
			icon: Play,
			label: "Play",
			component: GameSelector,
			colors: [
				"bg-gradient-to-tr from-green-500 to-emerald-400 border border-green-300/50",
				"bg-white/5 hover:bg-green-500/10 border border-white/10",
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

	let hovering = $state(-1);
</script>

{#snippet navItem(item: NavItem, index: number)}
	{@const isActive = isPopoutActive(item.component)}
	{@const isHovered = hovering === index}
	{@const baseClasses =
		"px-6 py-3 rounded-full text-white text-lg font-semibold transition-all duration-300 shadow-md flex flex-col items-center justify-center gap-1 min-w-[115px]"}
	{@const activeClasses = `${item.colors[0]} shadow-[0_0_15px_rgba(0,255,255,0.15)]`}
	{@const inactiveClasses = `${item.colors[1]} shadow-[0_4px_12px_rgba(0,0,0,0.1)]`}
	{@const hoverEffect = isHovered && !isActive ? "scale-102" : ""}

	<button
		onclick={() => togglePopout(item.component)}
		onmouseenter={() => (hovering = index)}
		onmouseleave={() => (hovering = -1)}
		class={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${hoverEffect}`}
	>
		<div class="relative">
			<item.icon
				class="w-5 h-5 stroke-current transition-all duration-300"
			/>
		</div>
		<span class="text-xs truncate">{item.label}</span>
	</button>
{/snippet}

<nav
	class="fixed bottom-5 right-5 bg-black/10 backdrop-blur-xl p-3 rounded-full shadow-[0_0_20px_rgba(0,255,255,0.05)] flex items-center justify-between border border-white/10 z-50 gap-2"
>
	{#each navItems as item, i}
		{@render navItem(item, i)}
	{/each}
</nav>
