<script lang="ts">
	import { onMount } from "svelte";
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

	let rgbShadow = $derived(
		`rgb(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)})`,
	);
	let textShadow = $derived(`0 0 20px ${rgbShadow}, 0 0 80px ${rgbShadow}`);

	let user: User | null = $state(null);

	onMount(async () => {
		user = await client.user.getById.query(userId);
	});
</script>

<div class="flex flex-col items-center w-40 font-retro">
	{#if user}
		<!-- Avatar + Username -->
		<div class="flex items-center gap-2 mb-2 select-none">
			<Avatar
				name={user.name}
				avatar={user.avatar}
				class="h-8 w-8 rounded-full border border-white relative z-10"
			/>
			<h2
				class="text-white text-[1.5rem] font-semibold truncate max-w-[6rem] text-left leading-tight select-none"
			>
				{user.name}
			</h2>
		</div>

		<!-- Score -->
		<p
			class="text-white text-5xl font-bold tracking-wide mt-1 animate-score-pop select-none"
			style="text-shadow: {textShadow}"
		>
			{score}
		</p>
	{:else}
		<!-- Skeleton loading -->
		<div class="flex flex-col items-center gap-1 select-none">
			<div class="flex items-center gap-2 mb-1 select-none">
				<div
					class="h-12 w-12 rounded-full bg-white/10 animate-pulse select-none"
				></div>
				<div
					class="h-6 w-20 bg-white/10 rounded animate-pulse select-none"
				></div>
			</div>
			<div
				class="h-6 w-10 bg-white/10 rounded animate-pulse select-none"
			></div>
		</div>
	{/if}
</div>
