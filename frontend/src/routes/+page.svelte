<script>
	let {data} = $props();
	
	let messages = $state([]);
	let newMessage = $state('');
	let messageContainer;
	let userId = $state('');

	// Generate or retrieve user ID on mount
	function generateUserId() {
		const storedId = localStorage.getItem('chatUserId');
		if (storedId) {
			return storedId;
		}
		
		const randomId = Math.random().toString(36).substring(2, 7);
		localStorage.setItem('chatUserId', randomId);
		return randomId;
	}

	// Initialize userId when component mounts
	$effect(() => {
		userId = generateUserId();
	});

	const ws = new WebSocket('wss://localhost/api/ws/');

	// Fix autoscroll by using a reactive statement
	$effect(() => {
		if (messageContainer && messages.length > 0) {
			messageContainer.scrollTo({
				top: messageContainer.scrollHeight,
				behavior: 'smooth'
			});
		}
	});

	ws.onopen = () => {
		console.log('Connected to the WS server');
	};

	ws.onmessage = (event) => {
		const message = JSON.parse(event.data);
		if (Array.isArray(message)) {
			messages.push(...message.map(msg => ({
				...msg,
				timestamp: Date.now()
			})));
			return;
		}
		messages.push({
			...message,
			timestamp: Date.now()
		});
	};

	ws.onclose = () => {
		console.log('Disconnected from the WS server');
	};

	ws.onerror = (error) => {
		console.error('Error:', error);
	};

	function sendMessage() {
		if (newMessage.trim()) {
			const messageData = {
				message: newMessage,
				sender: userId
			};
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
		return new Date(timestamp).toLocaleTimeString([], { 
			hour: '2-digit', 
			minute: '2-digit' 
		});
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
				style="min-height: 40px; max-height: 40px; padding-top: 8px;"
			></textarea>
			<button onclick={sendMessage} aria-label="Send" class="send-button">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="22" y1="2" x2="11" y2="13"></line>
					<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
				</svg>
			</button>
		</div>
	</div>
</section>

<style>
	.container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 70vh;
		width: 100%;
		padding: 1rem;
		background-color: hsl(var(--background));
	}

	.chat-container {
		width: 100%;
		max-width: 800px;
		height: 80vh;
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 0.75rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
	}

	.chat-header {
		padding: 1rem 1.5rem;
		border-bottom: 1px solid hsl(var(--border));
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.chat-header h1 {
		font-size: 1.5rem;
		margin: 0;
		color: hsl(var(--foreground));
	}

	.online-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: hsl(142.1 76.2% 36.3%);
		font-size: 0.875rem;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		background-color: hsl(142.1 76.2% 36.3%);
		border-radius: 50%;
	}

	.messages {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		scroll-behavior: smooth;
		background-color: hsl(var(--background));
	}

	.message-wrapper {
		display: flex;
		margin: 0.2rem 0;
	}

	.message-wrapper.me {
		justify-content: flex-end;
	}

	.message {
		max-width: 70%;
		padding: 0.75rem 1rem;
		border-radius: 0.75rem;
		position: relative;
		word-break: break-word;
		display: flex;
		flex-direction: column;
	}

	.me .message {
		background-color: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border-bottom-right-radius: 0.25rem;
	}

	.message-wrapper:not(.me) .message {
		background-color: hsl(var(--muted));
		color: hsl(var(--muted-foreground));
		border-bottom-left-radius: 0.25rem;
	}

	.message-timestamp {
		font-size: 0.75rem;
		opacity: 0.7;
		margin-top: 0.2rem;
		text-align: right;
	}

	.input-container {
		padding: 1rem;
		border-top: 1px solid hsl(var(--border));
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.input {
		flex: 1;
		min-height: 40px;
		max-height: 40px !important;
		padding: 8px 1rem;
		border: 1px solid hsl(var(--border));
		border-radius: 0.5rem;
		background-color: hsl(var(--background));
		color: hsl(var(--foreground));
		resize: none;
		font-family: inherit;
		font-size: 0.875rem;
		line-height: 1.5;
		outline: none;
		transition: all 0.2s ease;
	}

	.input:focus {
		border-color: hsl(var(--ring));
		box-shadow: 0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(var(--ring) / 0.3);
	}

	.input::placeholder {
		color: hsl(var(--muted-foreground));
	}

	.send-button {
		background-color: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border: none;
		border-radius: 0.5rem;
		width: 40px;
		height: 40px;
		padding: 0.5rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.send-button:hover {
		background-color: hsl(var(--primary) / 0.9);
	}

	.send-button:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(var(--ring));
	}

	.send-button svg {
		width: 18px;
		height: 18px;
	}

	.message-sender {
		font-size: 0.75rem;
		opacity: 0.7;
		margin-bottom: 0.2rem;
	}

	@media (max-width: 600px) {
		.container {
			padding: 0;
		}

		.chat-container {
			height: 100vh;
			border-radius: 0;
			border: none;
		}
	}
</style>
