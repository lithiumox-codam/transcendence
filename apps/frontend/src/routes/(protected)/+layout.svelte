<script lang="ts">
    import { setContext, type Snippet } from "svelte";
    import type { LayoutData } from "./$types";
    import { UserClass } from "$lib/classes/User.svelte";
    import { Chat } from "$lib/classes/Chat.svelte";
    import Nav from "$lib/components/Nav/Nav.svelte";
    import Popout from "$lib/components/Nav/Popout.svelte";
    import { Popout as PopoutClass } from "$lib/classes/Popout.svelte";
    import { GameClass } from "$lib/classes/Game.svelte";

    const user = new UserClass();
    setContext("user", user);
    setContext("chat", new Chat(user));
    setContext("popout", new PopoutClass());
    setContext("game", new GameClass());

    let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<main class="h-[100vh] bg-zinc-800">
    {@render children()}
    <Popout />
    <Nav />
</main>
