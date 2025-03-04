<script lang="ts">
	import type { PageData } from "./$types";
	import { client } from "$lib/trpc";
	import { fly } from "svelte/transition";
    import { goto } from "$app/navigation";

	let showConfirmation = $state(false);
	let password = $state("");

	async function handleDeletion() {
		try {
			await client.user.privacy.deleteAccount.mutate({ password });
			alert("Your account has been deleted.");
			localStorage.removeItem("token");
			goto("/");
		} catch (error) {
			console.error(error);
		}
	}

	function toggleConfirmation() {
		showConfirmation = !showConfirmation;
	}
</script>

<main class="container">
	<h1>Privacy Settings</h1>
	<p>Manage your privacy settings below.</p>

	<a href="/privacy-policy" class="button">View Privacy Policy</a>

	<button class="button" onclick={toggleConfirmation}>
		{showConfirmation ? "Cancel" : "Delete Account"}
	</button>

	{#if showConfirmation}
		<div class="confirmation-box" transition:fly={{ y: 20, duration: 300 }}>
			<p>Type your <strong>password</strong> to confirm account deletion.</p>
			<input
				class="confirmation-input"
				type="text"
				placeholder="Confirm your password here"
				bind:value={password}
			/>
			<button class="confirm-delete" onclick={handleDeletion}>
				Confirm Deletion
			</button>
		</div>
	{/if}
</main>

<style>
    .container {
        max-width: 600px;
        margin: 40px auto;
        padding: 20px;
        background-color: #f9f9f9;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        text-align: center;
    }

    h1 {
        font-size: 2.5rem;
        color: #333;
        margin-bottom: 20px;
    }

    p {
        font-size: 1.2rem;
        color: #666;
        margin-bottom: 30px;
    }

    .button {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 12px 24px;
        cursor: pointer;
        border-radius: 6px;
        font-size: 16px;
        transition: background 0.3s ease;
        margin: 10px;
    }

    .button:hover {
        background-color: #0056b3;
    }

    .confirmation-box {
        background: rgba(0, 123, 255, 0.1);
        padding: 20px;
        margin-top: 20px;
        border-radius: 10px;
        border: 1px solid #007bff;
    }

    .confirmation-input {
        margin-top: 10px;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        width: 100%;
        font-size: 16px;
        text-align: center;
    }

    .confirm-delete {
        background-color: #dc3545;
        margin-top: 20px;
        padding: 12px;
        font-size: 16px;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background 0.3s ease;
    }

    .confirm-delete:hover {
        background-color: #c82333;
    }
</style>
