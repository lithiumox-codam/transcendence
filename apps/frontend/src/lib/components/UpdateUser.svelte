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

<div>
	<!-- Error Message -->
	{#if errorMessage}
		<p class="text-red-500 text-sm">{errorMessage}</p>
	{/if}
	<form class="space-y-4" onsubmit={updateUserSubmit}>
		<div class="space-y-2">
			<label
				class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				for="email">Email</label
			>
			<input
				id="email"
				type="email"
				placeholder={user.email}
				class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				bind:value={email}
			/>

			<label
				class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				for="username">Username</label
			>
			<input
				id="username"
				type="text"
				placeholder={user.name}
				class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				bind:value={name}
			/>

			<label
				class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				for="avatar">Avatar</label
			>
			<div class="flex items-center gap-4">
				<input
					id="avatar"
					type="file"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					accept="image/png, image/jpeg"
					onchange={handleAvatarChange}
				/>
			</div>

			<!-- Buttons -->
			<div class="flex justify-start space-x-4 mt-4">
				<button
					type="submit"
					class="bg-blue-500 text-white px-4 py-2 rounded-md transition duration-300 hover:bg-blue-700"
				>
					Save
				</button>
				<button
					type="button"
					class="bg-gray-500 text-white px-4 py-2 rounded-md transition duration-300 hover:bg-gray-700"
					onclick={cancelEdit}
				>
					Cancel
				</button>
			</div>
		</div>
	</form>
</div>
