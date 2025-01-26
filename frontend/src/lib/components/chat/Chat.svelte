<script>
	import { text } from '@sveltejs/kit';
	import { onDestroy, onMount } from 'svelte';

	let messages = $state([]);
	let newMessage = $state('');
	let messageContainer = $state(null);
	let userId = $state('');

	let { } = $props();

	onDestroy(() => {
		ws.close();
	});

	const hostname = window.location.hostname;

	function generateUserId() {
		const storedId = localStorage.getItem('chatUserId');
		if (storedId) return storedId;
		const randomId = Math.random().toString(36).substring(2, 7);
		localStorage.setItem('chatUserId', randomId);
		return randomId;
	}

	$effect(() => {
		userId = generateUserId();
	});

	const ws = new WebSocket(`wss://${hostname}/ws/`);

	$effect(() => {
		if (messageContainer !== null && messages.length > 0) {
			messageContainer.scrollTo({
				top: messageContainer.scrollHeight,
				behavior: 'smooth'
			});
		}
	});

	ws.onopen = () => console.log('Connected to the WS server');
	ws.onmessage = (event) => {
		const message = JSON.parse(event.data);
		if (Array.isArray(message)) {
			messages.push(...message.map((msg) => ({ ...msg, timestamp: Date.now() })));
			return;
		}
		messages.push({ ...message, timestamp: Date.now() });
	};
	ws.onclose = () => console.log('Disconnected from the WS server');
	ws.onerror = (error) => console.error('Error:', error);

	function sendMessage() {
		if (newMessage.trim()) {
			const messageData = { message: newMessage, sender: userId };
			ws.send(JSON.stringify(messageData));
			newMessage = '';
		}
	}

	function handleKeyPress(event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	function formatTime(timestamp) {
		return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	function formatSender(sender) {
		return sender === userId ? 'me' : sender;
	}
</script>

<svelte:head>
	<title>Real-time Chat</title>
	<meta name="description" content="Real-time chat application" />
</svelte:head>

<section class="container">
	<div class="chat-container">
		<div class="chat-header">
			<h1 class="font-semibold">Chat Room</h1>
			<div class="online-status">
				<div class="status-dot"></div>
				Connected
			</div>
		</div>

		<div class="messages" bind:this={messageContainer}>
			{#each messages as message}
				<div class="message-wrapper {formatSender(message.sender)}">
					<div class="message">
						{#if message.sender !== userId}
							<div class="message-sender">User {message.sender}</div>
						{/if}
						<div class="message-content">{message.message}</div>
						<div class="message-timestamp">{formatTime(message.timestamp)}</div>
					</div>
				</div>
			{/each}
		</div>

		<div class="input-container">
			<textarea
				rows="1"
				bind:value={newMessage}
				onkeydown={handleKeyPress}
				placeholder="Type a message..."
				class="input"
			></textarea>
			<button onclick={sendMessage} aria-label="Send" class="send-button">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<line x1="22" y1="2" x2="11" y2="13"></line>
					<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
				</svg>
			</button>
		</div>
	</div>
</section>

<style>
	.container {
		position: relative;
		margin: 0;
		width: 100%;
		height: 100%;
		background-color: hsl(var(--background));
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.2),
			inset 0 0 5px rgba(0, 0, 0, 0.1);
		border-radius: 0.5rem;
		display: flex;
		flex-direction: column;
		z-index: 1000;
	}

	@media (prefers-color-scheme: dark) {
		.container {
			box-shadow:
				0 2px 4px rgba(0, 0, 0, 0.1),
				inset 0 0 5px rgba(0, 0, 0, 0.05);
		}
	}

	.chat-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		max-height: 400px;
		overflow-y: auto;
	}

	.chat-header {
		padding: 0.5rem;
		border-bottom: 1px solid hsl(var(--border));
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: hsl(var(--card));
		border-top-left-radius: 0.5rem;
		border-top-right-radius: 0.5rem;
		box-shadow:
			0 1px 2px rgba(0, 0, 0, 0.1),
			inset 0 0 3px rgba(0, 0, 0, 0.05);
	}

	.chat-header h1 {
		font-size: 0.85rem;
		margin: 0;
		color: hsl(var(--foreground));
	}

	.online-status {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		color: hsl(142.1 76.2% 36.3%);
		font-size: 0.65rem;
	}

	.status-dot {
		width: 6px;
		height: 6px;
		background-color: hsl(142.1 76.2% 36.3%);
		border-radius: 50%;
	}

	.messages {
		height: 100%;
		flex: 1;
		overflow-y: auto;
		padding: 0.3rem;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		scroll-behavior: smooth;
		background-color: hsl(var(--background));
		box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.05);
	}

	.message-wrapper {
		display: flex;
		margin: 0.1rem 0;
	}

	.message-wrapper.me {
		justify-content: flex-end;
	}

	.message {
		max-width: 80%;
		padding: 0.3rem;
		border-radius: 0.3rem;
		position: relative;
		word-break: break-word;
		display: flex;
		flex-direction: column;
		box-shadow:
			0 1px 2px rgba(0, 0, 0, 0.1),
			inset 0 0 3px rgba(0, 0, 0, 0.05);
	}

	.me .message {
		background-color: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border-bottom-right-radius: 0.2rem;
	}

	.message-wrapper:not(.me) .message {
		background-color: hsl(var(--muted));
		color: hsl(var(--muted-foreground));
		border-bottom-left-radius: 0.2rem;
	}

	.message-timestamp {
		font-size: 0.55rem;
		opacity: 0.7;
		margin-top: 0.1rem;
		text-align: right;
	}

	.input-container {
		padding: 0.3rem;
		border-top: 1px solid hsl(var(--border));
		display: flex;
		gap: 0.3rem;
		align-items: flex-end;
		background-color: hsl(var(--card));
		border-bottom-left-radius: 0.5rem;
		border-bottom-right-radius: 0.5rem;
		box-shadow:
			0 -1px 2px rgba(0, 0, 0, 0.1),
			inset 0 0 3px rgba(0, 0, 0, 0.05);
	}

	.input {
		flex: 1;
		min-height: 25px;
		max-height: 100px;
		padding: 0.3rem;
		border: 1px solid hsl(var(--border));
		border-radius: 0.3rem;
		background-color: hsl(var(--background));
		color: hsl(var(--foreground));
		resize: vertical; /* Allow vertical resizing */
		font-family: inherit;
		font-size: 0.65rem;
		line-height: 1.2;
		outline: none;
		transition: all 0.2s ease;
		box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.05);
	}

	.input:focus {
		border-color: hsl(var(--ring));
		box-shadow:
			0 0 0 1px hsl(var(--background)),
			0 0 0 2px hsl(var(--ring) / 0.3),
			inset 0 0 3px rgba(0, 0, 0, 0.05);
	}

	.input::placeholder {
		color: hsl(var(--muted-foreground));
	}

	.send-button {
		background-color: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border: none;
		border-radius: 0.3rem;
		width: 35px;
		height: 35px; /* Keep the button height fixed */
		padding: 0.3rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		flex-shrink: 0;
		box-shadow:
			0 1px 2px rgba(0, 0, 0, 0.1),
			inset 0 0 3px rgba(0, 0, 0, 0.05);
	}

	.send-button:hover {
		background-color: hsl(var(--primary) / 0.9);
	}

	.send-button:focus-visible {
		outline: none;
		box-shadow:
			0 0 0 1px hsl(var(--background)),
			0 0 0 2px hsl(var(--ring)),
			inset 0 0 3px rgba(0, 0, 0, 0.05);
	}

	.send-button svg {
		width: 20px;
		height: 20px;
	}

	.message-sender {
		font-size: 0.55rem;
		opacity: 0.7;
		margin-bottom: 0.1rem;
	}
</style>
