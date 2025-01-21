<script>
	import Header from '../lib/components/Header.svelte';
	import '../app.css';
	import { clickOutside } from '$lib/utils/clickOutside';
	import Chat from '$lib/components/Chat.svelte';
	import { fade } from 'svelte/transition';

	let showChat = $state(false);

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<div class="app">
	<Header />

	<main>
		{@render children()}
	</main>

	<!-- Chat Button and Modal -->
	<button class="chat-toggle" onclick={() => showChat = !showChat}>
		{#if !showChat}
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="18 15 12 9 6 15"></polyline>
			</svg>
		{:else}
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="6 9 12 15 18 9"></polyline>
			</svg>
		{/if}
	</button>

	{#if showChat}
		<div class="chat-modal" transition:fade={{duration: 200}} use:clickOutside={() => showChat
			= !showChat}>
			<Chat />
		</div>
	{/if}
</div>


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

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 1rem;
		border-top: 1px solid hsl(var(--border));
		background-color: hsl(var(--background));
		color: hsl(var(--muted-foreground));
	}

	footer a {
		color: hsl(var(--primary));
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s ease;
	}

	footer a:hover {
		color: hsl(var(--primary) / 0.9);
		text-decoration: underline;
	}

	.chat-toggle {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		background-color: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border: none;
		border-radius: 50%;
		width: 50px;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: background-color 0.2s ease;
	}

	.chat-toggle:hover {
		background-color: hsl(var(--primary) / 0.9);
	}

	.chat-modal {
		margin-bottom: 5px;
		position: fixed;
		bottom: 70px;
		right: 1rem;
		width: 300px;
		max-height: 400px;
		background-color: hsl(var(--background));
		border-radius: 0.5rem;
		/* add a drop shadow */
		box-shadow: 0 2px 8px hsl(var(--foreground) / 0.1);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}
</style>
