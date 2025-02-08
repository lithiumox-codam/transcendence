<script lang="ts">
    import { client } from "$lib/trpc";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    let number = $state(0);

    $effect(() => {
        client.user.test.subscribe(undefined, {
            onData: (data) => {
                number = data;
            },
            onError: (err) => {
                console.error(err);
            },
        });
    });
</script>

{number}

{#if data.allusers}
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
                <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                    Email
                </th>
            </tr></thead
        >
        <tbody class="bg-white divide-y divide-gray-200">
            {#each data.allusers as user}
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">{user.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{user.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{user.email}</td>
                </tr>
            {/each}
        </tbody>
    </table>
{/if}
