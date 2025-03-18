<script lang="ts">
    import { client } from "$lib/trpc";
    import QrCode from "svelte-qrcode";

    let otpurl = $state<string | null>(null);

    async function toggle2FA(e: Event) {
        e.preventDefault();
        try {
            const res = await client.auth.toggle2FA.mutate();
            otpurl = res;
        } catch (error) {
            console.error("Error toggling 2FA:", error);
        }
    }
</script>

{#if otpurl}
    <div class="space-y-4">
        <QrCode value={otpurl} />
        <p class="text-center">Scan the QR code with your authenticator app</p>
    </div>
{/if}

<form class="space-y-4" onsubmit={toggle2FA}>
    <button
        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-primary text-primary-foreground"
    >
        Toggle 2FA
    </button>
</form>
