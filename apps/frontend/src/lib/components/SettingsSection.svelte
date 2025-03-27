<script lang="ts">
	import { client } from "$lib/trpc";
	import { goto } from "$app/navigation";

	let showDeleteModal = $state(false);
	let showPasswordModal = $state(false);

	let username = $state("");
	let oldPassword = $state("");
	let newPassword = $state("");
	let confirmPassword = $state("");
	let errorMessage = $state("");

	let isOAuth = $state(false);
	let isPasswordSet = $state(false);

	async function handleSetOrChangePassword() {
		try {
			// Ensure all fields are filled
			// oldpassword? with isOAuth && !isPasswordSet
			if (!oldPassword || !newPassword || !confirmPassword) {
				errorMessage = "Please enter all fields.";
				return;
			}

			// Validate password confirmation
			if (newPassword !== confirmPassword) {
				errorMessage = "Passwords do not match.";
				return;
			}

			// Validate password strength

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
			errorMessage =
				isOAuth && !isPasswordSet
					? "Failed to set password."
					: "Incorrect password.";
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

	// not needed ?
	function toggleDeleteModal() {
		showDeleteModal = !showDeleteModal;
		username = "";
		errorMessage = "";
	}

	function togglePasswordModal() {
		showPasswordModal = !showPasswordModal;
		oldPassword = "";
		newPassword = "";
		confirmPassword = "";
		errorMessage = "";
	}
</script>

<section class="max-w-3xl mx-auto p-5 bg-transparent text-center">
	<h2 class="text-2xl text-white mb-5 text-left">Settings</h2>

	<div class="flex flex-col gap-5">
		<!-- Password Change UI -->
		<div
			class="flex justify-between items-center bg-white/5 p-4 rounded-lg transition duration-300 hover:bg-white/10"
		>
			<div class="text-left">
				{isOAuth && !isPasswordSet ? "Set Password" : "Change Password"}
				<p class="text-gray-400">
					{isOAuth && !isPasswordSet
						? "Set a password for your account to enable regular login."
						: "Update your password to keep your account secure."}
				</p>
			</div>
			<button
				class="bg-blue-500 text-white px-4 py-2 rounded-md transition duration-300 hover:bg-blue-700"
				onclick={togglePasswordModal}
			>
				{isOAuth && !isPasswordSet ? "Set Password" : "Change Password"}
			</button>
		</div>

		<!-- Delete Account -->
		<div
			class="flex justify-between items-center bg-white/5 p-4 rounded-lg transition duration-300 hover:bg-red-100/10"
		>
			<div class="text-left">
				<h3 class="text-xl text-white mb-1">Delete Account</h3>
				<p class="text-gray-400">
					Permanently delete your account and all associated data.
					Before proceeding, please review our <a
						href="/privacy-policy"
						class="text-blue-500 underline">Privacy Policy</a
					>
				</p>
			</div>
			<button
				class="bg-red-600 text-white px-4 py-2 rounded-md transition duration-300 hover:bg-red-800"
				onclick={toggleDeleteModal}>Delete</button
			>
		</div>
	</div>

	<!-- Password Modal -->
	{#if showPasswordModal}
		<button
			type="button"
			class="fixed inset-0 bg-black/70 backdrop-blur-sm z-10"
			onclick={togglePasswordModal}
			aria-label="Close modal"
			onkeydown={(e) => e.key === "Enter" && togglePasswordModal()}
		></button>
		<div
			class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 p-6 rounded-lg shadow-lg z-20 w-96 max-w-full"
		>
			<h2 class="text-xl text-white mb-4">
				{isOAuth && !isPasswordSet ? "Set Password" : "Change Password"}
			</h2>
			<p class="text-gray-300 mb-4">
				{isOAuth && !isPasswordSet
					? "Set a password for your account to enable regular login."
					: "Enter your current password and choose a new one."}
			</p>

			<div class="flex flex-col gap-3">
				{#if !(isOAuth && !isPasswordSet)}
					<input
						class="p-3 border border-gray-600 rounded-md bg-gray-700 text-white"
						type="password"
						placeholder="Current Password"
						bind:value={oldPassword}
					/>
				{/if}
				<input
					class="p-3 border border-gray-600 rounded-md bg-gray-700 text-white"
					type="password"
					placeholder="New Password"
					bind:value={newPassword}
				/>
				<input
					class="p-3 border border-gray-600 rounded-md bg-gray-700 text-white"
					type="password"
					placeholder="Confirm New Password"
					bind:value={confirmPassword}
				/>
			</div>

			{#if errorMessage}
				<p class="text-red-500 text-sm mt-2">{errorMessage}</p>
			{/if}

			<div class="flex justify-center gap-3 mt-4">
				<button
					class="bg-blue-500 text-white px-4 py-2 rounded-md transition duration-300 hover:bg-blue-700"
					onclick={handleSetOrChangePassword}
				>
					{isOAuth && !isPasswordSet ? "Set Password" : "Save"}
				</button>
				<button
					class="bg-gray-600 text-white px-4 py-2 rounded-md transition duration-300 hover:bg-gray-700"
					onclick={togglePasswordModal}
				>
					Cancel
				</button>
			</div>
		</div>
	{/if}

	<!-- Delete Account Modal -->
	{#if showDeleteModal}
		<button
			type="button"
			class="fixed inset-0 bg-black/70 backdrop-blur-sm z-10"
			onclick={toggleDeleteModal}
			aria-label="Close modal"
		></button>
		<div
			class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 p-6 rounded-lg shadow-lg z-20 w-96 max-w-full"
		>
			<!-- Modal Header -->
			<div class="border-b border-gray-600 pb-4 mb-4 text-center">
				<h2 class="text-xl text-white">Confirm Account Deletion</h2>
			</div>

			<!-- Modal Content -->
			<div class="text-center">
				<p class="text-gray-300 mb-4">
					To proceed with account deletion, please enter your
					username.
				</p>

				<!-- Username Input -->
				<div class="flex flex-col items-center gap-3">
					<input
						id="username"
						class="p-3 border border-gray-600 rounded-md bg-gray-700 text-white w-full"
						type="text"
						placeholder="Enter your username"
						bind:value={username}
					/>
				</div>

				<!-- Error Message -->
				{#if errorMessage}
					<p class="text-red-500 text-sm mt-2">{errorMessage}</p>
				{/if}
			</div>

			<!-- Modal Footer -->
			<div class="flex justify-center gap-3 mt-4">
				<button
					class="bg-red-600 text-white px-4 py-2 rounded-md transition duration-300 hover:bg-red-800"
					onclick={handleDeletion}>Delete</button
				>
				<button
					class="bg-gray-600 text-white px-4 py-2 rounded-md transition duration-300 hover:bg-gray-700"
					onclick={toggleDeleteModal}>Cancel</button
				>
			</div>
		</div>
	{/if}
</section>
