<script>
	import { getContext, onMount } from 'svelte';
	import { Chat } from '$lib/classes/chat.svelte';

	const WS = getContext('ws');
	let chat = new Chat(WS);
	let selectedChannel = $state(chat.getFirstChannel());
	let messages = $state([]);
	let channel = $state(null);
	let message = $state('');

	onMount(async () => {
		selectedChannel = await chat.getFirstChannel();
		updateState(selectedChannel);
	});

	// Format date to a readable string
	function formatDate(dateString) {
		const date = new Date(dateString);
		return date.toLocaleString();
	}

	function updateState(selected_channel) {
		selectedChannel = selected_channel;
		channel = chat.channels.get(selectedChannel) || null;
		if (channel) {
			messages = chat.messages.get(selectedChannel) || [];
		}
	}
</script>

<div class="chat-container">
	<!-- Combined tabs into the chat container -->
	<div class="tab-picker merged-tabs">
		{#if !chat.channels?.size}
			<div class="empty-state">
				<p>No channels available.</p>
			</div>
		{:else}
			{#each [...chat.channels] as [id, channelObj]}
				<button
					class="tab-button {id === selectedChannel ? 'active' : ''}"
					onclick={() => updateState(id)}
				>
					{channelObj.name}
				</button>
			{/each}
		{/if}
	</div>

	{#if channel}
		<!-- Cooler header -->
		<div class="chat-header">
			<h2 class="channel-title">{channel.name}</h2>
			<p class="channel-meta">Created: {formatDate(channel.created_at)}</p>
			<p class="channel-meta">Members: {channel.users.join(', ')}</p>
		</div>

		<div class="messages">
			{#if messages.length === 0}
				<div class="empty-state">
					<p>No messages yet. Start the conversation!</p>
				</div>
			{:else}
				{#each messages as message}
					<div class="message">
						<div class="message-header">
							<strong>{message.user}</strong>
							<span class="message-timestamp">{formatDate(message.timestamp)}</span>
						</div>
						<div class="message-content">{message.content}</div>
					</div>
				{/each}
			{/if}
		</div>

		<!-- Chat field & send button -->
		<div class="message-input">
			<input type="text" bind:value={message} placeholder="Type your message..." />
			<button
				onclick={() => {
					chat.sendMessage(selectedChannel, message);
				}}>Send</button
			>
		</div>
	{:else}
		<div class="empty-state">
			<p>Please select a channel to see messages.</p>
		</div>
	{/if}
</div>

<style>
	.chat-container {
		background-color: hsl(var(--card));
		color: hsl(var(--card-foreground));
		border-radius: var(--radius);
		padding: 0;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.merged-tabs {
		background-color: hsl(var(--accent));
		color: hsl(var(--accent-foreground));
		padding: 0.5rem;
		display: flex;
		gap: 1rem;
	}

	.chat-header {
		padding: 1rem;
		background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%);
		color: hsl(var(--primary-foreground));
	}

	.messages {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		max-height: 20rem;
		overflow-y: auto;
	}

	.message-input {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		border-top: 1px solid hsl(var(--border));
		padding: 0.75rem 1rem;
		background-color: hsl(var(--card));
	}

	.message-input input {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid hsl(var(--border));
		border-radius: var(--radius);
		background: hsl(var(--muted));
		color: hsl(var(--foreground));
	}

	.message-input button {
		padding: 0.5rem 1rem;
		background-color: hsl(var(--primary));
		border: none;
		border-radius: var(--radius);
		color: hsl(var(--primary-foreground));
		cursor: pointer;
	}

	/* Existing styles below this point left as-is */
	.empty-state {
		text-align: center;
		padding: 2rem;
		border: 1px dashed hsl(var(--border));
		border-radius: var(--radius);
		background-color: hsl(var(--muted));
		color: hsl(var(--muted-foreground));
	}

	.tab-button {
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		font-size: 0.875rem;
		color: hsl(var(--accent-foreground));
		cursor: pointer;
		transition:
			color 0.2s,
			border-color 0.2s;
	}

	.tab-button:hover {
		color: hsl(var(--foreground));
	}

	.tab-button.active {
		color: hsl(var(--accent));
		border-color: hsl(var(--accent-foreground));
	}

	.channel-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
	}

	.channel-meta {
		font-size: 0.875rem;
		margin: 0.25rem 0 0;
	}

	.message {
		padding: 0.75rem;
		border: 1px solid hsl(var(--border));
		border-radius: var(--radius);
		background-color: hsl(var(--muted));
	}

	.message-header {
		display: flex;
		justify-content: space-between;
		font-size: 0.875rem;
		color: hsl(var(--foreground));
	}

	.message-timestamp {
		color: hsl(var(--muted-foreground));
	}

	.message-content {
		margin-top: 0.25rem;
		color: hsl(var(--foreground));
	}
</style>
