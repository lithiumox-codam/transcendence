<script lang="ts">
    import { client } from "$lib/trpc";
    import { Chat } from "$lib/classes/Chat.svelte";
    import { UserClass } from "$lib/classes/User.svelte";
    import { getContext } from "svelte";

    let userClass = getContext<UserClass>("user");
    let chat = $state(new Chat(userClass));

    let newMessage = $state("");

    async function sendMessage(friendId: number | null) {
        if (!newMessage.trim()) return;
        if (!friendId) return;
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

<main class="flex h-full w-full bg-zinc-800 overflow-hidden">
    <!-- Chat Friends Sidebar -->
    <aside class="w-72 bg-zinc-900 border-r border-zinc-700 flex flex-col">
        <div
            class="sticky top-0 z-10 p-4 border-b border-zinc-700 bg-zinc-900
             flex justify-between items-center"
        >
            <h2 class="text-lg font-medium text-cyan-400">Friends</h2>
        </div>
        <div class="flex-grow overflow-y-auto">
            {#if userClass.friends?.length}
                <ul class="divide-y divide-zinc-700">
                    {#each userClass.friends as friend (friend.id)}
                        {@const messages = chat.messages.get(friend.id) ?? []}
                        <li>
                            <button
                                class="w-full text-left p-4 hover:bg-zinc-800 transition-colors"
                                onclick={() =>
                                    (chat.selectedFriend = friend.id)}
                            >
                                <div class="font-medium text-cyan-400">
                                    {friend.name}
                                </div>
                                <div
                                    class="mt-1 text-sm text-gray-500 truncate"
                                >
                                    {messages[messages.length - 1]?.content ??
                                        "No messages yet."}
                                </div>
                            </button>
                        </li>
                    {/each}
                </ul>
            {:else}
                <p class="p-4 text-gray-500 text-sm">No friends yet.</p>
            {/if}
        </div>
    </aside>

    <!-- Chat Conversation -->
    <section class="flex-grow flex flex-col bg-zinc-800">
        {#if chat.selectedFriend}
            <header
                class="sticky top-0 z-10 p-4 bg-zinc-900 border-b border-zinc-700
               flex items-center"
            >
                <h3 class="text-xl font-semibold text-cyan-400">
                    {userClass.friends.find(
                        (friend) => friend.id === chat.selectedFriend,
                    )?.name}
                </h3>
            </header>
            <div class="flex-1 min-h-0">
                <!-- Scrollable messages container -->
                <div
                    class="flex-1 p-4 space-y-3 flex flex-col h-full overflow-auto"
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
                                        class="max-w-xs p-3 rounded-lg bg-blue-600 text-white shadow-sm break-words animate-fade-in"
                                    >
                                        <div
                                            class="text-xs text-right opacity-75 mb-1"
                                        >
                                            You
                                            <span class="ml-2">
                                                {new Date(
                                                    message.createdAt,
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                        <p class="text-sm">{message.content}</p>
                                    </div>
                                </div>
                            {:else}
                                <!-- Message sent by the friend -->
                                <div class="flex justify-start">
                                    <div
                                        class="max-w-xs p-3 rounded-lg bg-zinc-700 text-white shadow-sm break-words animate-fade-in"
                                    >
                                        <div class="text-xs opacity-75 mb-1">
                                            {userClass.friends.find(
                                                (friend) =>
                                                    friend.id ===
                                                    message.senderId,
                                            )?.name}
                                            <span class="ml-2">
                                                {new Date(
                                                    message.createdAt,
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                        <p class="text-sm">{message.content}</p>
                                    </div>
                                </div>
                            {/if}
                        {/each}
                    {:else}
                        <p class="text-gray-500 text-sm">No messages yet.</p>
                    {/if}
                </div>
            </div>
            <footer
                class="sticky bottom-0 p-4 bg-zinc-900 border-t border-zinc-700"
            >
                <div class="flex items-center space-x-2">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        bind:value={newMessage}
                        class="flex-grow border border-zinc-700 rounded-full py-2 px-4 bg-zinc-800
                   text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onkeydown={(e) =>
                            e.key === "Enter" &&
                            sendMessage(chat.selectedFriend)}
                    />
                    <button
                        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4
                   rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500
                   disabled:opacity-50"
                        disabled={!newMessage.trim()}
                        onclick={() => sendMessage(chat.selectedFriend)}
                    >
                        Send
                    </button>
                </div>
            </footer>
        {:else}
            <div class="flex-grow flex items-center justify-center">
                <p class="text-gray-500">Select a friend to start chatting.</p>
            </div>
        {/if}
    </section>
</main>

<style>
    /* Fade-in animation for messages */
    .animate-fade-in {
        animation: fadeIn 0.5s ease-out forwards;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateX(10px);
        }
        to {
            opacity: 1;
            transform: translateX(10px);
        }
    }
</style>
