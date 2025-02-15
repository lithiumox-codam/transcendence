<script lang="ts">
    import { client } from "$lib/trpc";
    import type { PageData } from "./$types";
    import { Chat } from "$lib/classes/Chat.svelte";

    let { data }: { data: PageData } = $props();
    const chat = new Chat();

    let roomId = $state(0);
    let roomName = $state("");
    let newMessage = $state("");
    let showCreateRoom = $state(false);

    async function sendMessage(roomId: number) {
        if (!newMessage.trim()) return;
        try {
            await client.chat.messages.create.mutate({
                roomId,
                message: newMessage.trim(),
            });
            newMessage = "";
        } catch (error) {
            console.error(error);
        }
    }

    async function createRoom() {
        if (!roomName.trim()) return;
        try {
            await client.chat.rooms.create.mutate({ name: roomName.trim() });
            roomName = "";
        } catch (error) {
            console.error(error);
        }
    }
</script>

<main class="flex h-full w-full bg-gray-100 overflow-hidden">
    <!-- Chat Rooms Sidebar -->
    <aside class="w-72 bg-white border-r border-gray-300 flex flex-col">
        <div class="sticky top-0 z-10 p-4 border-b border-gray-300 bg-white flex justify-between items-center">
            <h2 class="text-lg font-medium text-cyan-400 retro-glow">Chat Rooms</h2>
            <button
                class="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                onclick={() => (showCreateRoom = !showCreateRoom)}
            >
                {#if showCreateRoom}
                    &minus;
                {:else}
                    +
                {/if}
            </button>
        </div>
        {#if showCreateRoom}
            <div class="p-4 border-b border-gray-300 bg-gray-50">
                <input
                    type="text"
                    bind:value={roomName}
                    placeholder="Room Name"
                    class="w-full border border-gray-300 rounded-full py-1 px-3 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    class="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={!roomName.trim()}
                    onclick={createRoom}
                >
                    Create Room
                </button>
            </div>
        {/if}
        <div class="flex-grow overflow-y-auto">
            {#if chat.rooms}
                <ul class="divide-y divide-gray-200">
                    {#each chat.rooms as room}
                        {@const messages = chat.messages.get(room.id) ?? []}
                        <li>
                            <button
                                class="w-full text-left p-4 hover:bg-gray-100 transition-colors"
                                onclick={() => (roomId = room.id)}
                            >
                                <div class="font-medium text-cyan-400 retro-glow">
                                    {room.name}
                                </div>
                                <div class="mt-1 text-sm text-gray-500 truncate">
                                    {messages[messages.length - 1]?.message ?? "No messages yet."}
                                </div>
                            </button>
                        </li>
                    {/each}
                </ul>
            {:else}
                <p class="p-4 text-gray-500 text-sm">No chat rooms yet.</p>
            {/if}
        </div>
    </aside>

    <!-- Chat Conversation -->
    <section class="flex-grow flex flex-col bg-gray-50">
        {#if roomId}
            <header class="p-4 bg-white border-b border-gray-300 flex items-center">
                <h3 class="text-xl font-semibold text-cyan-400 retro-glow">
                    {chat.rooms.find((room) => room.id === roomId)?.name}
                </h3>
            </header>
            <div class="flex-grow overflow-y-auto p-4 space-y-3" bind:this={chat.messagesContainer}>
                {#if chat.messages.get(roomId)}
                    {#each chat.messages.get(roomId) ?? [] as message}
                        <div class="max-w-xs p-3 rounded-lg bg-white shadow-sm">
                            <p class="text-gray-800 text-sm">{message.message}</p>
                        </div>
                    {/each}
                {:else}
                    <p class="text-gray-500 text-sm">No messages yet.</p>
                {/if}
            </div>
            <footer class="p-4 bg-white border-t border-gray-300">
                <div class="flex items-center space-x-2">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        bind:value={newMessage}
                        class="flex-grow border border-gray-300 rounded-full py-2 px-4 bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onkeydown={(e) => e.key === "Enter" && sendMessage(roomId)}
                    />
                    <button
                        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        disabled={!newMessage.trim()}
                        onclick={() => sendMessage(roomId)}
                    >
                        Send
                    </button>
                </div>
            </footer>
        {:else}
            <div class="flex-grow flex items-center justify-center">
                <p class="text-gray-500">Select a chat room to start chatting.</p>
            </div>
        {/if}
    </section>
</main>

<style global>
    /* Retains retro glow effect on highlighted text */
    .retro-glow {
        text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
    }
</style>
