<script>
	import Header from '../lib/components/Header.svelte';
	import '../app.css';

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<div class="app">
	<Header />

	<main>
		{@render children()}
	</main>

	<footer>
		<p>
			visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to learn about SvelteKit
		</p>
	</footer>
</div>

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
</style>
