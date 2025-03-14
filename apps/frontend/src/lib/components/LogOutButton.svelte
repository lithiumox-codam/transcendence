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

<button class="logout-button" onclick={handleLogout}>Log Out</button>

<style>
	.logout-button {
		position: absolute;
		left: 1.5rem;
		bottom: 1.5rem;
		padding: 12px 20px;
		font-size: 16px;
		font-weight: bold;
		text-align: center;
		border-radius: 6px;
		background: #8d8d8d;
		color: white;
		border: none;
		cursor: pointer;
		transition: all 0.3s;
		width: 200px;
	}

	.logout-button:hover {
		background: #b71c1c;
	}
</style>
