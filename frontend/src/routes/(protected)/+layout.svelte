<script>
	import Header from '$lib/components/Header.svelte';
	import Chat from '$lib/components/chat/ChatContainer.svelte';
	import { onMount, setContext } from 'svelte';
	import client from '$lib/utils/axios';
	import { goto } from '$app/navigation';
	import ws from "$lib/stores/websocket";

	let isAuthenticated = $state(false);
	let user = $state(null);

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();
	
	onMount(async () => {
		ws.connect();
		try {
			user = await client.get('/user/profile/');
			if (user.status === 200) {
				isAuthenticated = true;
			} else {
				throw new Error('Failed to get profile');
			}
		} catch (e) {
			console.error(e);
			goto('/login');
		}
	});
</script>

{#if isAuthenticated}
	<div class="app">
		<Header {user} />

		<main>
			{@render children()}
		</main>

		<!-- Chat Button and Modal -->
		<Chat />
	</div>
{/if}

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
