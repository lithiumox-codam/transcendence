<script>
	import { getContext, onMount } from 'svelte';

	let lastEcho = $state({ time: null, message: '' });
	let message = $state('');
	const ws = getContext('ws');

	onMount(() => {
		const remove = ws.addListener('echo', (payload) => {
			console.log('Echo:', payload);
			lastEcho.time = new Date();
			lastEcho.message = payload;
		});

		return () => {
			remove();
		};
	});
</script>

<h1>Echo Page</h1>

<p>
	Last Echo: {lastEcho.message} ({lastEcho.time === null ? 'never' : lastEcho.time.toISOString()})
</p>

<input type="text" bind:value={message} />

<button onclick={() => ws.send('echo', message)}>Send Echo</button>
