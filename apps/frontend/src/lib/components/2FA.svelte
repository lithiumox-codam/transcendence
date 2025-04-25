<script lang="ts">
    import { client } from "$lib/trpc";
    import { onMount } from "svelte";
    import QrCode from "svelte-qrcode";

    let otpurl = $state<string | null>(null);
    let showModal = $state(false);

    async function fetchOtpUrl() {
        try {
            const res = await client.auth.getOtpUrl.query();
            otpurl = res;
        } catch (error) {
            console.error("Error fetching OTP URL:", error);
        }
    }

    onMount(() => {
        fetchOtpUrl();
    });

    async function toggle2FA(e: Event) {
        e.preventDefault();
        try {
            const res = await client.auth.toggle2FA.mutate();
            otpurl = res;
            showModal = otpurl ? true : false;
        } catch (error) {
            console.error("Error toggling 2FA:", error);
        }
    }
</script>

{#if showModal}
    <button
        type="button"
        class="fixed inset-0 bg-black/70 backdrop-blur-sm z-10"
        onclick={toggle2FA}
        aria-label="Close modal"
    ></button>
    <div
        class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 p-6 rounded-lg shadow-lg z-20 w-96 max-w-full"
    >
        <!-- Modal Header -->
        <div class="border-b border-gray-600 pb-4 mb-4 text-center">
            <h2 class="text-xl text-white">Enable 2FA</h2>
        </div>

        <!-- Modal Content -->
        <div class="text-center">
            <p class="text-gray-300 mb-10">
                To enable 2FA, scan the QR code below with your authenticator
                app.
            </p>
            <div class="flex justify-center mb-10">
                <div class="border-6 border-gray-600">
                    <QrCode value={otpurl} size="246" />
                </div>
            </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex justify-center gap-3 mt-4">
            <button
                class="bg-blue-500 text-white px-4 py-2 rounded-md transition duration-300 hover:bg-gray-700"
                onclick={() => (showModal = false)}
            >
                Confirm</button
            >
            <button
                class="bg-gray-600 text-white px-4 py-2 rounded-md transition duration-300 hover:bg-gray-700"
                onclick={toggle2FA}>Cancel</button
            >
        </div>
    </div>
{/if}

<form class="space-y-4" onsubmit={toggle2FA}>
    <button
        class="bg-blue-500 text-white px-4 py-2 rounded-md transition duration-300 hover:bg-blue-700"
    >
        {otpurl ? "Disable 2FA" : "Enable 2FA"}
    </button>
</form>
