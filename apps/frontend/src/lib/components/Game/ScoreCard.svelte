<script lang="ts">
	import { client } from "$lib/trpc";
	import type { User } from "@repo/database/types";
	import Avatar from "../Avatar.svelte";

	let {
		userId,
		score,
		color,
	}: {
		userId: number;
		score: number;
		color: { r: number; g: number; b: number };
	} = $props();

	let r = $derived(Math.round(color.r * 255));
	let g = $derived(Math.round(color.g * 255));
	let b = $derived(Math.round(color.b * 255));

	let user: User | null = $state(null);

	async function fetchUser() {
		user = await client.user.getById.query(userId);
	}

	fetchUser();
</script>

<div
	class="flex items-center px-3 py-2 text-white min-w-[180px] max-w-[240px] border border-white/10 rounded-md gap-3"
>
	<div
		class="w-1 h-8 rounded-full border border-gray-900"
		style="background-color: rgba({r}, {g}, {b}, 0.5)"
	></div>

	{#if user}
		<Avatar
			name={user.name}
			avatar={user.avatar}
			class="w-8 h-8 rounded-full flex-shrink-0"
		/>
		<h2 class="text-sm font-semibold truncate max-w-[6rem]">{user.name}</h2>
		<p class="text-lg font-bold ml-auto">{score}</p>
	{:else}
		<div class="w-full h-8 bg-white/10 animate-pulse rounded-md"></div>
	{/if}
</div>
