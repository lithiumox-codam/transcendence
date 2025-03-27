<script lang="ts">
	import { goto } from "$app/navigation";

	function handleLogout() {
		localStorage.removeItem("token");
		goto("/");
		setTimeout(() => {
			location.reload();
		}, 100);
	}
</script>

<button
	class="absolute left-6 bottom-6 px-4 py-3 text-lg font-bold text-center rounded-md bg-gray-600 text-white border-none cursor-pointer transition-all duration-300 w-52 hover:bg-red-700"
	onclick={handleLogout}
>
	Log Out
</button>
