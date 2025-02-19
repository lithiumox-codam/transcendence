<script lang="ts">
	// import { onMount } from "svelte";
	import { client } from "$lib/trpc";

	let response = $state("");
	let input = $state("");

	async function GameRouter() {
		try {
			response = await client.game.ping.query({
				msg: input,
			});
			console.log(response);
		} catch (error) {
			console.error(error);
		}
	}
</script>

<div class="pt-20 text-cyan-400">
	{response}
	<input type="text" bind:value={input} />
	<button onclick={GameRouter}>Test</button>
</div>
