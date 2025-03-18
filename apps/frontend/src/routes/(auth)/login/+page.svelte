<script lang="ts">
    import { client } from "$lib/trpc";
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import GoogleButton from "$lib/components/GoogleButton.svelte";

    let { data } = $props();

    let email = $state("");
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
</script>

<main class="container relative h-screen grid place-items-center">
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
    </div>
</main>
