<script lang="ts">
    import { client } from "$lib/trpc";
    import { onMount } from "svelte";
	import type { User } from "@repo/database/types";

    let { userId }: { userId: number } = $props();

	let user: User | null = $state(null);

	onMount(async () => {
		user = await client.user.getById.query(userId);
	});

</script>
{#if user}
    {user.name} Wins!
{/if}

