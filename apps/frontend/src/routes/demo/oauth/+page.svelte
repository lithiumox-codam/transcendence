<script lang="ts">
    import type { ClientProviderConfig } from "@repo/auth";
    let { data } = $props();

    async function handleGoogleSignIn() {
        const providerConfig = data as ClientProviderConfig;

        if (!providerConfig.clientId) {
            console.error("Client ID is missing");
            return;
        }

        const baseUrl = providerConfig.authHost + providerConfig.authPath;
        const params = new URLSearchParams({
            client_id: providerConfig.clientId,
            redirect_uri: "http://localhost:5173/oauth/callback",
            response_type: "code",
            scope: "openid profile email",
        });

        window.location.href = `${baseUrl}?${params.toString()}`;
    }
</script>

<button class="mt-20" onclick={() => handleGoogleSignIn()}
    >Login with Google</button
>
