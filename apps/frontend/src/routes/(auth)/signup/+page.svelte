<script lang="ts">
    import { client } from "$lib/trpc";
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import { redirectParam } from "$lib/utils/redirect";
    import GoogleButton from "$lib/components/GoogleButton.svelte";
    import { LogIn } from "@lucide/svelte";

    let name = $state("");
    let email = $state("");
    let password = $state("");
    let confirmPassword = $state("");

    async function handleSubmit(event: Event) {
        event.preventDefault();
        if (password !== confirmPassword) {
            console.error("Passwords do not match");
            return;
        }
        try {
            const res = await client.auth.signup.mutate({
                name,
                email,
                password,
            });
            if (browser) localStorage.setItem("token", res);
            redirectParam();
        } catch (error) {
            console.error(error);
        }
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
            <h3 class="text-2xl font-semibold tracking-tight">Sign Up</h3>
            <p class="text-sm text-gray-400">
                Enter your details below to create your account
            </p>
        </div>

        <!-- Signup Form -->
        <div class="p-6">
            <form class="space-y-4" onsubmit={handleSubmit}>
                <div class="space-y-2">
                    <label class="text-sm font-medium" for="name">Name</label>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        required
                        class="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="name"
                        bind:value={name}
                    />
                </div>
                <div class="space-y-2">
                    <label class="text-sm font-medium" for="email">Email</label>
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
                    <label class="text-sm font-medium" for="password"
                        >Password</label
                    >
                    <input
                        type="password"
                        placeholder="Enter your password"
                        required
                        class="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="password"
                        bind:value={password}
                    />
                </div>
                <div class="space-y-2">
                    <label class="text-sm font-medium" for="confirm-password"
                        >Confirm Password</label
                    >
                    <input
                        type="password"
                        placeholder="Confirm your password"
                        required
                        class="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="confirm-password"
                        bind:value={confirmPassword}
                    />
                </div>
                <button
                    type="submit"
                    class="w-full h-10 cursor-pointer rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Sign Up
                </button>
            </form>
            <!-- Google Signup -->
            <p class="mt-2 text-sm text-center text-gray-400">or</p>
            <div class="flex justify-center">
                <GoogleButton>Login with Google</GoogleButton>
            </div>
        </div>

        <!-- Login Redirect -->
        <div class="p-6 text-center">
            <p class="text-sm text-gray-400">Already have an account?</p>
            <button
                class="mt-2 w-full h-10 rounded-md bg-gray-700 text-white font-medium cursor-pointer hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onclick={() => goto("/login")}
            >
                Login
            </button>
        </div>
    </div>
</main>
