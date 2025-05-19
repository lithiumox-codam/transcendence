<script lang="ts">
    import { getContext } from "svelte";
    import type { UserClass } from "$lib/classes/User.svelte";

    const user = getContext<UserClass>("user");
    let { friendId }: { friendId: number } = $props();
</script>

{#if user.onlineFriends.includes(friendId)}
    <div
        class="w-2 h-2 bg-green-500 rounded-full inline-block align-middle"
    ></div>
{:else}
    <div
        class="w-2 h-2 bg-red-500 rounded-full inline-block align-middle"
    ></div>
{/if}
