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
	class=" px-2 py-2 text-lg font-bold text-center rounded-md bg-gray-600/20 text-white border-none cursor-pointer transition-all duration-300 hover:bg-red-600/30"
	onclick={handleLogout}
>
	Log Out
</button>
