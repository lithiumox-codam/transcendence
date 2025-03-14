<script lang="ts">
	import { client } from "$lib/trpc";
	import { goto } from "$app/navigation";

	let showDeleteModal = $state(false);
	let showPolicyModal = $state(false); // New state for Privacy Policy modal
	let username = $state("");
	let password = $state("");
	let errorMessage = $state("");

	async function handleDeletion() {
		try {
			if (!username || !password) {
				errorMessage = "Please enter both your username and password.";
				return;
			}

			await client.user.privacy.deleteAccount.mutate({
				username,
				password,
			});
			alert("Your account has been deleted.");
			localStorage.removeItem("token");
			goto("/");
		} catch (error) {
			console.error(error);
			errorMessage = "The username or password you entered is incorrect.";
		}
	}

	function toggleDeleteModal() {
		showDeleteModal = !showDeleteModal;
		username = "";
		password = "";
		errorMessage = "";
	}

	function togglePolicyModal() {
		showPolicyModal = !showPolicyModal;
	}
</script>

<section class="settings-container">
	<h2 class="section-title">Settings</h2>

	<div class="settings-list">
		<!-- Change Password -->
		<div class="setting-item">
			<div class="setting-text">
				<h3>Change Password</h3>
				<p>Update your password to keep your account secure.</p>
			</div>
			<button class="button">Change</button>
		</div>

		<!-- Delete Account -->
		<div class="setting-item delete-item">
			<div class="setting-text">
				<h3>Delete Account</h3>
				<p>
					Permanently delete your account and all associated data.
					Before proceeding, please review our
					<span class="link-text" onclick={togglePolicyModal}
						>Privacy Policy</span
					>.
				</p>
			</div>
			<button class="button delete-button" onclick={toggleDeleteModal}
				>Delete</button
			>
		</div>
	</div>

	<!-- Delete Account Modal -->
	{#if showDeleteModal}
		<button
			type="button"
			class="modal-overlay"
			onclick={toggleDeleteModal}
			aria-label="Close modal"
		></button>
		<div class="modal">
			<h2 class="modal-title">Confirm Account Deletion</h2>
			<p class="modal-text">
				Enter your username and password to confirm deletion.
			</p>

			<input
				class="modal-input"
				type="text"
				placeholder="Enter your username"
				bind:value={username}
			/>
			<input
				class="modal-input"
				type="password"
				placeholder="Enter your password"
				bind:value={password}
			/>

			{#if errorMessage}
				<p class="error-message">{errorMessage}</p>
			{/if}

			<div class="modal-buttons">
				<button class="confirm-delete" onclick={handleDeletion}
					>Delete</button
				>
				<button class="cancel-button" onclick={toggleDeleteModal}
					>Cancel</button
				>
			</div>
		</div>
	{/if}

	<!-- Privacy Policy Modal -->
	{#if showPolicyModal}
		<button
			type="button"
			class="modal-overlay"
			onclick={togglePolicyModal}
			aria-label="Close modal"
		></button>
		<div class="modal">
			<h2 class="modal-title">Privacy Policy</h2>
			<p class="modal-text">
				Our Privacy Policy explains how we collect, use, and protect
				your personal data. By using our services, you agree to the
				collection and use of information as described. If you have any
				concerns, please contact us.
			</p>

			<div class="modal-buttons">
				<button class="cancel-button" onclick={togglePolicyModal}
					>Close</button
				>
			</div>
		</div>
	{/if}
</section>

<style>
	.settings-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
		background-color: transparent;
		text-align: center;
	}

	.section-title {
		font-size: 2rem;
		color: white;
		margin-bottom: 20px;
		text-align: left;
	}

	/* Settings List */
	.settings-list {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	/* Each Setting Item */
	.setting-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: rgba(255, 255, 255, 0.05);
		padding: 15px;
		border-radius: 8px;
		transition: background 0.3s ease;
	}

	.setting-text {
		flex: 1;
		text-align: left;
	}

	.setting-text h3 {
		font-size: 1.2rem;
		color: white;
		margin-bottom: 5px;
		text-align: left;
	}

	.setting-text p {
		font-size: 1rem;
		color: #bbb;
		margin: 0;
		text-align: left;
	}

	.link-text {
		color: #007bff;
		cursor: pointer;
		font-weight: bold;
		text-decoration: underline;
	}

	.link-text:hover {
		color: #0056b3;
	}

	.setting-item:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.delete-item:hover {
		background: rgba(255, 0, 0, 0.1);
	}

	.button {
		background-color: #007bff;
		color: white;
		border: none;
		padding: 10px 16px;
		cursor: pointer;
		border-radius: 6px;
		font-size: 14px;
		transition: background 0.3s ease;
	}

	.button:hover {
		background-color: #0056b3;
	}

	.delete-button {
		background-color: #d32f2f;
	}

	.delete-button:hover {
		background-color: #b71c1c;
	}

	/* === Modal Styling === */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(5px);
		z-index: 10;
	}

	.modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: #222;
		padding: 20px;
		border-radius: 10px;
		box-shadow: 0 4px 8px rgba(255, 255, 255, 0.1);
		width: 400px;
		text-align: center;
		z-index: 11;
		animation: fadeIn 0.3s ease-out;
	}

	.modal-title {
		font-size: 1.5rem;
		color: white;
		margin-bottom: 10px;
	}

	.modal-text {
		font-size: 1.1rem;
		color: #bbb;
		margin-bottom: 15px;
		text-align: left;
	}

	.modal-buttons {
		margin-top: 15px;
		display: flex;
		justify-content: center;
		gap: 10px;
	}

	.cancel-button {
		background-color: #444;
		padding: 12px 20px;
		font-size: 16px;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		transition: background 0.3s ease;
	}

	.cancel-button:hover {
		background-color: #666;
	}

	/* === Animations === */
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translate(-50%, -45%);
		}
		to {
			opacity: 1;
			transform: translate(-50%, -50%);
		}
	}
</style>
