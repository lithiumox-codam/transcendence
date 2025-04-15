<script lang="ts">
    import { client } from "$lib/trpc";
    import { Chat } from "$lib/classes/Chat.svelte";
    import { UserClass } from "$lib/classes/User.svelte";
    import { getContext, onMount } from "svelte";

    let userClass = getContext<UserClass>("user");
    let chat = getContext<Chat>("chat");
    let newMessage = $state("");

    let updateTimestampInterval = $state<number | null>(null);

    function getInitials(name: string): string {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    }

    function adjustTimezone(timestamp: Date | number | string | null | undefined): Date {
        if (!timestamp) return new Date();

        const date = new Date(timestamp);
        date.setHours(date.getHours() + 2);
        return date;
    }

    function formatRelativeTime(timestamp: Date | number | string | null | undefined): string {
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

    function formatDateForGap(timestamp: Date | number | string | null | undefined): string {
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
    <aside class="w-1/4 min-w-40 max-w-64 bg-gradient-to-b from-blue-500/5 to-cyan-400/5 border-r border-white/10 flex flex-col h-full overflow-hidden">
        <header class="text-lg font-semibold text-white p-3 border-b border-white/10 bg-blue-500/10">
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
                            {#if friend.avatar}
                                <img
                                    src={friend.avatar}
                                    alt={friend.name}
                                    class="w-10 h-10 rounded-full object-cover border border-white/20"
                                />
                            {:else}
                                <div class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
                                    {getInitials(friend.name)}
                                </div>
                            {/if}
                        </div>
                        <div class="overflow-hidden">
                            <span class="font-semibold text-white truncate block">
                                {friend.name}
                            </span>
                            <span class="text-xs text-gray-400 truncate block">
                                {#if chat.messages.get(friend.id)?.length}
                                    {@const message = chat.messages.get(friend.id) ?? []}
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

    <section class="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-gradient-to-b from-blue-500/5 to-cyan-400/5">
        {#if chat.selectedFriend}
            <div class="flex flex-col h-full">
                <header class="p-3 bg-gradient-to-r from-blue-500/10 to-cyan-400/10 border-b border-white/10">
                    <h3 class="text-lg font-semibold text-white truncate">
                        {userClass.friends.find((friend) => friend.id === chat.selectedFriend)?.name}
                    </h3>
                </header>
                <div class="flex-1 p-3 space-y-2 flex flex-col overflow-auto min-h-0" bind:this={chat.messagesContainer}>
                    {#if chat.messages.get(chat.selectedFriend)}
                        <div bind:this={chat.loadMoreTrigger}>
                            {#if chat.endReached}
                                <p class="text-gray-500 text-sm text-center">
                                    No more messages.
                                </p>
                            {:else}
                                <svg class="animate-spin h-6 w-6 mx-auto text-cyan-300">
                                    <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" stroke-width="2" />
                                </svg>
                            {/if}
                        </div>
                        {#each chat.messages.get(chat.selectedFriend) ?? [] as message, i (message.id)}
                            {#if i > 0 && hasTimeGap(message, chat.messages.get(chat.selectedFriend)?.[i - 1] ?? { createdAt: null })}
                                <div class="flex justify-center my-4">
                                    <div class="px-3 py-1 bg-gray-800/50 rounded-full text-xs text-gray-400">
                                        {formatDateForGap(message.createdAt)}
                                    </div>
                                </div>
                            {/if}
                            {#if message.senderId === userClass.data?.id}
                                <div class="flex justify-end mb-2 items-start">
                                    <div class="max-w-[80%] p-3 rounded-lg bg-white/5 text-white border border-white/10 shadow-sm animate-fade-in mr-2 message-content">
                                        <p class="text-sm">{message.content}</p>
                                        <div class="text-[10px] opacity-50 mt-1 text-right">
                                            {formatRelativeTime(message.createdAt)}
                                        </div>
                                    </div>
                                    <div class="flex-shrink-0">
                                        {#if userClass.data?.avatar}
                                            <img
                                                src={userClass.data.avatar}
                                                alt="You"
                                                class="w-6 h-6 rounded-full object-cover border border-white/10"
                                            />
                                        {:else}
                                            <div class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium text-xs">
                                                {getInitials(userClass.data?.name || "You")}
                                            </div>
                                        {/if}
                                    </div>
                                </div>
                            {:else}
                                {@const friend = userClass.friends.find(
                                    (f) => f.id === message.senderId,
                                )}
                                <div class="flex justify-start mb-2 items-start">
                                    <div class="flex-shrink-0 mr-2">
                                        {#if friend?.avatar}
                                            <img
                                                src={friend.avatar}
                                                alt={friend?.name}
                                                class="w-6 h-6 rounded-full object-cover border border-white/10"
                                            />
                                        {:else}
                                            <div class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium text-xs">
                                                {getInitials(friend?.name || "Friend")}
                                            </div>
                                        {/if}
                                    </div>
                                    <div class="max-w-[80%] p-3 rounded-lg bg-white/5 text-white border border-white/10 shadow-sm animate-fade-in message-content">
                                        <p class="text-sm">{message.content}</p>
                                        <div class="text-[10px] opacity-50 mt-1">
                                            {formatRelativeTime(message.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            {/if}
                        {/each}
                    {:else}
                        <p class="text-gray-500 text-sm">No messages yet.</p>
                    {/if}
                </div>
                <footer class="p-3 bg-gradient-to-r from-blue-500/10 to-cyan-400/10 border-t border-white/10">
                    <div class="flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            bind:value={newMessage}
                            class="flex-grow border border-white/10 rounded-full py-2 px-4 bg-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            onkeydown={(e) =>
                                e.key === "Enter" && sendMessage(chat.selectedFriend)}
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
