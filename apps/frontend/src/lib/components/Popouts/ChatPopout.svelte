<script lang="ts">
    import { client } from "$lib/trpc";
    import { Chat } from "$lib/classes/Chat.svelte";
    import { UserClass } from "$lib/classes/User.svelte";
    import { getContext, onMount } from "svelte";
    import { goto } from "$app/navigation";
    import Avatar from "../Avatar.svelte";
    import GameInvite from "../GameInvite.svelte";

    let userClass = getContext<UserClass>("user");
    let chat = getContext<Chat>("chat");
    let newMessage = $state("");

    let updateTimestampInterval = $state<number | null>(null);

    function parseGameInvite(content: string): string | null {
        const match = content.match(/^invite:\/\/(\S+)$/);
        return match ? match[1] : null; // Return the captured gameId (group 1) or null
    }

    function adjustTimezone(
        timestamp: Date | number | string | null | undefined,
    ): Date {
        if (!timestamp) return new Date();

        const date = new Date(timestamp);
        date.setHours(date.getHours() + 2);
        return date;
    }

    function formatRelativeTime(
        timestamp: Date | number | string | null | undefined,
    ): string {
        if (!timestamp) return "";

        const now = new Date();
        const messageTime = adjustTimezone(timestamp ?? undefined);
        const diffInMs = now.getTime() - messageTime.getTime();
        const diffInSecs = Math.floor(diffInMs / 1000);
        const diffInMins = Math.floor(diffInSecs / 60);

        if (diffInMins < 10) {
            if (diffInSecs < 60) return "just now";
            return `${diffInMins}m ago`;
        }

        return messageTime.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    }

    function hasTimeGap(
        currMsg: { createdAt?: Date | number | string | null },
        prevMsg: { createdAt?: Date | number | string | null },
    ): boolean {
        if (!prevMsg || !currMsg) return false;

        const currTime = adjustTimezone(currMsg.createdAt ?? undefined);
        const prevTime = adjustTimezone(prevMsg.createdAt ?? undefined);

        return (
            currTime.getDate() !== prevTime.getDate() ||
            currTime.getMonth() !== prevTime.getMonth() ||
            currTime.getFullYear() !== prevTime.getFullYear()
        );
    }

    function formatDateForGap(
        timestamp: Date | number | string | null | undefined,
    ): string {
        if (!timestamp) return "";

        const messageDate = adjustTimezone(timestamp ?? undefined);
        return messageDate.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year:
                messageDate.getFullYear() !== new Date().getFullYear()
                    ? "numeric"
                    : undefined,
        });
    }

    onMount(() => {
        setTimeout(() => {
            chat.resetObserver();
            chat.scrollDown();
        }, 100);

        updateTimestampInterval = setInterval(() => {
            if (chat.selectedFriend) {
                const messages = chat.messages.get(chat.selectedFriend);
                if (messages) {
                    for (const msg of messages) {
                        adjustTimezone(msg.createdAt ?? undefined).getTime();
                    }
                }
            }
        }, 30000) as unknown as number;

        return () => {
            if (updateTimestampInterval) {
                clearInterval(updateTimestampInterval);
                updateTimestampInterval = null;
            }
        };
    });

    $effect(() => {
        if (chat.selectedFriend) {
            setTimeout(() => chat.resetObserver(), 50);
        }
    });

    async function sendMessage(friendId: number | null) {
        if (!newMessage.trim() || !friendId) return;
        try {
            await client.chat.create.mutate({
                receiverId: friendId,
                content: newMessage.trim(),
            });
            newMessage = "";
        } catch (error) {
            console.error(error);
        }
    }
</script>

