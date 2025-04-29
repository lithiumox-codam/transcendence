<script lang="ts">
    import { page } from "$app/state";
    import { onMount } from "svelte";

    const code = page.url.searchParams.get("code");

    import { client } from "$lib/trpc";
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";

	onMount(() => {
		const fetchToken = async () => {
			if (code === null) {
				goto("/login");
				return;
			}
			try {
				const res = await client.auth.oauthLogin.mutate(code);
				if (browser) {
					localStorage.setItem("token", res);
					window.location.href = "/stats";
				}
			} catch (error) {
				console.error(error);
			}
		};
        fetchToken();
    });
</script>
