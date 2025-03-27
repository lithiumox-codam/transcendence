<script lang="ts">
    import { client } from "$lib/trpc";
    import { Chat } from "$lib/classes/Chat.svelte";
    import { UserClass } from "$lib/classes/User.svelte";
    import { getContext, onMount } from "svelte";

    let userClass = getContext<UserClass>("user");
    let chat = getContext<Chat>("chat");
    let newMessage = $state("");

    // Reset the observer when the component mounts in the popout
    onMount(() => {
        setTimeout(() => {
            chat.resetObserver();
        }, 100); // Small delay to ensure DOM is ready
    });

    // Reset observer when changing friends
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

<main class="flex h-full w-full overflow-hidden bg-gray-900 text-white">
    <!-- Sidebar Navigation (Fixed) -->
    <aside
        class="w-1/4 min-w-40 max-w-64 bg-gray-800 border-r border-gray-700 flex flex-col h-full overflow-hidden"
    >
        <!-- Friends Header -->
        <header class="text-lg font-semibold text-white p-3">Friends</header>

        <!-- Navigation Options -->
        <nav class="flex flex-col overflow-y-auto flex-grow">
            {#if userClass.friends?.length}
                {#each userClass.friends as friend, index (friend.id)}
                    <button
                        class="flex flex-col items-start px-3 py-2 text-left rounded-lg transition-colors duration-300 bg-transparent text-white hover:bg-white/10 {chat.selectedFriend ===
                        friend.id
                            ? 'bg-white/20 font-bold border-l-4 border-blue-500'
                            : ''}"
                        onclick={() => (chat.selectedFriend = friend.id)}
                    >
                        <span class="font-medium truncate w-full"
                            >{friend.name}</span
                        >
                        <span class="text-xs text-gray-400 truncate w-full">
                            {#if chat.messages.get(friend.id)?.length}
                                {@const message =
                                    chat.messages.get(friend.id) ?? []}
                                {message[message.length - 1].content}
                            {:else}
                                No messages yet
                            {/if}
                        </span>
                    </button>
                    {#if index < userClass.friends.length - 1}
                        <hr class="border-gray-700" />
                    {/if}
                {/each}
            {:else}
                <p class="text-gray-500 text-sm p-3">No friends yet.</p>
            {/if}
        </nav>
    </aside>

    <!-- Scrollable Content Area -->
    <section class="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {#if chat.selectedFriend}
            <div class="flex flex-col h-full">
                <header
                    class="p-2 bg-gray-800 border-b border-gray-700 shrink-0"
                >
                    <h3 class="text-lg font-semibold text-cyan-400 truncate">
                        {userClass.friends.find(
                            (friend) => friend.id === chat.selectedFriend,
                        )?.name}
                    </h3>
                </header>

                <!-- Scrollable messages container -->
                <div
                    class="flex-1 p-2 space-y-2 flex flex-col overflow-auto min-h-0"
                    bind:this={chat.messagesContainer}
                >
                    {#if chat.messages.get(chat.selectedFriend)}
                        <div bind:this={chat.loadMoreTrigger}>
                            {#if chat.endReached}
                                <p class="text-gray-500 text-sm text-center">
                                    No more messages.
                                </p>
                            {:else}
                                <svg class="animate-spin h-6 w-6 mx-auto">
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

                        {#each chat.messages.get(chat.selectedFriend) ?? [] as message (message.id)}
                            {#if message.senderId === userClass.data?.id}
                                <!-- Message sent by the current user -->
                                <div class="flex justify-end">
                                    <div
                                        class="max-w-[80%] p-2 rounded-lg bg-blue-600 text-white shadow-sm break-words animate-fade-in"
                                    >
                                        <div
                                            class="text-xs text-right opacity-75 mb-1"
                                        >
                                            You
                                            <span class="ml-1">
                                                {new Date(
                                                    message.createdAt,
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                        <p class="text-sm">
                                            {message.content}
                                        </p>
                                    </div>
                                </div>
                            {:else}
                                <!-- Message sent by the friend -->
                                <div class="flex justify-start">
                                    <div
                                        class="max-w-[80%] p-2 rounded-lg bg-zinc-700 text-white shadow-sm break-words animate-fade-in"
                                    >
                                        <div class="text-xs opacity-75 mb-1">
                                            {userClass.friends.find(
                                                (friend) =>
                                                    friend.id ===
                                                    message.senderId,
                                            )?.name}
                                            <span class="ml-1">
                                                {new Date(
                                                    message.createdAt,
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                        <p class="text-sm">
                                            {message.content}
                                        </p>
                                    </div>
                                </div>
                            {/if}
                        {/each}
                    {:else}
                        <p class="text-gray-500 text-sm">No messages yet.</p>
                    {/if}
                </div>

                <footer
                    class="p-2 bg-gray-800 border-t border-gray-700 shrink-0"
                >
                    <div class="flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            bind:value={newMessage}
                            class="flex-grow border border-gray-700 rounded-full py-1 px-3 bg-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onkeydown={(e) =>
                                e.key === "Enter" &&
                                sendMessage(chat.selectedFriend)}
                        />
                        <button
                            class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            disabled={!newMessage.trim()}
                            onclick={() => sendMessage(chat.selectedFriend)}
                        >
                            Send
                        </button>
                    </div>
                </footer>
            </div>
        {:else}
            <div class="flex items-center justify-center h-full bg-gray-900">
                <p class="text-gray-500 text-sm">
                    Select a friend to start chatting.
                </p>
            </div>
        {/if}
    </section>
</main>

<style>
    /* Fade-in animation for messages */
    .animate-fade-in {
        animation: fadeIn 0.3s ease-out forwards;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateX(5px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
</style>
