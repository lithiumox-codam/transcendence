<script lang="ts">
    import { PUBLIC_GOOGLE_CLIENT_ID } from "$env/static/public";

    async function handleGoogleSignIn() {
        if (!PUBLIC_GOOGLE_CLIENT_ID) {
            console.error("Client ID is missing");
            return;
        }

        const baseUrl = "https://accounts.google.com/o/oauth2/auth";
        const params = new URLSearchParams({
            client_id: PUBLIC_GOOGLE_CLIENT_ID,
            redirect_uri: "http://localhost:5173/oauth/callback",
            response_type: "code",
            scope: "openid profile email",
        });

        window.location.href = `${baseUrl}?${params.toString()}`;
    }
</script>

<button
    class="mt-2 w-full h-10 cursor-pointer rounded-md bg-gray-700 text-white font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
    onclick={handleGoogleSignIn}
>
    <slot />
</button>
