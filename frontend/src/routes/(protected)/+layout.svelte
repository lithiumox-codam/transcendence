<script>
	import Header from '$lib/components/Header.svelte';
	// import Chat from '$lib/components/chat/ChatContainer.svelte';
	import { onDestroy, setContext } from 'svelte';
	import ws from '$lib/classes/websocket';
	import Loader from '$lib/components/Loader.svelte';
	import { browser } from '$app/environment';

	setContext('ws', ws);

	let socket = ws;

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();

	onDestroy(() => {
		ws.close();
	});
</script>

{#await socket.waitForConnection()}
	<div class="loader-container">
		<Loader />
		<p class="connection-message">Connecting to socket...</p>
	</div>
{:then _}
	<div class="app">
		<Header />

		<main>
			{@render children()}
		</main>

		<!-- Chat Button and Modal -->
		<!-- <Chat /> -->
	</div>
{:catch error}
	<p>{error.message}</p>
	<button onclick={() => location.reload()}>Retry</button>
{/await}

<!-- <MobileNav /> -->

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background-color: hsl(var(--background));
		color: hsl(var(--foreground));
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	.loader-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
	}
</style>
