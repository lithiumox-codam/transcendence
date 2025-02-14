<script lang="ts">
    import { client } from "$lib/trpc";
    import type { PageData } from "./$types";
    import { Chat } from "$lib/classes/Chat.svelte";

    let { data }: { data: PageData } = $props();

    const chat = new Chat();

    let roomId = $state(0);
    let name = $state("");

    async function sendMessage(roomId: number) {
        try {
            const res = await client.chat.messages.create.mutate({
                roomId,
                message: prompt("Enter your message") ?? "",
            });
            // console.log(res);
        } catch (error) {
            console.error(error);
        }
    }
</script>

<main class="flex bg-zinc-900 text-white max-h-[93vh]">
    <aside class="w-64 bg-zinc-800 flex flex-col border-r border-zinc-700">
        <div class="p-4 sticky top-0 bg-zinc-800 z-10">
            <h2 class="text-xl font-semibold mb-4 text-zinc-100">Chat Rooms</h2>
            <label
                for="roomName"
                class="block text-zinc-300 text-sm font-bold mb-2"
                >Create New Room</label
            >
            <input
                type="text"
                id="roomName"
                bind:value={name}
                class="shadow appearance-none border rounded w-full py-2 px-3 text-zinc-700 leading-tight focus:outline-none focus:shadow-outline bg-zinc-800 border-zinc-600"
                placeholder="Room Name"
            />
            <button
                class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2 focus:outline-none focus:shadow-outline"
                disabled={!name}
                onclick={async () => {
                    await client.chat.rooms.create.mutate({ name });
                }}
            >
                Create Room
            </button>
        </div>

        <div class="overflow-y-auto flex-grow p-4">
            {#if chat.rooms}
                <ul class="space-y-2">
                    {#each chat.rooms as room}
                        {@const messages = chat.messages.get(room.id) ?? []}
                        <li
                            class="bg-zinc-700 rounded-md shadow-sm p-3 hover:bg-zinc-600 transition-colors duration-200"
                        >
                            <button
                                class="w-full text-left text-zinc-200 focus:outline-none"
                                onclick={() => {
                                    roomId = room.id;
                                }}
                            >
                                {room.name}
                                <br />
                                <!-- get the latest message -->
                                <span class="text-sm text-zinc-400"
                                    >{messages[messages.length - 1]?.message ??
                                        ""}</span
                                >
                            </button>
                        </li>
                    {/each}
                </ul>
            {:else}
                <p class="text-zinc-400">No chat rooms yet.</p>
            {/if}
        </div>
    </aside>

    <section class="flex-1 p-4 flex flex-col">
        {#if roomId}
            <h3 class="text-lg font-semibold mb-4 text-zinc-100">
                Messages for Room {roomId}
            </h3>
            <!-- Display messages for the selected room here -->
            <div class="overflow-y-auto flex-grow">
                {#if chat.messages.get(roomId)}
                    {#each chat.messages.get(roomId) ?? [] as message}
                        <div class="mb-2 p-3 rounded-md bg-zinc-700">
                            <p class="text-zinc-200">{message.message}</p>
                        </div>
                    {/each}
                {:else}
                    <p class="text-zinc-400">No messages in this room yet.</p>
                {/if}
            </div>
            <div class="mt-4 sticky bottom-0 bg-zinc-900 p-4">
                <button
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    onclick={() => sendMessage(roomId)}
                >
                    Send Message
                </button>
            </div>
        {:else}
            <p class="text-zinc-400">Select a chat room to view messages.</p>
        {/if}
    </section>
</main>
