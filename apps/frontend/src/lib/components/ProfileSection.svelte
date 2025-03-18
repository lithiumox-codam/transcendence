<script lang="ts">
	import { getContext } from "svelte";
	import { UserClass } from "$lib/classes/User.svelte";
	import { goto } from "$app/navigation";

	const user = getContext<UserClass>("user");

	function viewProfile(userId: number) {
		goto(`/user/${userId}`);
	}
</script>

<main class="py-10 px-6 max-w-5xl mx-auto">
	<!-- User Header Section -->
	<header
		class="flex items-center p-8 bg-gray-800 shadow-2xl border-b border-gray-600 rounded-lg"
	>
		<img
			class="w-24 h-24 rounded-full mr-8 border-4 border-double border-gray-400 filter drop-shadow"
			src="/favicon.png"
			alt="User Avatar"
		/>
		<div>
			<h1 class="text-3xl font-extrabold text-white drop-shadow">
				{user.data?.name}
			</h1>
			<p class="text-lg text-gray-300 italic">{user.data?.email}</p>
			<button class="edit-button mt-4">Edit Profile</button>
		</div>
	</header>

	<!-- Bio -->
	<section
		class="mt-8 bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-600"
	>
		<h2 class="text-2xl font-semibold mb-4 text-white">Bio</h2>
		<button class="edit-button mt-4">Edit Bio</button>
	</section>
</main>

<!-- Styles -->
<style>
	.edit-button {
		padding: 8px 16px;
		font-size: 14px;
		font-weight: bold;
		background: #007bff;
		color: white;
		border-radius: 6px;
		transition: all 0.3s;
	}
	.edit-button:hover {
		background: #0056b3;
	}
</style>
