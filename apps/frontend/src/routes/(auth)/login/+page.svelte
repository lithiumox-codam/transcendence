<script lang="ts">
    import { client } from "$lib/trpc";
    import { browser } from "$app/environment";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    let email = $state("");
    let password = $state("");

    async function handleSubmit(event: Event) {
        event.preventDefault();
        try {
            const res = await client.auth.login.mutate({
                email,
                password,
            });
            console.log(res);
            if (browser) localStorage.setItem("token", res.jwt);
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
                <button
                    class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-primary text-primary-foreground"
                >
                    Login
                </button>
            </form>
        </div>
    </div>
</main>
