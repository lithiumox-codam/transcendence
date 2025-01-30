<script>
	let isOpen = $state(false);
	let messages = $state([]);
	let newMessage = $state('');

	const sendMessage = () => {
		if (!newMessage.trim()) return;

		// Add user message
		messages = [
			...messages,
			{
				text: newMessage,
				sender: 'user',
				timestamp: new Date().toLocaleTimeString()
			}
		];

		// Mock assistant response
		setTimeout(() => {
			messages = [
				...messages,
				{
					text: 'Thanks for your message! This is a mock response.',
					sender: 'assistant',
					timestamp: new Date().toLocaleTimeString()
				}
			];
		}, 1000);

		newMessage = '';
	};

	$effect(() => {
		if (isOpen) {
			const messagesEnd = document.getElementById('messages-end');
			messagesEnd?.scrollIntoView({ behavior: 'smooth' });
		}
	});
</script>

<div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
	{#if isOpen}
		<div class="chat-container">
			<div class="chat-header">
				<h2>Chat Support</h2>
				<button onclick={() => (isOpen = false)} class="close-button">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="icon"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
				</button>
			</div>

			<div class="chat-messages">
				{#each messages as message}
					<div class="message {message.sender}">
						<div class="message-content">
							<p>{message.text}</p>
							<p class="timestamp">{message.timestamp}</p>
						</div>
					</div>
				{/each}
				<div id="messages-end" />
			</div>

			<div class="chat-input">
				<input
					bind:value={newMessage}
					onkeydown={(e) => e.key === 'Enter' && sendMessage()}
					placeholder="Type your message..."
				/>
				<button onclick={sendMessage} class="send-button">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="icon"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="m5 12 7-7 7 7" />
						<path d="M12 19V5" />
					</svg>
				</button>
			</div>
		</div>
	{:else}
		<button onclick={() => (isOpen = true)} class="open-button">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="icon"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
			</svg>
		</button>
	{/if}
</div>

<style>
	.chat-container {
		width: 360px;
		max-width: 100%;
		background-color: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: var(--radius);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		animation: fadeIn 0.3s ease-in-out;
	}

	.chat-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px;
		border-bottom: 1px solid hsl(var(--border));
		background-color: hsl(var(--popover));
		border-top-left-radius: var(--radius);
		border-top-right-radius: var(--radius);
	}

	.chat-header h2 {
		margin: 0;
		font-size: 16px;
		font-weight: 600;
	}

	.close-button {
		background: none;
		border: none;
		cursor: pointer;
	}

	.chat-messages {
		flex: 1;
		padding: 16px;
		overflow-y: auto;
	}

	.message {
		display: flex;
		margin-bottom: 12px;
	}

	.message.user {
		justify-content: flex-end;
	}

	.message.assistant {
		justify-content: flex-start;
	}

	.message-content {
		max-width: 80%;
		padding: 8px 12px;
		border-radius: var(--radius);
		background-color: hsl(var(--muted));
		color: hsl(var(--foreground));
	}

	.message.user .message-content {
		background-color: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
	}

	.timestamp {
		font-size: 10px;
		color: hsl(var(--muted-foreground));
		margin-top: 4px;
		text-align: right;
	}

	.chat-input {
		display: flex;
		padding: 16px;
		border-top: 1px solid hsl(var(--border));
		background-color: hsl(var(--input));
		border-bottom-left-radius: var(--radius);
		border-bottom-right-radius: var(--radius);
	}

	.chat-input input {
		flex: 1;
		padding: 8px 12px;
		border: 1px solid hsl(var(--border));
		border-radius: 4px;
		outline: none;
	}

	.send-button {
		background: none;
		border: none;
		cursor: pointer;
		margin-left: 8px;
	}

	.open-button {
		width: 48px;
		height: 48px;
		background-color: hsl(var(--primary));
		border: none;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s ease-in-out;
	}

	.open-button:hover {
		transform: scale(1.1);
	}

	.icon {
		width: 24px;
		height: 24px;
		stroke: hsl(var(--primary-foreground));
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
