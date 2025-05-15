<script lang="ts">
	import { browser } from "$app/environment";
	import { getFrontendUrl } from "$lib/getUrls";
	import { onMount } from "svelte";

	let clientId = "";

	onMount(() => {
		if (browser) {
			fetch(`${window.origin}/api/googleOauth`)
				.then((res) => res.text())
				.then((id) => {
					clientId = id;
					console.log("Client ID:", clientId);
				})
				.catch((err) => {
					console.error("Error fetching client ID:", err);
				});
		}
	});

	async function handleGoogleSignIn() {
		const baseUrl = "https://accounts.google.com/o/oauth2/auth";
		const params = new URLSearchParams({
			client_id: clientId,
			redirect_uri: `${getFrontendUrl()}/oauth/callback`,
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
