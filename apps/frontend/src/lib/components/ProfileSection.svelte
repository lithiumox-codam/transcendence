<script lang="ts">
	import { getContext } from "svelte";
	import { UserClass } from "$lib/classes/User.svelte";
	import Avatar from "$lib/components/Avatar.svelte";
	import { client } from "$lib/trpc";
	import UpdateUser from "$lib/components/UpdateUser.svelte";
	import { Trash2 } from "@lucide/svelte";

	const user = getContext<UserClass>("user");

	let editMode = $state(false);
	let errorMessage = $state("");

	async function deleteAvatar() {
		try {
			await client.user.deleteAvatar.mutate();
			if (user.data) {
				user.data.avatar = null;
			}
		} catch (error) {
			errorMessage = "Failed to delete avatar. Please try again.";
			console.error(error);
		}
	}
</script>

{#if user.data}
	<main class="relative min-h-screen text-white">
		{#if editMode}
			<section class="px-6 py-12 max-w-5xl mx-auto">
				<header
					class="flex items-center justify-between p-8 bg-gray-950 rounded-xl shadow-lg border border-gray-800 mb-8"
				>
					<UpdateUser
						user={user.data}
						on:updateComplete={() => (editMode = false)}
					/>
				</header>
			</section>
		{:else}
			<section class="px-6 py-12 max-w-5xl mx-auto">
				<header
					class="flex items-center justify-between p-8 bg-gray-950 rounded-xl shadow-lg border border-gray-800 mb-8 relative"
				>
					<div class="flex items-center relative">
						<div class="relative group">
							<Avatar
								name={user.data.name}
								avatar={user.data.avatar}
								class="w-24 h-24 mr-6 text-3xl"
							/>
							{#if user.data.avatar}
								<button
									class="absolute top-16 right-3 bg-red-500/50 text-white p-2 rounded-full hover:bg-red-700/70 transition duration-300 opacity-0 group-hover:opacity-100"
									onclick={deleteAvatar}
									aria-label="Delete Avatar"
								>
									<Trash2 class="w-4 h-4" />
								</button>
							{/if}
						</div>
						<div>
							<h1 class="text-3xl font-extrabold text-white">
								{user.data.name}
							</h1>
							<p class="text-lg text-gray-400 italic">
								{user.data.email}
							</p>
						</div>
					</div>
					<button
						class="bg-blue-500 text-white px-4 py-2 rounded-md transition duration-300 hover:bg-blue-700"
						onclick={() => (editMode = true)}
					>
						Edit Profile
					</button>
				</header>
			</section>
		{/if}
	</main>
{:else}
	<p class="text-center text-gray-400">No user data available.</p>
{/if}
