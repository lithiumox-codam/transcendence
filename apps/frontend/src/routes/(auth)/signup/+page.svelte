<script lang="ts">
    import { client } from "$lib/trpc";
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import { redirectParam } from "$lib/utils/redirect";
    import GoogleButton from "$lib/components/GoogleButton.svelte";

    let name = $state("");
    let email = $state("");
    let password = $state("");
    let confirmPassword = $state("");

    async function handleSubmit(event: Event) {
        event.preventDefault();
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
    class="flex min-h-screen bg-slate-900 text-white items-center justify-center p-4"
>
    <div class="absolute inset-0 bg-black">
        <div
            class="absolute inset-0 bg-[size:40px_40px] bg-[linear-gradient(to_right,#4a55681a_1px,transparent_1px),linear-gradient(to_bottom,#4a55681a_1px,transparent_1px)] opacity-50 animate-[backgroundPan_20s_linear_infinite]"
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
            <h3
                class="select-none text-3xl font-bold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]"
            >
                Sign Up
            </h3>
            <p class="select-none text-sm text-gray-300">
                Enter your details below to create your account
            </p>
        </div>

        <!-- Signup Form -->
        <form class="space-y-4" onsubmit={handleSubmit}>
            <div class="space-y-2">
                <label
                    class="text-sm font-semibold text-gray-300 select-none"
                    for="name">Name</label
                >
                <input
                    type="text"
                    placeholder="Enter your name"
                    required
                    class="select-none flex h-10 w-full p-3 border border-gray-600/20 rounded-md bg-gray-700/20 text-white placeholder-gray-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    id="name"
                    bind:value={name}
                />
            </div>
            <div class="space-y-2">
                <label
                    class="text-sm font-semibold text-gray-300 select-none"
                    for="email">Email</label
                >
                <input
                    type="email"
                    placeholder="you@example.com"
                    required
                    class="select-none flex h-10 w-full p-3 border border-gray-600/20 rounded-md bg-gray-700/20 text-white placeholder-gray-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    class="select-none flex h-10 w-full p-3 border border-gray-600/20 rounded-md bg-gray-700/20 text-white placeholder-gray-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    id="password"
                    bind:value={password}
                />
            </div>
            <div class="space-y-2">
                <label
                    class="text-sm font-semibold text-gray-300 select-none"
                    for="confirm-password">Confirm Password</label
                >
                <input
                    type="password"
                    placeholder="••••••••"
                    required
                    class="select-none flex h-10 w-full p-3 border border-gray-600/20 rounded-md bg-gray-700/20 text-white placeholder-gray-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    id="confirm-password"
                    bind:value={confirmPassword}
                />
            </div>

            <button
                type="submit"
                class="w-full select-none cursor-pointer h-10 rounded-md bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 focus:ring-offset-slate-900 transition-colors duration-150"
            >
                Sign Up
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

        <!-- Google Signup Button -->
        <div class="flex justify-center">
            <GoogleButton />
        </div>

        <!-- Login Redirect -->
        <div class="mt-8 text-center">
            <p class="text-sm text-gray-400 select-none">
                Already have an account?
                <button
                    class="select-none font-semibold cursor-pointer text-blue-500 hover:text-blue-400 hover:underline focus:outline-none"
                    onclick={() => goto("/login")}
                >
                    Login
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

    .animate-\[backgroundPan_20s_linear_infinite\] {
        animation: backgroundPan 20s linear infinite;
    }
</style>
