<script lang="ts">
    import { page } from "$app/state";

    async function handleGoogleSignIn() {
        if (!process.env.PUBLIC_GOOGLE_CLIENT_ID) {
            console.error("Client ID is missing");
            return;
        }

        const baseUrl = "https://accounts.google.com/o/oauth2/auth";
        const params = new URLSearchParams({
            client_id: process.env.PUBLIC_GOOGLE_CLIENT_ID,
            redirect_uri: `${page.url.origin}/oauth/callback`,
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
    Login with Google
</button>
