<script lang="ts">
    import type { Snippet } from "svelte";
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
                        goto("/auth/login");
                        break;
                    case "FORBIDDEN":
                        goto("/auth/login");
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

<main class=" h-screen pt-18">
    {@render children()}
</main>
