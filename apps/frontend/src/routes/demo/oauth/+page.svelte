<script lang="ts">
    const CLIENT_ID =
        "709994218195-j4td5sbsg0i3vhpnnei9ea0kq8avi462.apps.googleusercontent.com";

    async function handleGoogleLogin() {
        const baseUrl = "https://accounts.google.com/o/oauth2/v2/auth";
        const params = new URLSearchParams({
            client_id: CLIENT_ID,
            redirect_uri: "http://localhost:5173/oauth/callback",
            response_type: "code",
            scope: "openid profile email",
        });

        window.location.href = `${baseUrl}?${params.toString()}`;
    }
</script>

<button class="mt-20" on:click={handleGoogleLogin}>Login with Google</button>
