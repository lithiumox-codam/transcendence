<script lang="ts">
	import type { PageData } from "./$types";
	import { client } from "$lib/trpc";

	let { data }: { data: PageData } = $props();

	async function handleDeletion() {
		await client.user.privacy.deleteAccount.mutate();
	}
</script>

<button onclick={handleDeletion}> Delete Account </button>
