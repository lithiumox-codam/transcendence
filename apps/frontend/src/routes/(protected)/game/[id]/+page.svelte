<script lang="ts">
    import type { PageData } from "./$types";
    import Renderer from "$lib/components/Game/Renderer.svelte";
    import { client } from "$lib/trpc";

    let { data }: { data: PageData } = $props();
    const validKeys = ["w", "s"];
    let pressedKeys = new Set<string>();

    function keyToAction(key: string): "up" | "down" | "none" {
        switch (key) {
            case "w":
                return "up";
            case "s":
                return "down";
            default:
                return "none"; // Default action if key is not recognized which will not happen since we check validKeys
        }
    }

    async function handleKeydown(event: KeyboardEvent) {
        if (validKeys.includes(event.key) && !pressedKeys.has(event.key)) {
            pressedKeys.add(event.key);
            event.preventDefault();

            await client.game.sendInput.mutate({
                gameId: data.id,
                key: keyToAction(event.key),
            });
        }
    }

    async function handleKeyup(event: KeyboardEvent) {
        if (validKeys.includes(event.key)) {
            pressedKeys.delete(event.key);
            event.preventDefault();
            // Handle key release
            await client.game.sendInput.mutate({
                gameId: data.id,
                key: "none",
            });
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} onkeyup={handleKeyup} />

{data.id}
<Renderer gameId={data.id} />
