<script>
    import ws from "$lib/classes/websocket";
	import { onDestroy, onMount } from "svelte";

    let lastEcho = $state({ time: null, message: '' });
    let message = $state('');

    /**
     * Listener for the echo event
     * @param payload {string}
     */
    async function echoListener(payload) {
        console.log('Echo:', payload);
        lastEcho.time = new Date();
        lastEcho.message = payload;

    }

    onMount(() => {
        const remove = ws.addListener('echo', echoListener);

        return () => {
            remove();
        }
    });
</script>

<h1>Echo Page</h1>

<p>Last Echo: {lastEcho.message} ({lastEcho.time === null ? '' : lastEcho.time.toISOString()})</p>

<input type="text" bind:value={message} />

<button onclick={() => ws.send('echo', message)}>Send Echo</button>