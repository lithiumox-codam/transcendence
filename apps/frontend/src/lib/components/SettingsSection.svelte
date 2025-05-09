<script lang="ts">
	import { client } from "$lib/trpc";
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import TWOFA from "./2FA.svelte";
	import { updated } from "$app/state";

	let showDeleteModal = $state(false);
	let showPasswordModal = $state(false);

	let username = $state("");
	let oldPassword = $state("");
	let newPassword = $state("");
	let confirmPassword = $state("");
	let errorMessage = $state("");

	let isOAuth = $state(false);
	let isPasswordSet = $state(false);

	onMount(async () => {
		try {
			const user = await client.user.get.query();
			isOAuth = user[0]?.oAuthProvider !== null;
			isPasswordSet = user[0]?.passwordSet === 1;
		} catch (err) {
			console.error("Failed to fetch user", err);
		}
	});

	async function handleChangePassword() {
		try {
			if (!oldPassword || !newPassword || !confirmPassword) {
				errorMessage = "Please enter all fields.";
				return;
			}
			if (newPassword !== confirmPassword) {
				errorMessage = "Passwords do not match.";
				return;
			}
			await client.user.privacy.changePassword.mutate({
				oldPassword,
				newPassword,
			});
			resetPasswordModal();
			// more specific error messages
		} catch (error) {
			console.error(error);
			errorMessage = "Incorrect password.";
		}
	}

	async function handleSetPassword() {
		try {
			if (!newPassword || !confirmPassword) {
				errorMessage = "Please enter all fields.";
				return;
			}
			if (newPassword !== confirmPassword) {
				errorMessage = "Passwords do not match.";
				return;
			}
			await client.user.privacy.setPassword.mutate({
				password: newPassword,
			});
			resetPasswordModal();
			isPasswordSet = true;
		} catch (error) {
			console.error(error);
			if ((error as any).data?.zodError?.fieldErrors?.password) {
				if (
					error instanceof Error &&
					(error as any).data?.zodError?.fieldErrors?.password
				) {
					errorMessage = (error as any).data.zodError.fieldErrors
						.password[0];
				}
			} else if (error instanceof Error && error.message) {
				errorMessage = error.message;
			} else {
				errorMessage = "An unexpected error occurred.";
			}
		}
	}

	async function handleDownloadData() {
		try {
			const userData = await client.user.get.query();
			const user = userData.map((user) => ({
				name: user.name,
				email: user.email,
				avatar: user.avatar,
				oAuthProvider: user.oAuthProvider,
			}))[0];
			const blockedUsersList = await client.block.list.query();
			const blockedUsers = blockedUsersList.map((user) => ({
				username: user.name,
			}));
			const friendsList = await client.user.friends.list.query();
			const friends = friendsList.map((friend) => ({
				username: friend.name,
			}));
			const gamesList = await client.game.history.query();
			const games = gamesList.map((game) => ({
				createdAt: game.game.createdAt,
				updatedAt: game.game.updatedAt,
				maxPlayers: game.game.maxPlayers,
				players: game.players.map((player) => ({
					username: player.name,
					score: player.score,
				})),
			}));
			const messages = await client.chat.getAllSend.query();

			const data = {
				user,
				blockedUsers,
				friends,
				games,
				messages,
			};

			const blob = new Blob([JSON.stringify(data, null, 2)], {
				type: "application/json",
			});
			const url = URL.createObjectURL(blob);

			const a = document.createElement("a");
			a.href = url;
			a.download = "my-data.json";
			a.click();

			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Failed to download data:", error);
			alert("There was an error gathering your data.");
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

	function resetPasswordModal() {
		oldPassword = "";
		newPassword = "";
		confirmPassword = "";
		errorMessage = "";
		togglePasswordModal();
	}

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
	<div class="flex flex-col gap-5">
		<!-- Password Change UI -->
		<div
			class="flex justify-between items-center bg-white/5 p-4 rounded-lg transition duration-300 hover:bg-white/10"
		>
			<div class="text-left mr-4">
				<h3 class="text-lg font-semibold text-white mb-1">
					{isOAuth && !isPasswordSet
						? "Set Password"
						: "Change Password"}
				</h3>
				<p class="text-gray-400 text-sm">
					{isOAuth && !isPasswordSet
						? "Set a password for your account to enable regular login."
						: "Update your password to keep your account secure."}
				</p>
			</div>
			<button
				class="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-md transition duration-300 hover:bg-blue-600/10 cursor-pointer flex-shrink-0"
				onclick={togglePasswordModal}
			>
				{isOAuth && !isPasswordSet ? "Set Password" : "Change Password"}
			</button>
		</div>

		<!-- Toggle 2FA -->
		<div
			class="flex justify-between items-center bg-white/5 p-4 rounded-lg transition duration-300 hover:bg-white/10"
		>
			<div class="text-left">
				Toggle 2FA
				<p class="text-gray-400">
					Enable two-factor authentication for added security.
				</p>
			</div>
			<TWOFA />
		</div>

		<!-- Download Data -->
		<div
			class="flex justify-between items-center bg-white/5 p-4 rounded-lg transition duration-300 hover:bg-white/10"
		>
			<div class="text-left mr-4">
				<h3 class="text-lg font-semibold text-white mb-1">
					Download My Data
				</h3>
				<p class="text-gray-400 text-sm">
					Export a copy of your personal data.
				</p>
			</div>
			<button
				class="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-md transition duration-300 hover:bg-blue-600/10 cursor-pointer flex-shrink-0"
				onclick={handleDownloadData}
			>
				Download
			</button>
		</div>

		<div
			class="flex justify-between items-center bg-white/5 p-4 rounded-lg transition duration-300 hover:bg-red-100/10"
		>
			<div class="text-left mr-4">
				<h3 class="text-lg font-semibold text-red-400 mb-1">
					Delete Account
				</h3>
				<p class="text-gray-400 text-sm">
					Permanently delete your account and all associated data.
					Before proceeding, please review our <a
						href="/privacy-policy"
						class="text-blue-500 underline hover:text-blue-400"
						>Privacy Policy</a
					>
				</p>
			</div>
			<button
				class="bg-red-600/20 border border-red-500/30 text-red-300 px-4 py-2 rounded-md transition duration-300 hover:bg-red-600/40 hover:text-red-200 cursor-pointer flex-shrink-0"
				onclick={toggleDeleteModal}>Delete</button
			>
		</div>
	</div>

	{#if showPasswordModal}
		<button
			type="button"
			class="fixed inset-0 bg-black/70 backdrop-blur-sm z-10 cursor-pointer"
			onclick={togglePasswordModal}
			aria-label="Close modal"
			onkeydown={(e) => e.key === "Enter" && togglePasswordModal()}
		></button>
		<div
			class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/10 border border-white/10 rounded-xl p-6 shadow-[0_0_20px_rgba(0,255,255,0.05)] backdrop-blur-sm z-20 w-96 max-w-full"
		>
			<h2 class="text-xl text-white mb-4 text-center font-bold">
				{isOAuth && !isPasswordSet ? "Set Password" : "Change Password"}
			</h2>
			<p class="text-gray-300 mb-4 text-sm text-center">
				{isOAuth && !isPasswordSet
					? "Set a password for your account to enable regular login."
					: "Enter your current password and choose a new one."}
			</p>

			<div class="flex flex-col gap-3">
				{#if !(isOAuth && !isPasswordSet)}
					<input
						class="p-3 border border-gray-600/20 rounded-md bg-gray-700/20 text-white placeholder-gray-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
						type="password"
						placeholder="Current Password"
						bind:value={oldPassword}
					/>
				{/if}
				<input
					class="p-3 border border-gray-600/20 rounded-md bg-gray-700/20 text-white placeholder-gray-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
					type="password"
					placeholder="New Password"
					bind:value={newPassword}
				/>
				<input
					class="p-3 border border-gray-600/20 rounded-md bg-gray-700/20 text-white placeholder-gray-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
					type="password"
					placeholder="Confirm New Password"
					bind:value={confirmPassword}
				/>
			</div>

			{#if errorMessage}
				<p class="text-red-500 text-sm mt-2 text-center">
					{errorMessage}
				</p>
			{/if}

			<div class="flex justify-center gap-3 mt-4">
				<button
					class="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-md transition duration-300 hover:bg-blue-600/10 cursor-pointer"
					onclick={isOAuth && !isPasswordSet
						? handleSetPassword
						: handleChangePassword}
				>
					{isOAuth && !isPasswordSet ? "Set Password" : "Save"}
				</button>
				<button
					class="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-md transition duration-300 hover:bg-gray-700/10 cursor-pointer"
					onclick={togglePasswordModal}
				>
					Cancel
				</button>
			</div>
		</div>
	{/if}

	<!-- Download Data -->

	<!-- Delete Account Modal -->
	{#if showDeleteModal}
		<button
			type="button"
			class="fixed inset-0 bg-black/70 backdrop-blur-sm z-10 cursor-pointer"
			onclick={toggleDeleteModal}
			aria-label="Close modal"
		></button>
		<div
			class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/10 border border-white/10 rounded-xl p-6 shadow-[0_0_20px_rgba(255,0,0,0.1)] backdrop-blur-sm z-20 w-96 max-w-full"
		>
			<!-- Modal Header -->
			<div class="border-b border-gray-600 pb-4 mb-4 text-center">
				<h2 class="text-xl text-red-400 font-bold">
					Confirm Account Deletion
				</h2>
			</div>

			<!-- Modal Content -->
			<div class="text-center">
				<p class="text-gray-300 mb-4 text-sm">
					To proceed with account deletion, please enter your
					username. This action is irreversible.
				</p>

				<!-- Username Input -->
				<div class="flex flex-col items-center gap-3">
					<input
						id="username"
						class="p-3 border border-gray-600/20 rounded-md bg-gray-700/20 text-white placeholder-gray-400/60 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all w-full"
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
					class="bg-red-600/20 border border-red-500/30 text-red-300 px-4 py-2 rounded-md transition duration-300 hover:bg-red-600/40 hover:text-red-200 cursor-pointer"
					onclick={handleDeletion}>Delete</button
				>
				<button
					class="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-md transition duration-300 hover:bg-gray-700/10 cursor-pointer"
					onclick={toggleDeleteModal}>Cancel</button
				>
			</div>
		</div>
	{/if}
</section>
