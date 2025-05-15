<script lang="ts">
	import "../app.css";

	let { children } = $props();
</script>

<main class="dark select-none">
	{@render children()}
</main>
