<script lang="ts">
	import { getContext } from "svelte";
	import { UserClass } from "$lib/classes/User.svelte";
	import { goto } from "$app/navigation";

	const user = getContext<UserClass>("user");
</script>

<main class="py-10 px-6 max-w-5xl mx-auto">
	<!-- User Header Section -->
	<header
		class="flex items-center p-8 bg-gray-800 shadow-2xl border-b border-gray-600 rounded-lg"
	>
		<img
			class="w-24 h-24 rounded-full mr-8 border-4 border-double border-gray-400 filter drop-shadow"
			src={user.data?.avatar}
			alt="User Avatar"
		/>
		<div>
			<h1 class="text-3xl font-extrabold text-white drop-shadow">
				{user.data?.name}
			</h1>
			<p class="text-lg text-gray-300 italic">{user.data?.email}</p>
		</div>
	</header>
</main>
