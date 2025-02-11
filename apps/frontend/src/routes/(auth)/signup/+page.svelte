<script lang="ts">
    import type { UserInsert } from "@repo/database";
    import type { PageData } from "./$types";
    import { client } from "$lib/trpc";
    import { browser } from "$app/environment";

    let { data }: { data: PageData } = $props();

    let newUser: UserInsert = $state({
        name: "",
        email: "",
        password: "",
    });

    let confirmPassword = $state("");

    async function handleSubmit(event: Event) {
        event.preventDefault();

        try {
            const response = await client.auth.signup.mutate(newUser);
            if (browser) localStorage.setItem("token", response.jwt);
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
                Create an account
            </h3>
            <p class="text-sm text-muted-foreground">
                Enter your email below to create your account
            </p>
        </div>
        <div class="p-6">
            <form onsubmit={handleSubmit} class="space-y-4">
                <div class="space-y-2">
                    <label
                        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        for="name">Name</label
                    >
                    <input
                        type="text"
                        bind:value={newUser.name}
                        placeholder="Enter your name"
                        required
                        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="name"
                    />
                </div>
                <div class="space-y-2">
                    <label
                        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        for="email">Email</label
                    >
                    <input
                        type="email"
                        bind:value={newUser.email}
                        placeholder="Enter your email"
                        required
                        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="email"
                    />
                </div>
                <div class="space-y-2">
                    <label
                        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        for="password">Password</label
                    >
                    <input
                        type="password"
                        bind:value={newUser.password}
                        placeholder="Enter your password"
                        required
                        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="password"
                    />
                </div>
                <div class="space-y-2">
                    <label
                        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        for="confirm-password">Confirm Password</label
                    >
                    <input
                        type="password"
                        bind:value={confirmPassword}
                        placeholder="Confirm your password"
                        required
                        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="confirm-password"
                    />
                </div>
                {#if newUser.password !== confirmPassword}
                    <button
                        disabled
                        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-primary text-primary-foreground"
                    >
                        Sign up
                    </button>
                {:else}
                    <button
                        type="submit"
                        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-primary text-primary-foreground"
                    >
                        Sign up
                    </button>
                {/if}
            </form>
        </div>
    </div>
</main>