<main class="flex h-full w-full overflow-hidden bg-black text-white">
    <aside
        class="w-1/4 min-w-40 max-w-64 bg-gradient-to-b from-blue-500/5 to-cyan-400/5 border-r border-white/10 flex flex-col h-full overflow-hidden"
    >
        <header
            class="text-lg font-semibold text-white p-3 border-b border-white/10 bg-blue-500/10"
        >
            Chats
        </header>
        <nav class="flex flex-col overflow-y-auto flex-grow">
            {#if userClass.friends?.length}
                {#each userClass.friends as friend, index (friend.id)}
                    <button
                        class="flex items-center px-3 py-2 text-left transition duration-300 hover:bg-white/5
                            {chat.selectedFriend === friend.id
                            ? 'bg-white/10 border-l-4 border-cyan-400/30'
                            : ''}"
                        onclick={() => (chat.selectedFriend = friend.id)}
                    >
                        <div class="flex-shrink-0 mr-3">
                            <Avatar
                                avatar={friend.avatar}
                                name={friend.name}
                                class="w-10 h-10 rounded-full object-cover border border-white/10"
                            />
                        </div>
                        <div class="overflow-hidden">
                            <span
                                class="font-semibold text-white truncate block"
                            >
                                {friend.name}
                            </span>
                            <span class="text-xs text-gray-400 truncate block">
                                {#if chat.messages.get(friend.id)?.length}
                                    {@const message =
                                        chat.messages.get(friend.id) ?? []}
                                    {message[message.length - 1].content}
                                {:else}
                                    No messages yet
                                {/if}
                            </span>
                        </div>
                    </button>
                    {#if index < userClass.friends.length - 1}
                        <hr class="border-white/5" />
                    {/if}
                {/each}
            {:else}
                <p class="text-gray-500 text-sm p-3">No friends yet.</p>
            {/if}
        </nav>
    </aside>

    <section
        class="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-gradient-to-b from-blue-500/5 to-cyan-400/5"
    >
        {#if chat.selectedFriend}
            <div class="flex flex-col h-full">
                <header
                    class="p-3 bg-gradient-to-r from-blue-500/10 to-cyan-400/10 border-b border-white/10"
                >
                    <div class="flex justify-between items-center w-full">
                        <h3 class="text-lg font-semibold text-white truncate">
                            {userClass.friends.find(
                                (friend) => friend.id === chat.selectedFriend,
                            )?.name}
                        </h3>

                        <div class="flex space-x-2">
                            <button
                                class="bg-blue-500/50 hover:bg-blue-600/50 text-white text-xs font-medium py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-150"
                                onclick={() =>
                                    goto(`/user/${chat.selectedFriend}`)}
                            >
                                Profile
                            </button>
                            <button
                                class="bg-cyan-500/50 hover:bg-cyan-600/50 text-white text-xs font-medium py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-150"
                                onclick={async () => {
                                    if (chat.selectedFriend) {
                                        await client.game.sendInvite.mutate(
                                            chat.selectedFriend,
                                        );
                                    }
                                }}
                            >
                                Invite to Game
                            </button>
                        </div>
                    </div>
                </header>
                <div
                    class="flex-1 p-3 space-y-2 flex flex-col overflow-auto min-h-0"
                    bind:this={chat.messagesContainer}
                >
                    {#if chat.messages.get(chat.selectedFriend)}
                        <div bind:this={chat.loadMoreTrigger}>
                            {#if chat.endReached}
                                <p class="text-gray-500 text-sm text-center">
                                    No more messages.
                                </p>
                            {:else}
                                <svg
                                    class="animate-spin h-6 w-6 mx-auto text-cyan-300"
                                    viewBox="0 0 32 32"
                                >
                                    <circle
                                        cx="16"
                                        cy="16"
                                        r="14"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                    />
                                </svg>
                            {/if}
                        </div>
                        {#each chat.messages.get(chat.selectedFriend) ?? [] as message, i (message.id)}
                            {#if i > 0 && hasTimeGap(message, chat.messages.get(chat.selectedFriend)?.[i - 1] ?? { createdAt: null })}
                                <div class="flex justify-center my-4">
                                    <div
                                        class="px-3 py-1 bg-gray-800/50 rounded-full text-xs text-gray-400"
                                    >
                                        {formatDateForGap(message.createdAt)}
                                    </div>
                                </div>
                            {/if}
                            <!-- Inside the #each loop for messages -->

                            <!-- Section for USER'S messages -->
                            {#if message.senderId === userClass.data?.id}
                                {@const gameId = parseGameInvite(
                                    message.content,
                                )}
                                <div class="flex justify-end mb-2 items-start">
                                    <div
                                        class="max-w-[80%] p-3 rounded-lg bg-white/5 text-white border border-white/10 shadow-sm animate-fade-in mr-2 message-content"
                                    >
                                        <!-- START CHANGE HERE -->
                                        {#if gameId}
                                            <GameInvite {gameId} />
                                        {:else}
                                            <p class="text-sm">
                                                {message.content}
                                            </p>
                                        {/if}
                                        <!-- END CHANGE HERE -->
                                        <div
                                            class="text-[10px] opacity-50 mt-1 text-right"
                                        >
                                            {formatRelativeTime(
                                                message.createdAt,
                                            )}
                                        </div>
                                    </div>
                                    <div class="flex-shrink-0">
                                        <Avatar
                                            avatar={userClass.data.avatar}
                                            name={userClass.data.name}
                                            class="w-7 h-7 rounded-full object-cover border border-white/10"
                                        />
                                    </div>
                                </div>
                                <!-- Section for FRIEND'S messages -->
                            {:else}
                                {@const friend = userClass.friends.find(
                                    (f) => f.id === message.senderId,
                                )}
                                {@const gameId = parseGameInvite(
                                    message.content,
                                )}
                                <div
                                    class="flex justify-start mb-2 items-start"
                                >
                                    <div class="flex-shrink-0 mr-2">
                                        <Avatar
                                            avatar={friend?.avatar || null}
                                            name={friend?.name || ""}
                                            class="w-7 h-7 rounded-full object-cover border border-white/10"
                                        />
                                    </div>
                                    <div
                                        class="max-w-[80%] p-3 rounded-lg bg-white/5 text-white border border-white/10 shadow-sm animate-fade-in message-content"
                                    >
                                        <!-- START CHANGE HERE -->
                                        {#if gameId}
                                            <GameInvite {gameId} />
                                        {:else}
                                            <p class="text-sm">
                                                {message.content}
                                            </p>
                                        {/if}
                                        <!-- END CHANGE HERE -->
                                        <div
                                            class="text-[10px] opacity-50 mt-1"
                                        >
                                            {formatRelativeTime(
                                                message.createdAt,
                                            )}
                                        </div>
                                    </div>
                                </div>
                            {/if}
                        {/each}
                    {:else}
                        <p class="text-gray-500 text-sm">No messages yet.</p>
                    {/if}
                </div>
                <footer
                    class="p-3 bg-gradient-to-r from-blue-500/10 to-cyan-400/10 border-t border-white/10"
                >
                    <div class="flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            bind:value={newMessage}
                            class="flex-grow border border-white/10 rounded-full py-2 px-4 bg-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            onkeydown={(e) =>
                                e.key === "Enter" &&
                                sendMessage(chat.selectedFriend)}
                        />
                        <button
                            class="bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2 px-4 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:opacity-50"
                            disabled={!newMessage.trim()}
                            onclick={() => sendMessage(chat.selectedFriend)}
                        >
                            Send
                        </button>
                    </div>
                </footer>
            </div>
        {:else}
            <div class="flex items-center justify-center h-full bg-black">
                <p class="text-gray-500 text-sm">
                    Select a friend to start chatting.
                </p>
            </div>
        {/if}
    </section>
</main>

<style>
    .animate-fade-in {
        animation: fadeIn 0.2s ease-out forwards;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(5px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .message-content {
        overflow-wrap: break-word;
        word-wrap: break-word;
        word-break: break-word;
        hyphens: auto;
    }
</style>


<!-- <script lang="ts">
    import { client } from "$lib/trpc";
    import { Chat } from "$lib/classes/Chat.svelte";
    import { UserClass } from "$lib/classes/User.svelte";
    import { getContext, onMount } from "svelte";
    import { goto } from "$app/navigation";
    import Avatar from "../Avatar.svelte";
    import GameInvite from "../GameInvite.svelte";
    import { User, MessageCircle, Trash2 } from "@lucide/svelte"; // Import icons

    let userClass = getContext<UserClass>("user");
    let chat = getContext<Chat>("chat");
    let newMessage = $state("");

    let updateTimestampInterval = $state<number | null>(null);

    function parseGameInvite(content: string): string | null {
        const match = content.match(/^invite:\/\/(\S+)$/);
        return match ? match[1] : null; // Return the captured gameId (group 1) or null
    }

    function adjustTimezone(
        timestamp: Date | number | string | null | undefined,
    ): Date {
        if (!timestamp) return new Date();

        const date = new Date(timestamp);
        // Removed timezone adjustment, assuming server/client times are handled correctly or UTC is preferred
        return date;
    }

    function formatRelativeTime(
        timestamp: Date | number | string | null | undefined,
    ): string {
        if (!timestamp) return "";

        const now = new Date();
        const messageTime = adjustTimezone(timestamp ?? undefined);
        const diffInMs = now.getTime() - messageTime.getTime();
        const diffInSecs = Math.floor(diffInMs / 1000);
        const diffInMins = Math.floor(diffInSecs / 60);
        const diffInHours = Math.floor(diffInMins / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInSecs < 60) return "just now";
        if (diffInMins < 60) return `${diffInMins}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays === 1) return "yesterday";
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return messageTime.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
        });
    }

    function hasTimeGap(
        currMsg: { createdAt?: Date | number | string | null },
        prevMsg: { createdAt?: Date | number | string | null },
    ): boolean {
        if (!prevMsg || !currMsg) return false;

        const currTime = adjustTimezone(currMsg.createdAt ?? undefined);
        const prevTime = adjustTimezone(prevMsg.createdAt ?? undefined);

        // Check if they are on different days
        return (
            currTime.getDate() !== prevTime.getDate() ||
            currTime.getMonth() !== prevTime.getMonth() ||
            currTime.getFullYear() !== prevTime.getFullYear()
        );
    }

    function formatDateForGap(
        timestamp: Date | number | string | null | undefined,
    ): string {
        if (!timestamp) return "";

        const messageDate = adjustTimezone(timestamp ?? undefined);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (messageDate.toDateString() === today.toDateString()) {
            return "Today";
        }
        if (messageDate.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        }

        return messageDate.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year:
                messageDate.getFullYear() !== today.getFullYear()
                    ? "numeric"
                    : undefined,
        });
    }

    onMount(() => {
        setTimeout(() => {
            chat.resetObserver();
            chat.scrollDown();
        }, 100);

        updateTimestampInterval = setInterval(() => {
            if (chat.selectedFriend) {
                const messages = chat.messages.get(chat.selectedFriend);
                if (messages) {
                    // Trigger reactivity by re-assigning (though $state should handle this)
                    chat.messages.set(chat.selectedFriend, [...messages]);
                }
            }
        }, 30000) as unknown as number; // Update every 30 seconds

        return () => {
            if (updateTimestampInterval) {
                clearInterval(updateTimestampInterval);
                updateTimestampInterval = null;
            }
        };
    });

    $effect(() => {
        if (chat.selectedFriend) {
            setTimeout(() => chat.resetObserver(), 50);
        }
    });

    async function sendMessage(friendId: number | null) {
        if (!newMessage.trim() || !friendId) return;
        try {
            await client.chat.create.mutate({
                receiverId: friendId,
                content: newMessage.trim(),
            });
            newMessage = "";
        } catch (error) {
            console.error(error);
        }
    }

    async function deleteMessage(messageId: number) {
        try {
            await client.chat.delete.mutate(messageId);
            // The listener should handle the removal from the UI
        } catch (error) {
            console.error("Failed to delete message:", error);
        }
    }

    function viewProfile(userId: number | null) {
        if (userId) {
            goto(`/user/${userId}`);
        }
    }
</script>

<main
    class="flex h-full w-full overflow-hidden bg-black/10 text-white backdrop-blur-sm"
>
    <aside
	class="w-1/4 min-w-48 max-w-64 bg-black/10 border-r border-white/10 flex flex-col h-full overflow-hidden backdrop-blur-sm"
>
	<header
		class="text-lg font-semibold text-white p-3 border-b border-white/10 bg-black/10 flex items-center gap-2"
	>
		<MessageCircle class="w-5 h-5 text-cyan-300" />
		Chats
	</header>
	<nav class="flex flex-col overflow-y-auto flex-grow">
		{#if userClass.friends?.length}
			{#each userClass.friends as friend, index (friend.id)}
				<button
					class="flex items-center px-3 py-2.5 text-left transition duration-300 hover:bg-white/10
						{chat.selectedFriend === friend.id
						? 'bg-white/10 border-l-4 border-cyan-400/30'
						: 'bg-transparent'}"
					onclick={() => (chat.selectedFriend = friend.id)}
				>
					<div class="flex-shrink-0 mr-3 relative">
						<Avatar
							name={friend.name}
							avatar={friend.avatar}
							class="w-10 h-10 rounded-full object-cover border border-white/10"
						/>
					</div>
					<div class="overflow-hidden flex-1">
						<span
							class="font-semibold text-white truncate block text-sm"
						>
							{friend.name}
						</span>
						<span class="text-xs text-gray-400 truncate block">
							{#if chat.messages.get(friend.id)?.length}
								{@const lastMsg = chat.messages.get(friend.id)![
									chat.messages.get(friend.id)!.length - 1
								]}
								{#if lastMsg.senderId === userClass.data?.id}You: {/if}{lastMsg.content.startsWith(
									"invite://",
								)
									? "Game Invite"
									: lastMsg.content}
							{:else}
								No messages yet
							{/if}
						</span>
					</div>
				</button>
				{#if index < userClass.friends.length - 1}
					<hr class="border-white/5 mx-3" />
				{/if}
			{/each}
		{:else}
			<p class="text-gray-500 text-sm p-3 text-center">
				No friends yet.
			</p>
		{/if}
	</nav>
</aside>

<section
	class="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-black/10 backdrop-blur-sm"
>
	{#if chat.selectedFriend}
		{@const selectedFriendData = userClass.friends.find(
			(friend) => friend.id === chat.selectedFriend,
		)}
		<div class="flex flex-col h-full">
			<header
				class="p-3 bg-black/10 border-b border-white/10 flex justify-between items-center"
			>
				{#if selectedFriendData}
					<div class="flex items-center gap-3 min-w-0">
						<Avatar
							name={selectedFriendData.name}
							avatar={selectedFriendData.avatar}
							class="w-8 h-8 rounded-full object-cover border border-white/10"
						/>
						<h3
							class="text-lg font-semibold text-white truncate"
						>
							{selectedFriendData.name}
						</h3>
					</div>
					<div class="flex space-x-2">
						<button
							class="p-1.5 bg-white/5 border border-white/10 text-white rounded-md hover:bg-blue-600/10 transition duration-150"
							onclick={() => viewProfile(chat.selectedFriend)}
							aria-label="View Profile"
						>
							<User class="w-4 h-4" />
						</button>
						<button
							class="p-1.5 bg-white/5 border border-white/10 text-white rounded-md hover:bg-cyan-600/10 transition duration-150 text-xs px-2"
							onclick={async () => {
								if (chat.selectedFriend) {
									await client.game.sendInvite.mutate(
										chat.selectedFriend,
									);
								}
							}}
						>
							Invite
						</button>
					</div>
				{:else}
					<div class="text-gray-400">Loading...</div>
				{/if}
			</header>

			<div
				class="flex-1 p-3 space-y-1 flex flex-col overflow-y-auto min-h-0 scroll-smooth"
				bind:this={chat.messagesContainer}
			>
				{#if chat.messages.get(chat.selectedFriend)}
					<div
						bind:this={chat.loadMoreTrigger}
						class="h-1 opacity-0"
					>
						{#if chat.endReached}
							<p
								class="text-center text-xs text-gray-500 py-2"
							>
								Beginning of chat history
							</p>
						{:else}
							<p
								class="text-center text-xs text-gray-500 py-2"
							>
								Loading...
							</p>
						{/if}
					</div>

					{#each chat.messages.get(chat.selectedFriend) ?? [] as message, i (message.id)}
						{@const isUserMessage = message.senderId === userClass.data?.id}
						{@const gameInviteId = parseGameInvite(message.content)}

						<div
							class={`flex items-end gap-2 group ${
								isUserMessage ? "justify-end" : "justify-start"
							}`}
						>
							{#if !isUserMessage}
								<Avatar
									name={selectedFriendData?.name ?? "Friend"}
									avatar={selectedFriendData?.avatar ?? null}
									class="w-6 h-6 rounded-full self-end mb-1 flex-shrink-0"
								/>
							{/if}

							<div
								class={`relative max-w-xs md:max-w-md lg:max-w-lg p-2.5 rounded-lg shadow message-content border ${
									isUserMessage
										? "bg-blue-600/20 border-blue-500/30 text-white rounded-br-none"
										: "bg-white/5 border-white/10 text-gray-200 rounded-bl-none"
								}`}
							>
								{#if gameInviteId}
									<GameInvite gameId={parseInt(gameInviteId)} />
								{:else}
									<p class="text-sm">{message.content}</p>
								{/if}
							</div>

						</div>
					{/each}
				{:else}
					<p class="text-gray-500 text-sm text-center flex-1 flex items-center justify-center">
						No messages yet. Start the conversation!
					</p>
				{/if}
			</div>

			<footer class="p-3 bg-black/10 border-t border-white/10">
				<div class="flex items-center space-x-2">
					<input
						type="text"
						placeholder="Type a message..."
						bind:value={newMessage}
						class="flex-grow border border-gray-600/20 rounded-full py-2 px-4 bg-gray-700/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
						onkeydown={(e) =>
							e.key === "Enter" &&
							!e.shiftKey &&
							(e.preventDefault(),
							sendMessage(chat.selectedFriend))}
					/>
					<button
						class="bg-cyan-500/20 border border-cyan-500/30 hover:bg-cyan-600/30 text-cyan-300 font-medium py-2 px-4 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
						disabled={!newMessage.trim()}
						onclick={() => sendMessage(chat.selectedFriend)}
					>
						Send
					</button>
				</div>
			</footer>
		</div>
	{:else}
		<div
			class="flex flex-col items-center justify-center h-full bg-black/10"
		>
			<MessageCircle class="w-16 h-16 text-gray-600 mb-4" />
			<p class="text-gray-500 text-lg">
				Select a friend to start chatting.
			</p>
		</div>
	{/if}
</section>
</main>

<style>
/* Custom scrollbar for Webkit browsers */
.overflow-y-auto::-webkit-scrollbar {
	width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
	background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
	background-color: rgba(255, 255, 255, 0.2);
	border-radius: 3px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
	background-color: rgba(255, 255, 255, 0.4);
}

.message-content {
	overflow-wrap: break-word;
	word-wrap: break-word;
	word-break: break-word;
	hyphens: auto;
}
</style> -->