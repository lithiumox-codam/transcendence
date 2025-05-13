<script lang="ts">
	import "../app.css";

	let { children } = $props();
</script>

<main class="dark">
	{@render children()}
</main>
