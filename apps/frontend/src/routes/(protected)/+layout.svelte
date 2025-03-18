<script lang="ts">
    import { setContext, type Snippet } from "svelte";
    import type { LayoutData } from "./$types";
    import { client, isTRPCClientError } from "$lib/trpc";
    import { goto } from "$app/navigation";
    import { UserClass } from "$lib/classes/User.svelte";
    import { Chat } from "$lib/classes/Chat.svelte";
    import Nav from "$lib/components/Nav/Nav.svelte";

    const user = new UserClass();
    setContext("user", user);
    const chat = new Chat(user);
    setContext("chat", chat);

    let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<main class="h-[100vh] bg-zinc-800">
    {@render children()}
    <Nav />
</main>
