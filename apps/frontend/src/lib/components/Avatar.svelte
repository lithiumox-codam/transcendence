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

	function getColorFromInitials(): string {
		const hash = Array.from(name).reduce(
			(acc, char) => acc + char.charCodeAt(0),
			0,
		);
		const hue = (hash % 360) / 360;
		return `hsl(${hue * 360}, 100%, 50%)`;
	}
</script>

{#if avatar}
	<img
		src={avatar}
		alt="{name}'s avatar"
		class="rounded-full object-cover border-1 border-gray-400/30 aspect-square {className}"
	/>
{:else}
	<div
		class=" rounded-full text-white flex items-center justify-center font-bold border-1 border-gray-400/30 {className} select-none"
		style="background-color: {getColorFromInitials()}"
	>
		{getInitials()}
	</div>
{/if}
