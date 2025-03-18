<script lang="ts">
	import { client } from "$lib/trpc";
	import { goto } from "$app/navigation";

	let showDeleteModal = $state(false);
	let showPolicyModal = $state(false);
	let showPasswordModal = $state(false);
	let username = $state("");
	let oldPassword = $state("");
	let newPassword = $state("");
	let confirmPassword = $state("");
	let errorMessage = $state("");
	let isLoading = $state(false); // For button loading state
	let successMessage = $state("");

	async function handleChangePassword() {
		try {
			// Ensure all fields are filled
			if (!oldPassword || !newPassword || !confirmPassword) {
				errorMessage = "Please enter all fields.";
				return;
			}

			// Validate password confirmation
			if (newPassword !== confirmPassword) {
				errorMessage = "Passwords do not match.";
				return;
			}

			// Make API request to change password
			await client.user.privacy.changePassword.mutate({
				oldPassword,
				newPassword,
			});

			// Reset inputs after success
			oldPassword = "";
			newPassword = "";
			confirmPassword = "";

			// Close modal automatically
			togglePasswordModal();
		} catch (error) {
			console.error(error);
			errorMessage = "Incorrect password.";
		}
	}

	async function handleDeletion() {
		try {
			if (!username) {
				errorMessage = "Please enter your username.";
				return;
			}

			await client.user.privacy.deleteAccount.mutate({
				username,
			});
			alert("Your account has been deleted.");
			localStorage.removeItem("token");
			goto("/");
			setTimeout(() => location.reload(), 100);
		} catch (error) {
			console.error(error);
			errorMessage = "Incorrect username";
		}
	}

	function toggleDeleteModal() {
		showDeleteModal = !showDeleteModal;
		username = "";
		errorMessage = "";
	}

	function togglePolicyModal() {
		showPolicyModal = !showPolicyModal;
	}

	function togglePasswordModal() {
		showPasswordModal = !showPasswordModal;
		oldPassword = "";
		newPassword = "";
		confirmPassword = "";
		errorMessage = "";
	}
</script>

