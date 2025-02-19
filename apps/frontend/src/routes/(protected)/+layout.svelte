<script lang="ts">
    import { setContext, type Snippet } from "svelte";
    import type { LayoutData } from "./$types";
    import { client, isTRPCClientError } from "$lib/trpc";
    import { goto } from "$app/navigation";
    import { UserClass } from "$lib/classes/User.svelte";

    const user = new UserClass();
    setContext("user", user);

    async function checkAuth() {
        try {
            const user = await client.user.get.query();
            setContext("user", user[0]);
        } catch (error) {
            if (isTRPCClientError(error)) {
                switch (error.data?.code) {
                    case "UNAUTHORIZED":
                        goto("/login");
                        break;
                    case "FORBIDDEN":
                        goto("/login");
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

<main class=" h-screen pt-18 bg-zinc-800">
    {@render children()}
</main>
