<script lang="ts">
	export let name: string;
	export let avatar: string | null;
	let className = "";
	export { className as class };

	function getInitials(): string {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.substring(0, 2);
	}
</script>

{#if avatar}
	<img
		src={avatar}
		alt="{name}'s avatar"
		class="rounded-full object-cover border-2 border-double border-gray-400 {className}"
	/>
{:else}
	<div
		class=" rounded-full bg-blue-600 text-white flex items-center justify-center font-bold border-2 border-double border-gray-400 {className} select-none"
	>
		{getInitials()}
	</div>
{/if}