<section class="settings-container">
	<h2 class="section-title">Settings</h2>

	<div class="settings-list">
		<!-- Password Change UI -->
		<div class="setting-item">
			<div class="setting-text">
				<h3>Change Password</h3>
				<p>Update your password to keep your account secure.</p>
			</div>
			<button class="button" onclick={togglePasswordModal}>Change</button>
		</div>

		<!-- Password Change Modal -->
		{#if showPasswordModal}
			<button
				type="button"
				class="modal-overlay"
				onclick={togglePasswordModal}
				aria-label="Close modal"
				onkeydown={(e) => e.key === "Enter" && togglePasswordModal()}
			></button>
			<div class="modal">
				<h2 class="modal-title">Change Password</h2>
				<p class="modal-text">
					Enter your current password and choose a new one.
				</p>

				<div class="input-group">
					<input
						class="modal-input"
						type="password"
						placeholder="Current Password"
						bind:value={oldPassword}
					/>
					<input
						class="modal-input"
						type="password"
						placeholder="New Password"
						bind:value={newPassword}
					/>
					<input
						class="modal-input"
						type="password"
						placeholder="Confirm New Password"
						bind:value={confirmPassword}
					/>
				</div>

				<!-- Show Error Message if needed -->
				{#if errorMessage}
					<p class="error-message">{errorMessage}</p>
				{/if}

				<div class="modal-footer">
					<button
						class="confirm-button"
						onclick={handleChangePassword}
					>
						Save
					</button>
					<button class="cancel-button" onclick={togglePasswordModal}>
						Cancel
					</button>
				</div>
			</div>
		{/if}

		<!-- Delete Account -->
		<div class="setting-item delete-item">
			<div class="setting-text">
				<h3>Delete Account</h3>
				<p>
					Permanently delete your account and all associated data.
					Before proceeding, please review our
					<button
						type="button"
						class="link-text"
						onclick={togglePolicyModal}
						aria-label="Privacy Policy"
					>
						Privacy Policy
					</button>.
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
			<!-- Modal Header -->
			<div class="modal-header">
				<h2 class="modal-title">Confirm Account Deletion</h2>
			</div>

			<!-- Modal Content -->
			<div class="modal-content">
				<p class="modal-text">
					To proceed with account deletion, please enter your
					username.
				</p>

				<!-- Username Input -->
				<div class="input-group">
					<input
						id="username"
						class="modal-input"
						type="text"
						placeholder="Enter your username"
						bind:value={username}
					/>
				</div>

				<!-- Error Message -->
				{#if errorMessage}
					<p class="error-message">{errorMessage}</p>
				{/if}
			</div>

			<!-- Modal Footer -->
			<div class="modal-footer">
				<button class="confirm-delete" onclick={handleDeletion}
					>Delete</button
				>
				<button class="cancel-button" onclick={toggleDeleteModal}
					>Cancel</button
				>
			</div>
		</div>
	{/if}

	{#if showPolicyModal}
		<button
			type="button"
			class="modal-overlay"
			onclick={togglePolicyModal}
			aria-label="Close modal"
		></button>
		<div class="modal">
			<!-- Modal Header -->
			<div class="modal-header">
				<h2 class="modal-title">Privacy Policy</h2>
			</div>

			<!-- Scrollable Content -->
			<div class="modal-content">
				<h3>1. Introduction</h3>
				<p>
					We value your privacy and are committed to complying with
					the
					<strong>General Data Protection Regulation (GDPR)</strong>.
					This Privacy Policy explains how we collect, use, and
					protect your personal data.
				</p>

				<h3>2. Data Collection & Use</h3>
				<p>
					We only collect essential data necessary for your account
					operation. This includes your
					<strong>username, email, and game-related data</strong>. You
					have full control over managing, editing, or deleting your
					data at any time.
				</p>

				<h3>3. Account Deletion & Data Retention</h3>
				<p>
					When you delete your account, all <strong
						>personal data will be permanently removed</strong
					>. However,
					<strong>game-related data will be anonymized</strong> to maintain
					platform integrity. This ensures your privacy while allowing
					us to keep non-personal records for analytics and fair play.
				</p>

				<h3>4. Your Rights Under GDPR</h3>
				<ul>
					<li>✔ Request access to your stored data.</li>
					<li>✔ Modify or delete your personal information.</li>
					<li>
						✔ Request <strong>anonymization</strong> of game-related
						data.
					</li>
					<li>
						✔ Withdraw consent for data processing at any time.
					</li>
				</ul>

				<h3>5. Contact & Support</h3>
				<p>
					If you have questions about this Privacy Policy or wish to
					exercise any of your rights, please contact our <strong
						>support team</strong
					>.
				</p>
			</div>

			<!-- Modal Footer -->
			<div class="modal-footer">
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

	.settings-list {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

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
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
	}

	.delete-button {
		background-color: #d32f2f;
	}

	.delete-button:hover {
		background-color: #b71c1c;
	}

	.confirm-delete {
		background-color: #dc3545;
		padding: 12px 20px;
		font-size: 16px;
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: background 0.3s ease;
	}

	.confirm-delete:hover {
		background-color: #c82333;
	}

	.modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: #222;
		padding: 25px;
		border-radius: 10px;
		box-shadow: 0 4px 8px rgba(255, 255, 255, 0.1);
		width: 420px;
		max-width: 90%;
		display: flex;
		flex-direction: column;
		z-index: 11;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.7); /* Darker for better contrast */
		backdrop-filter: blur(3px); /* Slightly reduced blur */
		z-index: 10;
	}

	.modal-header {
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		padding-bottom: 15px;
		margin-bottom: 15px;
		text-align: center;
	}

	.modal-title {
		font-size: 1.5rem;
		color: white;
		margin-bottom: 10px;
		text-align: center;
	}

	.modal-text {
		font-size: 1.1rem;
		color: #ddd; /* Slightly brighter for better readability */
		margin: 20px auto;
		padding-top: 10px; /* Creates spacing from modal title */
		text-align: center;
		line-height: 1.6;
		max-width: 90%;
	}

	.modal-content {
		overflow-y: auto;
		flex-grow: 1;
		max-height: 60vh;
		padding: 15px;
	}

	.modal-content h3 {
		color: white;
		font-size: 1.3rem;
		margin-bottom: 10px;
		text-align: center;
	}

	.modal-content p {
		color: #bbb;
		font-size: 1rem;
		line-height: 1.6;
		text-align: center;
		margin-bottom: 15px;
	}

	.modal-content ul {
		list-style: none;
		padding-left: 0;
		text-align: center;
	}

	.modal-content ul li {
		color: #bbb;
		font-size: 1rem;
		margin-bottom: 12px;
		line-height: 1.6;
	}

	.modal-footer {
		display: flex;
		justify-content: center;
		gap: 15px;
		margin-top: 15px;
	}

	.modal-input {
		padding: 12px;
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 6px;
		width: 100%; /* Ensures input takes full width */
		max-width: 320px; /* Limits width so it's not too wide */
		background: rgba(255, 255, 255, 0.08);
		color: white;
		font-size: 1rem;
		text-align: center;
		outline: none;
	}

	.modal-input:focus {
		border-color: #007bff; /* Highlight input when focused */
		background: rgba(255, 255, 255, 0.15);
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

	.cancel-button {
		background-color: #444;
		padding: 12px 20px;
		font-size: 16px;
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: background 0.3s ease;
	}

	.cancel-button:hover {
		background-color: #666;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px; /* Adds spacing between inputs */
		width: 100%;
	}

	.error-message {
		color: #ff4d4d;
		font-size: 14px;
		margin-top: 5px;
		margin-bottom: 10px; /* Adds space below the error */
		text-align: center;
		font-weight: bold;
	}

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
