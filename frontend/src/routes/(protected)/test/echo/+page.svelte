<script>
    import ws from "$lib/stores/websocket";
	import { onMount } from "svelte";

    let lastEcho = $state('');
    let message = $state('');

    async function echoListener(payload) {
        console.log(payload);
        lastEcho = payload;
    }

    onMount(() => {
        ws.addListener('echo', echoListener);
    });
</script>

<h1>Echo Page</h1>

<p>Last Echo: {lastEcho}</p>

<input type="text" bind:value={message} />

<button onclick={() => ws.send('echo', message)}>Send Echo</button>