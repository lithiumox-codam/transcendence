<script lang="ts">
    import { client } from "$lib/trpc";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    let number = $state(0);
    let string = $state("");

    let email = $state("");
    let name = $state("");

    let old_password = $state("");
    let new_password = $state("");

    $effect(() => {
        client.user.test.subscribe(undefined, {
            onData: (data) => {
                number = data;
            },
        });
        client.user.testString.subscribe(undefined, {
            onData: (data) => {
                string = data;
            },
        });
    });

    async function updateUserSubmit(event: Event) {
        event.preventDefault();
        try {
            const res = await client.user.update.mutate({
                email,
                name,
            });
            console.log(res);
        } catch (error) {
            console.error(error);
        }
    }

    async function changePasswordSubmit(event: Event) {
        event.preventDefault();
        try {
            const res = await client.auth.changePassword.mutate({
                old_password,
                new_password,
            });
            console.log(res);
        } catch (error) {
            console.error(error);
        }
    }
</script>

<h2>Update user</h2>
<form class="space-y-4" onsubmit={updateUserSubmit}>
    <div class="space-y-2">
        <label
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            for="email">Email</label
        >
        <input
            type="email"
            placeholder="New email"
            required
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            id="email"
            bind:value={email}
        />
    </div>
    <div class="space-y-2">
        <label
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            for="username">Username</label
        >
        <input
            type="text"
            placeholder="New Username"
            required
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            id="username"
            bind:value={name}
        />
    </div>
    <button
        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-primary text-primary-foreground"
    >
        Update
    </button>
</form>

<form class="space-y-4" onsubmit={changePasswordSubmit}>
    <div class="space-y-2">
        <label
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            for="old_password">Password</label
        >
        <input
            type="password"
            placeholder="Old Password"
            required
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            id="old_password"
            bind:value={old_password}
        />
    </div>
    <div class="space-y-2">
        <label
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            for="new_password">New Password</label
        >
        <input
            type="password"
            placeholder="New Password"
            required
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            id="new_password"
            bind:value={new_password}
        />
    </div>
    <button
        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-primary text-primary-foreground"
    >
        Change Password
    </button>
</form>

<br />

{number}
{string}
{JSON.stringify(data.user)}

{#if data.allusers}
    <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
            <tr>
                <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                    ID
                </th>
                <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                    Name
                </th>
                <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                    Email
                </th>
            </tr></thead
        >
        <tbody class="bg-white divide-y divide-gray-200">
            {#each data.allusers as user}
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">{user.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{user.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{user.email}</td>
                </tr>
            {/each}
        </tbody>
    </table>
{/if}
