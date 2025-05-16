<script lang="ts">
	import { client } from "$lib/trpc";
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import { redirectParam } from "$lib/utils/redirect";
	import GoogleButton from "$lib/components/GoogleButton.svelte";
	import { onMount } from "svelte";

	let email = $state("");
	let password = $state("");
	let otpToken = $state<string | undefined>(undefined);

	onMount(() => {
		// Check if the user is already logged in
		const token = localStorage.getItem("token");
		if (token) {
			goto("/stats");
		}
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();
		try {
			const res = await client.auth.login.mutate({
				email,
				password,
				otpToken,
			});
			if (res === "2fa") {
				otpToken = "";
				return;
			}
			if (browser) localStorage.setItem("token", res);
			redirectParam();
		} catch (error) {
			console.error(error);
		}
	}
</script>

<main
	class="flex min-h-screen bg-slate-900 text-white items-center justify-center p-4"
>
	<div class="absolute inset-0 bg-black">
		<div
			class="absolute inset-0 bg-[size:40px_40px] bg-[linear-gradient(to_right,#4a55681a_1px,transparent_1px),linear-gradient(to_bottom,#4a55681a_1px,transparent_1px)] opacity-50 background-pan-effect"
		></div>
		<div
			class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"
		></div>
	</div>

	<div
		class="flex flex-col w-full max-w-md bg-black/10 border border-white/10 rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.05)] backdrop-blur-sm p-6 sm:p-8"
	>
		<!-- Header -->
		<div class="flex flex-col space-y-2 text-center mb-6">
			<h3 class="text-2xl font-semibold text-white select-none">Login</h3>
			<p class="text-sm text-gray-300 select-none">
				Enter your email and password to access your account
			</p>
		</div>

		<!-- Login Form -->
		<form class="space-y-4" onsubmit={handleSubmit}>
			<div class="space-y-2">
				<label
					class="text-sm font-semibold text-gray-300 select-none"
					for="email">Email</label
				>
				<input
					type="email"
					placeholder="you@example.com"
					required
					class="flex h-10 w-full p-3 border border-gray-600/20 rounded-md bg-gray-700/20 text-white placeholder-gray-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all select-none"
					id="email"
					bind:value={email}
				/>
			</div>
			<div class="space-y-2">
				<label
					class="text-sm font-semibold text-gray-300 select-none"
					for="password">Password</label
				>
				<input
					type="password"
					placeholder="••••••••"
					required
					class="flex h-10 w-full p-3 border border-gray-600/20 rounded-md bg-gray-700/20 text-white placeholder-gray-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all select-none"
					id="password"
					bind:value={password}
				/>
			</div>

			{#if otpToken !== undefined}
				<div class="space-y-2">
					<label
						class="text-sm font-semibold text-gray-300 select-none"
						for="otpToken">2FA Token</label
					>
					<input
						type="text"
						inputmode="numeric"
						pattern="\d{6}"
						placeholder="Enter your 6-digit token"
						required
						class="flex h-10 w-full p-3 border border-gray-600/20 rounded-md bg-gray-700/20 text-white placeholder-gray-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all select-none"
						id="otpToken"
						bind:value={otpToken}
					/>
				</div>
			{/if}

			<button
				type="submit"
				class="w-full cursor-pointer h-10 rounded-md bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 focus:ring-offset-slate-900 transition-colors duration-150 select-none"
			>
				Login
			</button>
		</form>

		<!-- OR Separator -->
		<div class="my-6 flex items-center">
			<div class="flex-grow border-t border-gray-600/20"></div>
			<span class="mx-4 flex-shrink text-xs text-gray-400 select-none"
				>OR</span
			>
			<div class="flex-grow border-t border-gray-600/20"></div>
		</div>

		<!-- Google Login Button -->
		<div class="flex justify-center">
			<GoogleButton />
		</div>

		<!-- Signup Redirect -->
		<div class="mt-8 text-center">
			<p class="text-sm text-gray-400 select-none">
				Don't have an account?
				<button
					class="font-semibold cursor-pointer select-none text-blue-500 hover:text-blue-400 hover:underline focus:outline-none"
					onclick={() => goto("/signup")}
				>
					Sign Up
				</button>
			</p>
		</div>
	</div>
</main>

<style>
	@keyframes backgroundPan {
		0% {
			transform: scale(1) translate(0, 0);
		}
		50% {
			transform: scale(1.05) translate(10px, 10px);
		}
		100% {
			transform: scale(1) translate(0, 0);
		}
	}
</style>
