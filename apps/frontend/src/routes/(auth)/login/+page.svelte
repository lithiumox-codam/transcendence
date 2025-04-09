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
			else goto("/stats");
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
					class="w-full cursor-pointer h-10 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					Login
				</button>
			</form>
			<!-- Google Login -->
			<p class="mt-2 text-sm text-center text-gray-400">or</p>
			<div class="flex justify-center">
				<GoogleButton
					providerConfig={data.clientGoogleProvider}
					
				>
					Login with Google
				</GoogleButton>
			</div>
		</div>

		<!-- Signup Redirect -->
		<div class="mt-6 p-6 text-center">
			<p class="text-sm text-gray-400">Don't have an account?</p>
			<button
				class="mt-2 w-full h-10 cursor-pointer rounded-md bg-gray-700 text-white font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
				onclick={redirectToSignup}
			>
				Sign Up
			</button>
		</div>
	</div>
</main>

<!-- let email = $state("");
    let password = $state("");
    let otpToken = $state<string | undefined>(undefined);

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
            if (data.redirect) goto(data.redirect);
            else goto("/demo/trpc");
        } catch (error) {
            console.error(error);
        }
    }
</script> -->

<!-- <main class="container relative h-screen grid place-items-center">
    <div
        class="relative flex w-[380px] flex-col rounded-md border bg-card text-card-foreground shadow-sm"
        data-v0-t="card"
    >
        <div class="flex flex-col space-y-1.5 p-6">
            <h3 class="font-semibold whitespace-nowrap tracking-tight text-2xl">
                Login
            </h3>
            <p class="text-sm text-muted-foreground">
                Enter your email and password to login
            </p>
        </div>
        <div class="p-6">
            <form class="space-y-4" onsubmit={handleSubmit}>
                <div class="space-y-2">
                    <label
                        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        for="email">Email</label
                    >
                    <input
                        type="email"
                        placeholder="Enter your email"
                        required
                        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="email"
                        bind:value={email}
                    />
                </div>
                <div class="space-y-2">
                    <label
                        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        for="password">Password</label
                    >
                    <input
                        type="password"
                        placeholder="Enter your password"
                        required
                        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="password"
                        bind:value={password}
                    />
                </div>

                {#if otpToken !== undefined}
                    <div class="space-y-2">
                        <label
                            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            for="otpToken">2FA Token</label
                        >
                        <input
                            type="text"
                            placeholder="Enter your 2FA token"
                            autocomplete="one-time-code"
                            required
                            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            id="otpToken"
                            bind:value={otpToken}
                        />
                    </div>
                {/if}

                <button
                    class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-primary text-primary-foreground"
                >
                    Login
                </button>
            </form>
        </div>
        <div class="p-6">
            <GoogleButton providerConfig={data.clientGoogleProvider} />
        </div>
    </div> -->