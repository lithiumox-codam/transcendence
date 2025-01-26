<script>
    import ws from "$lib/stores/websocket";
	import { onMount } from "svelte";
    
    
    let history = $state([]);
    let message = $state('');
    let senderId = $state('');
    
    async function chatListener(payload) {
        if (Array.isArray(payload)) {
            history = payload;
            return;
        }
        history.push(payload);
    }
    onMount(() => {
        const listener = ws.addListener('chat', chatListener);
        return () => {
            listener();
        }
    });
    
    function sendMessage() {
        ws.send('chat', { sender: senderId, message });
        message = '';
    }

</script>

<h1>Test Page</h1>

{#each history as { sender, message }}
    <div>
        <p>{sender}: {message}</p>
    </div>
{/each}

<label for="message">Message:</label>
<input type="text" bind:value={message} />
<label for="sender">Sender:</label>
<input type="text" bind:value={senderId} />
<button onclick={sendMessage}>Send</button>

<style>
    h1 {
        color: red;
    }
    div {
        margin: 10px;
    }
    input {
        margin: 10px;
    }
    button {
        margin: 10px;
    }
</style>
