<script lang="ts">
	import { client } from "$lib/trpc";
	import { onMount } from "svelte";
	import QrCode from "svelte-qrcode";

	let otpurl = $state<string | null>(null);
	let showModal = $state(false);
	let isLoading = $state(false); // Add loading state

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

	async function handleToggle2FA(e?: Event) {
		e?.preventDefault();
		isLoading = true; // Start loading
		try {
			const res = await client.auth.toggle2FA.mutate();
			otpurl = res;
			// Only show modal if enabling (otpurl is returned)
			showModal = !!otpurl;
		} catch (error) {
			console.error("Error toggling 2FA:", error);
			// Optionally show an error message to the user
		} finally {
			isLoading = false; // Stop loading
		}
	}

	function closeModal() {
		showModal = false;
		// Optionally, you might want to refetch the status or assume it's enabled
		// fetchOtpUrl(); // Or update otpurl state based on confirmation
	}

	// Function to handle cancellation - potentially reverts the toggle action if needed
	async function cancelEnable2FA() {
		// If enabling was triggered, we might need to call toggle again to disable it
		if (otpurl) {
			await handleToggle2FA(); // Call toggle again to revert
		}
		showModal = false; // Close modal regardless
	}
</script>

{#if showModal}
	<button
		type="button"
		class="fixed inset-0 bg-black/70 backdrop-blur-sm z-10 cursor-pointer"
		onclick={cancelEnable2FA}
		aria-label="Close modal"
	></button>
	<div
		class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/10 border border-white/10 rounded-xl p-6 shadow-[0_0_20px_rgba(0,255,255,0.05)] backdrop-blur-sm z-20 w-96 max-w-full"
	>
		<!-- Modal Header -->
		<div class="border-b border-gray-600 pb-4 mb-4 text-center">
			<h2 class="text-xl text-white font-bold">
				Enable Two-Factor Authentication
			</h2>
		</div>

		<!-- Modal Content -->
		<div class="text-center">
			<p class="text-gray-300 mb-6 text-sm">
				Scan the QR code below with your authenticator app (e.g., Google
				Authenticator, Authy) to add your account.
			</p>
			{#if otpurl}
				<div class="flex justify-center mb-6">
					<div class="p-2 bg-white rounded-lg inline-block">
						<QrCode value={otpurl} size={246} />
					</div>
				</div>
			{:else}
				<p class="text-yellow-400 text-sm">Loading QR Code...</p>
			{/if}
		</div>

		<!-- Modal Footer -->
		<div class="flex justify-center gap-3 mt-6">
			<button
				class="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-md transition duration-300 hover:bg-blue-600/10 cursor-pointer"
				onclick={closeModal}
				disabled={!otpurl}
			>
				Confirm
			</button>
			<button
				class="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-md transition duration-300 hover:bg-gray-700/10 cursor-pointer"
				onclick={cancelEnable2FA}
			>
				Cancel
			</button>
		</div>
	</div>
{/if}

<!-- Keep the form structure if needed for semantics, or just use a button -->
<button
	onclick={handleToggle2FA}
	disabled={isLoading}
	class="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-md transition duration-300 cursor-pointer flex-shrink-0 disabled:opacity-50 disabled:cursor-wait {otpurl
		? 'hover:bg-red-600/10'
		: 'hover:bg-blue-600/10'}"
>
	{#if isLoading}
		Processing...
	{:else}
		{otpurl ? "Disable 2FA" : "Enable 2FA"}
	{/if}
</button>
