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

<main class="flex h-full w-full bg-gray-50">
    <aside class="w-72 bg-white border-r border-gray-200 flex flex-col">
        <!-- Dropdown header with toggle button -->
        <div class="sticky top-0 bg-white z-10 p-4 border-b border-gray-200">
            <div class="flex justify-between items-center">
                <h2 class="text-lg font-medium text-gray-800">Chat Rooms</h2>
                <button
                    class="p-2 rounded bg-blue-500 hover:bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                <div class="mt-3">
                    <label
                        for="roomName"
                        class="block text-sm text-gray-600 mb-1"
                    >
                        Create New Room
                    </label>
                    <input
                        type="text"
                        id="roomName"
                        bind:value={roomName}
                        placeholder="Room Name"
                        class="w-full border border-gray-300 rounded py-1 px-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        class="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                        disabled={!roomName.trim()}
                        onclick={createRoom}
                    >
                        Create Room
                    </button>
                </div>
            {/if}
        </div>

        <div class="flex-grow overflow-y-auto p-4">
            {#if chat.rooms}
                <ul class="space-y-2">
                    {#each chat.rooms as room}
                        {@const messages = chat.messages.get(room.id) ?? []}
                        <li>
                            <button
                                class="w-full text-left p-3 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                                onclick={() => (roomId = room.id)}
                            >
                                <div class="font-medium text-gray-800">
                                    {room.name}
                                </div>
                                <div
                                    class="mt-1 text-sm text-gray-500 truncate"
                                >
                                    {messages[messages.length - 1]?.message ??
                                        "No messages yet."}
                                </div>
                            </button>
                        </li>
                    {/each}
                </ul>
            {:else}
                <p class="text-gray-500 text-sm">No chat rooms yet.</p>
            {/if}
        </div>
    </aside>

    <section class="flex-grow flex flex-col p-4">
        {#if roomId}
            <h3 class="text-xl font-semibold text-gray-800 mb-4">
                {chat.rooms.find((room) => room.id === roomId)?.name} - {chat.messages.get(
                    roomId,
                )?.length ?? 0} messages
            </h3>

            <div
                class="flex-grow overflow-y-auto space-y-3 border p-4 rounded bg-white shadow-sm"
                bind:this={chat.messagesContainer}
            >
                {#if chat.messages.get(roomId)}
                    {#each chat.messages.get(roomId) ?? [] as message}
                        <div class="p-3 rounded bg-gray-100">
                            <p class="text-gray-700 text-sm">
                                {message.message}
                            </p>
                        </div>
                    {/each}
                {:else}
                    <p class="text-gray-500 text-sm">No messages yet.</p>
                {/if}
            </div>

            <div class="mt-4 flex items-center space-x-2">
                <input
                    type="text"
                    placeholder="Type your message..."
                    bind:value={newMessage}
                    class="flex-grow border border-gray-300 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onkeydown={(e) => e.key === "Enter" && sendMessage(roomId)}
                />
                <button
                    class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                    disabled={!newMessage.trim()}
                    onclick={() => sendMessage(roomId)}
                >
                    Send
                </button>
            </div>
        {:else}
            <p class="text-gray-600">Select a chat room to view messages.</p>
        {/if}
    </section>
</main>
