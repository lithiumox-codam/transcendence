<script lang="ts">
	import { client } from "$lib/trpc";
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import GoogleButton from "$lib/components/GoogleButton.svelte";

	let { data } = $props();

	let email = $state("");
	let password = $state("");
	let errorMessage = $state(""); // State for error message

	async function handleSubmit(event: Event) {
		event.preventDefault();
		errorMessage = ""; // Clear previous error message
		try {
			const res = await client.auth.login.mutate({
				email,
				password,
			});
			if (browser) localStorage.setItem("token", res);
			if (data.redirect) goto(data.redirect);
			else goto("/user");
		} catch (error) {
			// Display error message if login fails
			errorMessage = "Invalid username or password. Please try again.";
			console.error(error);
		}
	}

	function redirectToSignup() {
		goto("/signup");
	}
</script>

<main
	class="flex min-h-screen bg-gray-900 text-white items-center justify-center"
>
	<div
		class="flex flex-col w-[380px] rounded-md border border-gray-700 bg-gray-800 text-white shadow-lg"
	>
		<!-- Header -->
		<div class="flex flex-col space-y-1.5 p-6 text-center">
			<h3 class="text-2xl font-semibold tracking-tight">Login</h3>
			<p class="text-sm text-gray-400">
				Enter your email and password to access your account
			</p>
		</div>

		<!-- Login Form -->
		<div class="p-6">
			<form class="space-y-4" onsubmit={handleSubmit}>
				<div class="space-y-2">
					<label class="text-sm font-medium" for="email">
						Email
					</label>
					<input
						type="email"
						placeholder="Enter your email"
						required
						class="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
						id="email"
						bind:value={email}
					/>
				</div>
				<div class="space-y-2">
					<label class="text-sm font-medium" for="password">
						Password
					</label>
					<input
						type="password"
						placeholder="Enter your password"
						required
						class="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
						id="password"
						bind:value={password}
					/>
				</div>

				<!-- Error Message -->
				{#if errorMessage}
					<p class="text-red-500 text-sm">{errorMessage}</p>
				{/if}

				<button
					class="w-full h-10 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					Login
				</button>
			</form>
			<!-- Google Login -->
			<div class="mt-2 flex justify-center">
				<GoogleButton
					providerConfig={data.clientGoogleProvider}
					text="Or login with Google"
				/>
			</div>
		</div>

		<!-- Signup Redirect -->
		<div class="mt-6 p-6 text-center">
			<p class="text-sm text-gray-400">Don't have an account?</p>
			<button
				class="mt-2 w-full h-10 rounded-md bg-gray-700 text-white font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
				onclick={redirectToSignup}
			>
				Sign Up
			</button>
		</div>
	</div>
</main>
