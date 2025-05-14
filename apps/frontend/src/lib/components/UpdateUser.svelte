<script lang="ts">
	import { client } from "$lib/trpc";
	import type { User } from "@repo/database";
	import { createEventDispatcher } from "svelte";

	let email = $state<string | undefined>(undefined);
	let name = $state<string | undefined>(undefined);
	let avatarFile = $state<File | undefined>(undefined);

	let { user }: { user: User } = $props();

	let errorMessage = $state(""); // State for error message

	const dispatch = createEventDispatcher();

	const handleAvatarChange = (e: Event) => {
		const files = (e.target as HTMLInputElement).files;
		if (files && files[0]) {
			avatarFile = files[0];
		}
	};

	async function updateUserSubmit(event: Event) {
		event.preventDefault();
		errorMessage = ""; // Clear previous error message
		try {
			let avatar: string | undefined;
			if (avatarFile) {
				if (avatarFile.size > 10 * 1024 * 1024) {
					throw new Error("File size exceeds 10MB");
				}
				avatar = await new Promise<string>((resolve, reject) => {
					const reader = new FileReader();
					reader.onload = () => resolve(reader.result as string);
					reader.onerror = (error) => reject(error);
					reader.readAsDataURL(avatarFile as File);
				});
			}
			const res = await client.user.update.mutate({
				email,
				name,
				avatar,
			});
			console.log(res);

			// Dispatch an event to notify the parent component
			dispatch("updateComplete");
		} catch (error) {
			errorMessage =
				"Nothing to update or an error occurred. Please try again.";
			console.error(error);
		}
	}

	async function deleteAvatar() {
		try {
			const res = await client.user.deleteAvatar.mutate();
			console.log(res);

			// Notify parent to refresh the profile
			dispatch("updateComplete");
		} catch (error) {
			errorMessage = "Failed to delete avatar. Please try again.";
			console.error(error);
		}
	}

	function cancelEdit() {
		dispatch("updateComplete"); // Notify parent to exit edit mode
	}
</script>

<div
	class="relative bg-black/10 border border-white/10 rounded-xl p-6 shadow-[0_0_20px_rgba(0,255,255,0.05)] backdrop-blur-sm"
>
	<h2 class="text-2xl font-extrabold text-center text-white mb-6">
		Edit Profile
	</h2>
	<!-- Error Message -->
	{#if errorMessage}
		<p class="text-red-500 text-sm">{errorMessage}</p>
	{/if}
	<form class="space-y-4" onsubmit={updateUserSubmit}>
		<div class="space-y-2">
			<label
				class="block text-sm font-medium text-gray-300 mb-1"
				for="email">Email</label
			>
			<input
				id="email"
				type="email"
				placeholder={user.email}
				class="w-full px-4 py-2 bg-gray-700/20 border border-gray-600/20 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
				bind:value={email}
			/>

			<div>
				<label
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					for="username">Username</label
				>
				<input
					id="username"
					type="text"
					placeholder={user.name}
					class="w-full px-4 py-2 bg-gray-700/20 border border-gray-600/20 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
					bind:value={name}
				/>
			</div>

			<div>
				<label
					class="block text-sm font-medium text-gray-300 mb-1"
					for="avatar">Avatar</label
				>
				<input
					id="avatar"
					type="file"
					class="w-full px-4 py-2 bg-gray-700/20 border border-gray-600/20 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
					accept="image/png, image/jpeg"
					onchange={handleAvatarChange}
				/>
			</div>

			<!-- Buttons -->
			<div class="flex justify-start space-x-4 mt-4">
				<button
					type="submit"
					class="bg-white/5 border border-white/10 text-white px-4 py-2 transition duration-300 hover:bg-blue-600/10 cursor-pointer p-2.5 rounded-md"
				>
					Save
				</button>
				<button
					type="button"
					class="bg-white/5 border border-white/10 p-2.5 rounded-md hover:bg-gray-700/10 cursor-pointer"
					onclick={cancelEdit}
				>
					Cancel
				</button>
			</div>
		</div>
	</form>
</div>
