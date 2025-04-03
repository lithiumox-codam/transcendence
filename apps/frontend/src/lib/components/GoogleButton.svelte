<script lang="ts">
	import type { ClientProviderConfig } from "@repo/auth";
	export let providerConfig: ClientProviderConfig;

	export let text = "Continue with Google";

	async function handleGoogleSignIn() {
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

<button
	class="mt-2 flex justify-center text-white hover:underline cursor-pointer bg-transparent border-none"
	onclick={handleGoogleSignIn}
>
	{text}
</button>
