<script>
	import AvatarUpload from '$lib/components/AvatarUpload.svelte';
	import chat from '$lib/classes/chat.svelte';
	import Message from '$lib/components/chat/Message.svelte';
	import Icon, { _api } from '@iconify/svelte';
	import viewport from '$lib/utils/viewport';

	let message = $state('');
	let inputContainer = $state(null);

	function handleSubmit(e) {
		e.preventDefault();
		chat.sendMessage(message);
		message = '';
		inputContainer.focus();
	}
</script>

{#snippet channelItem(channel)}
	<button
		class="list-group-item d-flex align-items-center"
		onclick={() => chat.changeChannel(channel.id)}
		class:active={channel.id === chat.selectedChannel}
	>
		<!-- create a rounded box svg that can server as an icon -->
		<Icon icon="radix-icons:chat-bubble" class="m-1 " />
		<div class="d-flex flex-column">
			<strong>{channel.name}</strong>
			{#if channel.latest_message}
				{@const msg = channel.latest_message}
				<small class="">
					{msg.user}: {msg.content.slice(0, 15)} {msg.content.length > 15 ? '...' : ''}</small
				>
			{/if}
		</div>
	</button>
{/snippet}

<AvatarUpload />

<div class="maxheight d-flex flex-column">
	<div class="row flex-grow-1 overflow-hidden">
		<!-- Sidebar -->
		<div class="col-3 p-0 border-end overflow-auto bg-body-tertiary">
			<div class="d-flex justify-content-center align-items-center p-3 border-bottom">
				<h2 class="">Chat</h2>
			</div>
			<div class="">
				{#if !chat.channels.length}
					<div class="alert alert-info m-3" role="alert">No channels available.</div>
				{:else}
					<ul class="list-group list-group-flush">
						{#each chat.channels as channel}
							{@render channelItem(channel)}
						{/each}
						<button class="btn btn-light m-3">+</button>
					</ul>
				{/if}
			</div>
		</div>

		<!-- Main Chat Area -->
		<div class="col-9 d-flex flex-column h-100 p-0">
			{#if chat.selectedChannel}
				<div
					class="border-bottom p-3 flex-shrink-0 d-flex justify-content-between align-items-center"
				>
					<h2>{chat.channel.name}</h2>
					<!-- hamburger menu to do changes -->
					<button
						class="btn btn-light text-center d-flex align-items-center justify-content-center"
						onclick={() => chat.close()}
					>
						<Icon icon="radix-icons:pencil-2" class="" />
					</button>
				</div>

				<div class="flex-fill overflow-y-auto p-3" bind:this={chat.messagesContainer}>
					<div class="d-flex flex-column gap-1">
						{#if chat.messages.length === 0}
							<div class="alert alert-secondary" role="alert">
								No messages yet. Start the conversation!
							</div>
						{:else}
							{#if !chat.endReached && chat.messages.length > 9}
								<button
									class="btn btn-light m-3"
									use:viewport
									onenterViewport={() => chat.getChannelMessages(chat.selectedChannel)}
								>
									Load more
								</button>
							{/if}
							{#each chat.messages as message}
								<Message {message} />
							{/each}
						{/if}
					</div>
				</div>

				<form class="d-flex p-3 border-top flex-shrink-0" onsubmit={handleSubmit}>
					<input
						type="text"
						bind:value={message}
						bind:this={inputContainer}
						class="form-control me-2"
						placeholder="Type your message..."
					/>
					<button class="btn btn-primary" onclick={handleSubmit}> Send </button>
				</form>
			{:else}
				<div class="d-flex justify-content-center align-items-center flex-fill">
					<div class="alert alert-warning" role="alert">
						Please select a channel to see messages.
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	.maxheight {
		height: 94vh;
	}
</style>
