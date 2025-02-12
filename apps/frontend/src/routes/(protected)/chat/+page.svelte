<script lang="ts">
    import { client } from "$lib/trpc";
    import type { Room } from "@repo/database";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    let rooms: Room[] = $state([]);
    let name = $state("");

    $effect(() => {
        client.chat.rooms.listen.subscribe(undefined, {
            onData: (data) => {
                if (data.type === "initial") {
                    rooms = data.data;
                } else if (data.type === "add") {
                    rooms.push(data.data[0]);
                }
            },
        });
    });

    async function sendMessage(roomId: number) {
        try {
            const res = await client.chat.messages.create.mutate({
                roomId,
                message: prompt("Enter your message") ?? "",
            });
            console.log(res);
        } catch (error) {
            console.error(error);
        }
    }
</script>

{#if rooms}
    <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
            <tr>
                <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                    ID
                </th>
                <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                    Name
                </th>
            </tr></thead
        >
        <tbody class="bg-white divide-y divide-gray-200">
            {#each rooms as room}
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">{room.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{room.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button
                            onclick={() => {
                                sendMessage(room.id);
                            }}
                        >
                            send message
                        </button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
    <input type="text" bind:value={name} />
    <button
        onclick={async () => {
            await client.chat.rooms.create.mutate({ name });
        }}
    >
        create room
    </button>
{/if}
