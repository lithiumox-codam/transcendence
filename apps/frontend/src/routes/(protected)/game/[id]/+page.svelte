<script lang="ts">
    import type { PageData } from "./$types";
    import Renderer from "$lib/components/Game/Renderer.svelte";
    import { client } from "$lib/trpc";

    let { data }: { data: PageData } = $props();
    const validKeys = ["w", "s"];
    let pressedKeys = new Set<string>();
    let gameError = $state<boolean>(false);

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
        if (
            validKeys.includes(event.key) &&
            !pressedKeys.has(event.key) &&
            !gameError
        ) {
            pressedKeys.add(event.key);
            event.preventDefault();

            try {
                await client.game.sendInput.mutate({
                    gameId: data.id,
                    key: keyToAction(event.key),
                });
            } catch (error) {
                gameError = true;
            }
        }
    }

    async function handleKeyup(event: KeyboardEvent) {
        if (validKeys.includes(event.key) && !gameError) {
            pressedKeys.delete(event.key);
            event.preventDefault();
            try {
                await client.game.sendInput.mutate({
                    gameId: data.id,
                    key: "none",
                });
            } catch (error) {
                gameError = true;
            }
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} onkeyup={handleKeyup} />

{#key data.id}
    <Renderer gameId={data.id} />
{/key}
