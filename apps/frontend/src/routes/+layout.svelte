<script lang="ts">
	import { Toaster } from "svelte-sonner";
	import "../app.css";

	let { children } = $props();
</script>

<main class="dark select-none">
	<Toaster position="bottom-left" richColors={true} theme="dark" />
	{@render children()}
</main>
