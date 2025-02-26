<script lang="ts">
    import { setContext, type Snippet } from "svelte";
    import type { LayoutData } from "./$types";
    import { client, isTRPCClientError } from "$lib/trpc";
    import { goto } from "$app/navigation";

    async function checkAuth() {
        try {
            await client.user.get.query();
        } catch (error) {
            if (isTRPCClientError(error)) {
                switch (error.data?.code) {
                    case "UNAUTHORIZED":
                        goto(`/login?redirect=${location.pathname}`);
                        break;
                    case "FORBIDDEN":
                        goto(`/login?redirect=${location.pathname}`);
                        break;
                    default:
                        console.error(error);
                        break;
                }
            }
        }
    }

    $effect(() => {
        checkAuth();
    });

    let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<main class="h-[94vh] bg-zinc-800">
    {@render children()}
</main>
