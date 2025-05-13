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
	class="w-full cursor-pointer select-none h-10 rounded-md bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 focus:ring-offset-slate-900 transition-colors duration-150"
	onclick={handleGoogleSignIn}
>
	Login with Google
</button>
